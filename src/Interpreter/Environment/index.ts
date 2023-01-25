import { Identifier } from "../../Parser/types";
import { RuntimeError } from "../../Interpreter";

type LoxCallable = {
  arity: number;
  call: (args: Value[]) => Value;
  stringRepr: string;
};

type LoxInstance = {
  map: Map<string, Value>;
  stringRepr: string;
};

export type Value =
  | string
  | number
  | boolean
  | null
  | LoxCallable
  | LoxInstance;

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

  get(variable: Identifier): Value {
    if (this.values.has(variable.lexeme))
      return this.values.get(variable.lexeme) as Value;

    if (this.enclosing) return this.enclosing.get(variable);

    throw new RuntimeError(
      variable,
      `Undefined variable "${variable.lexeme}".`
    );
  }

  assign(variable: Identifier, value: Value) {
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

  getEnclosingEnv() {
    return this.enclosing;
  }
}

export default Environment;
