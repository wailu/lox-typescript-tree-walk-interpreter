import { Variable } from "../../Parser/types";
import { RuntimeError } from "../../Parser/utils/evaluateAST";

type Value = string | number | boolean | null;

class Environment {
  private values: Map<string, Value>;
  private enclosing: Environment | null;

  constructor(enclosing?: Environment) {
    this.values = new Map<string, Value>();
    this.enclosing = enclosing ?? null;
  }

  define(name: string, value: Value) {
    this.values.set(name, value);
  }

  get(variable: Variable): Value {
    if (this.values.has(variable.lexeme))
      return this.values.get(variable.lexeme) as Value;

    if (this.enclosing) return this.enclosing.get(variable);

    throw new RuntimeError(
      variable,
      `Undefined variable "${variable.lexeme}".`
    );
  }

  assign(variable: Variable, value: Value) {
    if (this.values.has(variable.lexeme)) {
      this.values.set(variable.lexeme, value);
      return value;
    }

    if (this.enclosing) {
      this.enclosing.assign(variable, value);
      return value;
    }

    throw new RuntimeError(
      variable,
      `Undefined variable "${variable.lexeme}".`
    );
  }
}

export default Environment;
