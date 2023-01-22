import { match, P } from "ts-pattern";
import { Declaration, IfStmt, WhileStmt } from "../../../Parser/types";
import evaluateAST, { isTruthy } from "../../../Parser/utils/evaluateAST";
import Environment, { Value } from "../../Environment";

class Return {
  value: Value;

  constructor(value: Value) {
    this.value = value;
  }
}

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
      return null;
    })
    .with({ stmtType: "EXPR" }, ({ expr }) => {
      evaluateAST(expr, env);
      return null;
    })
    .with({ identifier: P._ }, ({ identifier, initialiser }) => {
      const initialValue = initialiser ? evaluateAST(initialiser, env) : null;
      env.define(identifier.lexeme, initialValue);
      return null;
    })
    .with({ statements: P._ }, ({ statements }) => {
      const newEnv = new Environment(env);
      for (let i = 0; i < statements.length; i++) {
        try {
          executeStmt(statements[i], newEnv);
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
        if (!!evaluateAST(condition, env)) executeStmt(consequent, env);
        else if (!!alternative) executeStmt(alternative, env);

        return null;
      }
    )
    .with({ condition: P._, body: P._ }, ({ condition, body }: WhileStmt) => {
      while (isTruthy(evaluateAST(condition, env))) executeStmt(body, env);
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

          return executeStmt(funBody, newEnv);
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
      const returnValue = evaluateAST(expr, env);
      throw new Return(returnValue);
    })
    .exhaustive();
}

export default executeStmt;
