import { Declaration } from "../Parser/types";
import { RuntimeError } from "../Parser/utils/evaluateAST";
import executeStmt from "./utils/executeStmt";
import Environment from "./Environment";

class Interpreter {
  private env: Environment;
  private errorCallback: (line: number, message: string) => void;

  constructor(errorCallback: (line: number, message: string) => void) {
    this.env = new Environment();
    this.errorCallback = errorCallback;
  }

  interpret(statements: Declaration[]) {
    try {
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        executeStmt(statement, this.env);
      }
    } catch (err) {
      if (err instanceof RuntimeError) {
        this.errorCallback(err.token.line, err.message);
      }
    }
  }
}

export default Interpreter;
