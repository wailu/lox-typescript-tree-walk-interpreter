import { match, P } from "ts-pattern";
import { Token, TokenName } from "../Scanner/types";
import {
  Unary,
  Binary,
  Grouping,
  Expr,
  Declaration,
  Identifier,
  IfStmt,
  WhileStmt,
  Operator,
  Set,
  Assign,
  This,
} from "../Parser/types";
import Environment, { LoxCallable, Value } from "./Environment";

class Return {
  value: Value;

  constructor(value: Value) {
    this.value = value;
  }
}

export class RuntimeError extends Error {
  token: Token;

  constructor(token: Token, message: string) {
    super(message);
    Object.setPrototypeOf(this, RuntimeError.prototype);
    this.token = token;
  }
}

function stringify(value: unknown) {
  return match(value)
    .with(P.nullish, () => "nil")
    .with(P.string, (value) => `"${value}"`)
    .with({ stringRepr: P.string }, ({ stringRepr }) => stringRepr)
    .otherwise(() => `${value}`);
}

class Interpreter {
  private env: Environment;
  private errorCallback: (line: number, message: string) => void;

  constructor(errorCallback: (line: number, message: string) => void) {
    this.env = new Environment();
    this.errorCallback = errorCallback;

    this.injectNativeFunctions();
  }

  private injectNativeFunctions() {
    this.env.define("clock", {
      arity: 0,
      call: () => performance.now() / 1000,
      stringRepr: "<native fn>",
    });
  }

