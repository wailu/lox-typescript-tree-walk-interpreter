import { match, P } from "ts-pattern";
import { Declaration, IfStmt, WhileStmt } from "../../../Parser/types";
import evaluateAST, { isTruthy } from "../../../Parser/utils/evaluateAST";
import Environment, { Value } from "../../Environment";

function stringify(value: unknown) {
  return match(value)
    .with(P.nullish, () => "nil")
    .with(P.string, (value) => `"${value}"`)
    .with({ stringRepr: P.string }, ({ stringRepr }) => stringRepr)
    .otherwise(() => `${value}`);
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
    .with(
      { funName: P._, funBody: P._, params: P._ },
      ({ funName, funBody, params }) => {
        const newEnv = new Environment(env);
        const call = (args: Value[]) => {
          params.forEach((param, index) =>
            newEnv.define(param.lexeme, args[index])
          );

          executeStmt(funBody, newEnv);
          return null;
        };

        env.define(funName.lexeme, {
          arity: params.length,
          call,
          stringRepr: `<fn ${funName.lexeme}>`,
        });
      }
    )
    .exhaustive();
}

export default executeStmt;
