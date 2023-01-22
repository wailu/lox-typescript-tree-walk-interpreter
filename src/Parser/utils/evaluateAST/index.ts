import { match, P } from "ts-pattern";
import { Token, TokenName } from "../../../Scanner/types";
import { Unary, Binary, Grouping, Expr, Operator } from "../../types";
import Environment, { Value } from "../../../Interpreter/Environment";

export class RuntimeError extends Error {
  token: Token;

  constructor(token: Token, message: string) {
    super(message);
    Object.setPrototypeOf(this, RuntimeError.prototype);
    this.token = token;
  }
}

function checkNumberOperand(operator: Operator, operand: unknown) {
  if (typeof operand === "number") return;
  throw new RuntimeError(operator, "Operand must be a number.");
}

function checkNumberOperands(
  operator: Operator,
  leftOperand: unknown,
  rightOperand: unknown
) {
  if (typeof leftOperand === "number" && typeof rightOperand === "number")
    return;
  throw new RuntimeError(operator, "Operands must be numbers.");
}

// lox's interpretation of truthiness
export function isTruthy(value: unknown): boolean {
  if (value === null) return false;
  if (typeof value === "boolean") return !!value;
  return true;
}

function evaluateAST(expr: Expr, env: Environment): Value {
  return match(expr)
    .with(
      { tokenName: TokenName.STRING },
      { tokenName: TokenName.NUMBER },
      ({ literal }) => literal
    )
    .with({ tokenName: TokenName.TRUE }, () => true)
    .with({ tokenName: TokenName.FALSE }, () => false)
    .with({ tokenName: TokenName.NIL }, () => null)
    .with({ expr: P._, op: P._ }, ({ expr, op }: Unary) => {
      const value = evaluateAST(expr, env);

      switch (op.tokenName) {
        case TokenName.MINUS:
          checkNumberOperand(op, value);
          return -1 * Number(value);
        case TokenName.BANG:
          return !isTruthy(value);
      }

      return null;
    })
    .with(
      {
        leftExpr: P._,
        rightExpr: P._,
        op: { tokenName: P.not(P.union(TokenName.AND, TokenName.OR)) },
      },
      ({ leftExpr, rightExpr, op }: Binary) => {
        const left = evaluateAST(leftExpr, env);
        const right = evaluateAST(rightExpr, env);

        switch (op.tokenName) {
          case TokenName.MINUS:
            checkNumberOperands(op, left, right);
            return Number(left) - Number(right);
          case TokenName.PLUS: {
            if (typeof left === "string" && typeof right === "string")
              return String(left) + String(right);
            if (typeof left === "number" && typeof right === "number")
              return Number(left) + Number(right);
            throw new RuntimeError(
              op,
              "Operands must be two numbers or two strings."
            );
          }
          case TokenName.SLASH:
            checkNumberOperands(op, left, right);
            return Number(left) / Number(right);
          case TokenName.STAR:
            checkNumberOperands(op, left, right);
            return Number(left) * Number(right);
          case TokenName.GREATER:
            checkNumberOperands(op, left, right);
            return Number(left) > Number(right);
          case TokenName.GREATER_EQUAL:
            checkNumberOperands(op, left, right);
            return Number(left) >= Number(right);
          case TokenName.LESS:
            checkNumberOperands(op, left, right);
            return Number(left) < Number(right);
          case TokenName.LESS_EQUAL:
            checkNumberOperands(op, left, right);
            return Number(left) <= Number(right);
          case TokenName.BANG_EQUAL:
            return left !== right;
          case TokenName.EQUAL_EQUAL:
            return left === right;
        }

        return null;
      }
    )
    .with(
      {
        leftExpr: P._,
        rightExpr: P._,
        op: { tokenName: P.union(TokenName.AND, TokenName.OR) },
      },
      ({ leftExpr, rightExpr, op }) => {
        const left = evaluateAST(leftExpr, env);

        switch (op.tokenName) {
          case TokenName.AND: {
            if (!isTruthy(left)) return left;
            return evaluateAST(rightExpr, env);
          }
          case TokenName.OR: {
            if (isTruthy(left)) return left;
            return evaluateAST(rightExpr, env);
          }
        }
      }
    )
    .with({ expr: P._ }, ({ expr }: Grouping) => evaluateAST(expr, env))
    .with({ variable: P._ }, ({ variable }) => env.get(variable))
    .with({ assignVar: P._, assignExpr: P._ }, ({ assignVar, assignExpr }) => {
      const value = evaluateAST(assignExpr, env);
      return env.assign(assignVar, value);
    })
    .with(
      { callee: P._, endToken: P._, args: P._ },
      ({ callee, endToken, args }) => {
        return match(evaluateAST(callee, env))
          .with({ arity: P.number, call: P._ }, ({ arity, call }) => {
            if (args.length !== arity) {
              throw new RuntimeError(
                endToken,
                `Expected ${arity} arguments but got ${args.length}.`
              );
            }

            return call(args.map((arg) => evaluateAST(arg, env)));
          })
          .otherwise(() => {
            throw new RuntimeError(
              endToken,
              "Can only call functions and classes."
            );
          });
      }
    )
    .exhaustive();
}

export default evaluateAST;