  interpret(
    statements: Declaration[],
    sideTable: Map<Identifier | This, number>
  ) {
    try {
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        this.executeStmt(statement, this.env, sideTable);
      }
    } catch (err) {
      if (err instanceof RuntimeError) {
        this.errorCallback(err.token.line, err.message);
      }
    }
  }

  private executeStmt(
    statement: Declaration,
    env: Environment,
    sideTable: Map<Identifier | This, number>
  ) {
    return match(statement)
      .with({ stmtType: "PRINT" }, ({ expr }) => {
        const value = this.evaluateAST(expr, env, sideTable);
        console.log(stringify(value));
        return null;
      })
      .with({ stmtType: "EXPR" }, ({ expr }) => {
        this.evaluateAST(expr, env, sideTable);
        return null;
      })
      .with({ identifier: P._ }, ({ identifier, initialiser }) => {
        const initialValue = initialiser
          ? this.evaluateAST(initialiser, env, sideTable)
          : null;
        env.define(identifier.lexeme, initialValue);
        return null;
      })
      .with({ statements: P._ }, ({ statements }) => {
        const newEnv = new Environment(env);
        for (let i = 0; i < statements.length; i++) {
          try {
            this.executeStmt(statements[i], newEnv, sideTable);
          } catch (ret) {
            if (ret instanceof Return) return ret.value;
            throw ret; // not a return value, throw it
          }
        }
        return null;
      })
      .with(
        { condition: P._, consequent: P._, alternative: P._ },
        ({ condition, consequent, alternative }: IfStmt) => {
          if (!!this.evaluateAST(condition, env, sideTable))
            this.executeStmt(consequent, env, sideTable);
          else if (!!alternative) this.executeStmt(alternative, env, sideTable);

          return null;
        }
      )
      .with({ condition: P._, body: P._ }, ({ condition, body }: WhileStmt) => {
        while (this.isTruthy(this.evaluateAST(condition, env, sideTable)))
          this.executeStmt(body, env, sideTable);
        return null;
      })
      .with(
        { funName: P._, funBody: P._, params: P._ },
        ({ funName, funBody, params }) => {
          const call = (args: Value[]) => {
            const newEnv = new Environment(env);
            params.forEach((param, index) =>
              newEnv.define(param.lexeme, args[index])
            );

            return this.executeStmt(funBody, newEnv, sideTable);
          };

          env.define(funName.lexeme, {
            arity: params.length,
            call,
            stringRepr: `<fn ${funName.lexeme}>`,
          });

          return null;
        }
      )
      .with({ stmtType: "RETURN" }, ({ expr }) => {
        const returnValue = this.evaluateAST(expr, env, sideTable);
        throw new Return(returnValue);
      })
      .with({ className: P._ }, ({ className, methods }) => {
        const methodStore = new Map<string, LoxCallable>();

        for (let i = 0; i < methods.length; i++) {
          const method = methods[i];
          const { params, funName, funBody } = method;
          methodStore.set(funName.lexeme, {
            arity: methods[i].params.length,
            call: (args: Value[], env: Environment) => {
              const newEnv = new Environment(env);
              params.forEach((param, index) =>
                newEnv.define(param.lexeme, args[index])
              );

              return this.executeStmt(funBody, newEnv, sideTable);
            },
            stringRepr: `<${className.lexeme} method ${funName.lexeme}>`,
          });
        }

        const klass = {
          arity: 0,
          stringRepr: className.lexeme,
          call: () => {
            const fieldStore = new Map<string, Value>();

            const instance = {
              fieldStore,
              access: (property: Identifier) => {
                if (fieldStore.has(property.lexeme))
                  return fieldStore.get(property.lexeme) as Value;

                if (methodStore.has(property.lexeme)) {
                  const { arity, call, stringRepr } = methodStore.get(
                    property.lexeme
                  )!;

                  return {
                    arity,
                    call: (args: Value[], env: Environment) => {
                      const newEnv = new Environment(env);
                      newEnv.define("this", instance);
                      return call(args, newEnv);
                    },
                    stringRepr,
                  };
                }

                throw new RuntimeError(
                  property,
                  `Undefined property ${property.lexeme}`
                );
              },
              put: (property: Identifier, value: Value) => {
                fieldStore.set(property.lexeme, value);
              },
              stringRepr: `${className.lexeme} instance`,
            };

            return instance;
          },
        };

        env.define(className.lexeme, klass);
        return null;
      })
      .exhaustive();
  }

  private evaluateAST(
    expr: Expr,
    env: Environment,
    sideTable: Map<Identifier | This, number>
  ): Value {
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
        const value = this.evaluateAST(expr, env, sideTable);

        switch (op.tokenName) {
          case TokenName.MINUS:
            this.checkNumberOperand(op, value);
            return -1 * Number(value);
          case TokenName.BANG:
            return !this.isTruthy(value);
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
          const left = this.evaluateAST(leftExpr, env, sideTable);
          const right = this.evaluateAST(rightExpr, env, sideTable);

          switch (op.tokenName) {
            case TokenName.MINUS:
              this.checkNumberOperands(op, left, right);
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
              this.checkNumberOperands(op, left, right);
              return Number(left) / Number(right);
            case TokenName.STAR:
              this.checkNumberOperands(op, left, right);
              return Number(left) * Number(right);
            case TokenName.GREATER:
              this.checkNumberOperands(op, left, right);
              return Number(left) > Number(right);
            case TokenName.GREATER_EQUAL:
              this.checkNumberOperands(op, left, right);
              return Number(left) >= Number(right);
            case TokenName.LESS:
              this.checkNumberOperands(op, left, right);
              return Number(left) < Number(right);
            case TokenName.LESS_EQUAL:
              this.checkNumberOperands(op, left, right);
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
          const left = this.evaluateAST(leftExpr, env, sideTable);

          switch (op.tokenName) {
            case TokenName.AND: {
              if (!this.isTruthy(left)) return left;
              return this.evaluateAST(rightExpr, env, sideTable);
            }
            case TokenName.OR: {
              if (this.isTruthy(left)) return left;
              return this.evaluateAST(rightExpr, env, sideTable);
            }
          }
        }
      )
      .with({ expr: P._ }, ({ expr }: Grouping) =>
        this.evaluateAST(expr, env, sideTable)
      )
      .with({ variable: P._ }, ({ variable }) => {
        return this.lookUpVariable(env, variable, sideTable);
      })
      .with(
        { assignVar: P._, assignExpr: P._ },
        ({ assignVar, assignExpr }: Assign) => {
          const value = this.evaluateAST(assignExpr, env, sideTable);
          return this.assignVariable(env, assignVar, sideTable, value);
        }
      )
      .with(
        { callee: P._, endToken: P._, args: P._ },
        ({ callee, endToken, args }) => {
          return match(this.evaluateAST(callee, env, sideTable))
            .with({ arity: P.number, call: P._ }, ({ arity, call }) => {
              if (args.length !== arity) {
                throw new RuntimeError(
                  endToken,
                  `Expected ${arity} arguments but got ${args.length}.`
                );
              }

              return call(
                args.map((arg) => this.evaluateAST(arg, env, sideTable)),
                env
              );
            })
            .otherwise(() => {
              throw new RuntimeError(
                endToken,
                "Can only call functions and classes."
              );
            });
        }
      )
      .with({ before: P._ }, ({ before, token, field }) => {
        const obj = this.evaluateAST(before, env, sideTable);

        return match(obj)
          .with({ fieldStore: P._ }, ({ access }) => {
            return access(field);
          })
          .otherwise(() => {
            throw new RuntimeError(token, "Only instances have properties.");
          });
      })
      .with(
        { assignTo: P._, assignExpr: P._ },
        ({ assignTo: { before, field, token }, assignExpr }: Set) => {
          const obj = this.evaluateAST(before, env, sideTable);

          return match(obj)
            .with({ fieldStore: P._ }, ({ put }) => {
              const value = this.evaluateAST(assignExpr, env, sideTable);
              put(field, value);
              return value;
            })
            .otherwise(() => {
              throw new RuntimeError(token, "Only instances have fields");
            });
        }
      )
      .with({ tokenName: TokenName.THIS }, (token) => {
        return this.lookUpVariable(env, token, sideTable);
      })
      .exhaustive();
  }

  private isTruthy(value: unknown): boolean {
    if (value === null) return false;
    if (typeof value === "boolean") return !!value;
    return true;
  }

  private checkNumberOperands(
    operator: Operator,
    leftOperand: unknown,
    rightOperand: unknown
  ) {
    if (typeof leftOperand === "number" && typeof rightOperand === "number")
      return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private checkNumberOperand(operator: Operator, operand: unknown) {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private lookUpVariable(
    curr: Environment,
    identifier: Identifier | This,
    sideTable: Map<Identifier | This, number>
  ) {
    return this.searchEnv(curr, identifier, sideTable).get(identifier);
  }

  private assignVariable(
    curr: Environment,
    identifier: Identifier,
    sideTable: Map<Identifier | This, number>,
    value: Value
  ) {
    return this.searchEnv(curr, identifier, sideTable).assign(
      identifier,
      value
    );
  }

  private searchEnv(
    curr: Environment,
    identifier: Identifier | This,
    sideTable: Map<Identifier | This, number>
  ) {
    if (!sideTable.has(identifier)) return this.env;

    const depth = sideTable.get(identifier)!;

    let c: Environment | null = curr;

    for (let i = 0; i < depth; i++) {
      c = c?.getEnclosingEnv() ?? null;
    }

    return c ?? this.env;
  }
}

export default Interpreter;
