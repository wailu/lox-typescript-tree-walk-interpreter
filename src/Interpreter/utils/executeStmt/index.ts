import { match, P } from "ts-pattern";
import { Declaration, IfStmt, WhileStmt } from "../../../Parser/types";
import evaluateAST, { isTruthy } from "../../../Parser/utils/evaluateAST";
import Environment from "../../Environment";

function stringify(value: unknown) {
  if (value === null) return "nil";
  if (typeof value === "string") return `"${value}"`;
  return `${value}`;
}

function executeStmt(statement: Declaration, env: Environment) {
  return match(statement)
    .with({ stmtType: "PRINT" }, ({ expr }) => {
      const value = evaluateAST(expr, env);
      console.log(stringify(value));
    })
    .with({ stmtType: "EXPR" }, ({ expr }) => {
      evaluateAST(expr, env);
    })
    .with({ identifier: P._ }, ({ identifier, initialiser }) => {
      const initialValue = initialiser ? evaluateAST(initialiser, env) : null;
      env.define(identifier.lexeme, initialValue);
    })
    .with({ statements: P._ }, ({ statements }) => {
      const newEnv = new Environment(env);
      for (let i = 0; i < statements.length; i++) {
        executeStmt(statements[i], newEnv);
      }
    })
    .with(
      { condition: P._, consequent: P._, alternative: P._ },
      ({ condition, consequent, alternative }: IfStmt) => {
        if (!!evaluateAST(condition, env)) executeStmt(consequent, env);
        else if (!!alternative) executeStmt(alternative, env);
      }
    )
    .with({ condition: P._, body: P._ }, ({ condition, body }: WhileStmt) => {
      while (isTruthy(evaluateAST(condition, env))) executeStmt(body, env);
    })
    .exhaustive();
}

export default executeStmt;
