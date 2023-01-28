import { Identifier, This } from "../../Parser/types";
import { RuntimeError } from "../../Interpreter";

export type LoxMethod = {
  arity: number;
  bind: (instance: LoxInstance) => LoxCallable["call"];
  stringRepr: string;
  isInitialiser: boolean;
};

type LoxCallable = {
  arity: number;
  call: (args: Value[]) => Value;
  stringRepr: string;
  isInitialiser: boolean;
};

type LoxInstance = {
  fieldStore: Map<string, Value>;
  stringRepr: string;
  access: (identifier: Identifier) => Value;
  put: (identifier: Identifier, value: Value) => void;
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

  get(variable: Identifier | This): Value {
    if (this.values.has(variable.lexeme))
      return this.values.get(variable.lexeme) as Value;

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
