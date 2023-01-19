import { match } from "ts-pattern";
import { Stmt } from "../../types";
import evaluateAST from "../evaluateAST";

function stringify(value: unknown) {
  if (value === null) return "nil";
  if (typeof value === "string") return `"${value}"`;
  return `${value}`;
}

function executeStmt(statement: Stmt) {
  return match(statement)
    .with({ stmtType: "PRINT" }, ({ expr }) => {
      const value = evaluateAST(expr);
      console.log(stringify(value));
    })
    .with({ stmtType: "EXPR" }, ({ expr }) => {
      evaluateAST(expr);
    })
    .exhaustive();
}

export default executeStmt;
