import { match, P } from "ts-pattern";
import { Operator, Literal, Unary, Binary, Grouping, Expr } from "../../types";

function printAST(expr: Expr): string {
  return match(expr)
    .with({ lexeme: P._ }, ({ lexeme }: Operator | Literal) => lexeme)
    .with(
      { op: P._, expr: P._ },
      ({ op, expr }: Unary) => `(${op.lexeme} ${printAST(expr)})`
    )
    .with(
      { op: P._, leftExpr: P._, rightExpr: P._ },
      ({ op, leftExpr, rightExpr }: Binary) =>
        `(${op.lexeme} ${printAST(leftExpr)} ${printAST(rightExpr)})`
    )
    .with({ expr: P._ }, ({ expr }: Grouping) => printAST(expr))
    .exhaustive();
}

export default printAST;
