import { match, P } from "ts-pattern";
import { Token, TokenName } from "../Scanner/types";
import {
  Declaration,
  Expr,
  WhileStmt,
  Identifier,
  Set,
  This,
  SuperToken,
  FunDeclaration,
} from "../Parser/types";

enum FunctionType {
  NONE,
  FUNCTION,
  METHOD,
  INITIALISER,
}

enum ClassType {
  NONE,
  CLASS,
}

type FunDeclarationWithFunctionType = FunDeclaration & {
  functionType?: FunctionType;
};

type ToResolve =
  | Exclude<Declaration, FunDeclaration>
  | FunDeclarationWithFunctionType;

class Resolver {
  private scopes: Map<string, boolean>[];
  private locals: Map<Identifier | This | SuperToken, number>;
  private resolverErrorCallback: (
    token: Exclude<Token, { tokenName: TokenName.EOF }>,
    message: string
  ) => void;
  private currentFunctionType = FunctionType.NONE;
  private currentClassType = ClassType.NONE;

  constructor(
    resolverErrorCallback: (
      token: Exclude<Token, { tokenName: TokenName.EOF }>,
      message: string
    ) => void
  ) {
    this.scopes = [];
    this.locals = new Map<Identifier, number>();
    this.resolverErrorCallback = resolverErrorCallback;
  }

  resolve(
    statements: ToResolve[]
  ): Map<Identifier | This | SuperToken, number> {
    this.locals.clear();
    for (let i = 0; i < statements.length; i++) this.resolveStmt(statements[i]);
    return this.locals;
  }

  private resolveStmt(statement: ToResolve): void {
    return match(statement)
      .with({ stmtType: P.union("PRINT", "EXPR") }, ({ expr }) =>
        this.resolveExpr(expr)
      )
      .with({ stmtType: "RETURN" }, ({ expr, token }) => {
        if (this.currentFunctionType === FunctionType.NONE)
          this.resolverErrorCallback(
            token,
            "Can't return from top-level code."
          );

        match(expr)
          .with(
            { tokenName: P.not(TokenName.NIL) },
            () => this.currentFunctionType === FunctionType.INITIALISER,
            () =>
              this.resolverErrorCallback(
                token,
                "Can't return a value from an initialiser"
              )
          )
          .otherwise(() => {});

        this.resolveExpr(expr);
      })
      .with({ statements: P._ }, ({ statements }) => {
        this.beginScope();
        for (let i = 0; i < statements.length; i++) {
          this.resolveStmt(statements[i]);
        }
        this.endScope();
      })
      .with(
        { identifier: P._, initialiser: P._ },
        ({ identifier, initialiser }) => {
          this.declareVar(identifier);
          if (initialiser) this.resolveExpr(initialiser);
          this.defineVar(identifier);
        }
      )
      .with(
        { funName: P._, params: P._, funBody: P._ },
        ({
          funName,
          params,
          funBody,
          functionType = FunctionType.FUNCTION,
        }) => {
          this.declareVar(funName);
          // define name eagerly to allow recursive definitions
          this.defineVar(funName);

          const enclosingFunctionType = this.currentFunctionType;
          this.currentFunctionType = functionType;

          this.beginScope();
          for (let i = 0; i < params.length; i++) {
            const name = params[i];
            this.declareVar(name);
            this.defineVar(name);
          }
          this.resolveStmt(funBody);
          this.endScope();

          this.currentFunctionType = enclosingFunctionType;
        }
      )
      .with(
        { consequent: P._, alternative: P._ },
        ({ condition, consequent, alternative }) => {
          this.resolveExpr(condition);
          this.resolveStmt(consequent);
          if (alternative) this.resolveStmt(alternative);
        }
      )
      .with({ condition: P._, body: P._ }, ({ condition, body }: WhileStmt) => {
        this.resolveExpr(condition);
        this.resolveStmt(body);
      })
      .with({ className: P._ }, ({ superclassVar, className, methods }) => {
        if (superclassVar) this.resolveExpr(superclassVar);

        if (superclassVar && superclassVar.variable.lexeme === className.lexeme)
          this.resolverErrorCallback(
            superclassVar.variable,
            "A class can't inherit from itself."
          );

        const enclosingClass = this.currentClassType;
        this.currentClassType = ClassType.CLASS;

        this.declareVar(className);
        this.defineVar(className);

        if (superclassVar) {
          this.beginScope();
          this.scopes[this.scopes.length - 1].set("super", true);
        }

        this.beginScope();
        this.scopes[this.scopes.length - 1].set("this", true);

        for (let i = 0; i < methods.length; i++) {
          const method = methods[i];
          const functionType =
            method.funName.lexeme === "init"
              ? FunctionType.INITIALISER
              : FunctionType.METHOD;
          this.resolveStmt({ ...method, functionType });
        }

        this.endScope();
        if (superclassVar) this.endScope();
        this.currentClassType = enclosingClass;
      })
      .exhaustive();
  }

