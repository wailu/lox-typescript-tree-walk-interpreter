import { match, P } from "ts-pattern";
import { TokenName } from "../../../Scanner/types";
import { Unary, Binary, Grouping, Expr } from "../../types";

function evaluateAST(expr: Expr): string | number | boolean | null {
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
      const value = evaluateAST(expr);

      switch (op.tokenName) {
        case TokenName.MINUS:
          return -1 * Number(value);
        case TokenName.BANG:
          return !Boolean(value);
      }

      return null;
    })
    .with(
      { leftExpr: P._, rightExpr: P._, op: P._ },
      ({ leftExpr, rightExpr, op }: Binary) => {
        const left = evaluateAST(leftExpr);
        const right = evaluateAST(rightExpr);

        switch (op.tokenName) {
          case TokenName.MINUS:
            return Number(left) - Number(right);
          case TokenName.PLUS: {
            if (typeof left === "string" && typeof right === "string")
              return String(left) + String(right);
            if (typeof left === "number" && typeof right === "number")
              return Number(left) + Number(right);
            break;
          }
          case TokenName.SLASH:
            return Number(left) / Number(right);
          case TokenName.STAR:
            return Number(left) * Number(right);
          case TokenName.GREATER:
            return Number(left) > Number(right);
          case TokenName.GREATER_EQUAL:
            return Number(left) >= Number(right);
          case TokenName.LESS:
            return Number(left) < Number(right);
          case TokenName.LESS_EQUAL:
            return Number(left) <= Number(right);
          case TokenName.BANG_EQUAL:
            return left !== right;
          case TokenName.EQUAL_EQUAL:
            return left === right;
        }

        return null;
      }
    )
    .with({ expr: P._ }, ({ expr }: Grouping) => evaluateAST(expr))
    .exhaustive();
}

export default evaluateAST;