  private beginScope() {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope() {
    this.scopes.pop();
  }

  private declareVar(identifier: Identifier) {
    if (!this.scopes.length) return;

    const scope = this.scopes[this.scopes.length - 1];

    // in local scope, disallow declaring multiple variables with the same name
    if (scope.has(identifier.lexeme))
      this.resolverErrorCallback(
        identifier,
        "Already a variable with this name in this scope."
      );

    scope.set(identifier.lexeme, false);
  }

  private defineVar(identifier: Identifier) {
    if (!this.scopes.length) return;

    const scope = this.scopes[this.scopes.length - 1];
    scope.set(identifier.lexeme, true);
  }

  private resolveExpr(expression: Expr): void {
    return match(expression)
      .with({ tokenName: TokenName.THIS }, (token) => {
        if (this.currentClassType === ClassType.NONE) {
          this.resolverErrorCallback(
            token,
            "Can't use this outside of a class"
          );
          return;
        }
        this.resolveLocal(token);
      })
      .with({ tokenName: P._, lexeme: P._ }, () => {
        // do nothing
      })
      .with({ expr: P._ }, ({ expr }) => this.resolveExpr(expr))
      .with({ leftExpr: P._, rightExpr: P._ }, ({ leftExpr, rightExpr }) => {
        this.resolveExpr(leftExpr);
        this.resolveExpr(rightExpr);
      })
      .with({ variable: P._ }, ({ variable }) => {
        if (
          this.scopes.length &&
          this.scopes[this.scopes.length - 1].get(variable.lexeme) === false
        )
          this.resolverErrorCallback(
            variable,
            "Can't read local variable in its own initialiser."
          );

        this.resolveLocal(variable);
      })
      .with({ assignVar: P._ }, ({ assignVar, assignExpr }) => {
        this.resolveExpr(assignExpr);
        this.resolveLocal(assignVar);
      })
      .with({ callee: P._ }, ({ callee, args }) => {
        for (let i = 0; i < args.length; i++) this.resolveExpr(args[i]);
        this.resolveExpr(callee);
      })
      .with({ before: P._, field: P._ }, ({ before }) => {
        this.resolveExpr(before);
      })
      .with(
        { assignTo: P._, assignExpr: P._ },
        ({ assignTo: { before }, assignExpr }: Set) => {
          this.resolveExpr(before);
          this.resolveExpr(assignExpr);
        }
      )
      .with({ token: { tokenName: TokenName.SUPER } }, ({ token }) => {
        this.resolveLocal(token);
      })
      .exhaustive();
  }

  private resolveLocal(key: Identifier | This | SuperToken) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(key.lexeme)) {
        // add to side table
        this.locals.set(key, this.scopes.length - 1 - i);
        return;
      }
    }
  }
}

export default Resolver;
