import { match, P } from "ts-pattern";
import { Token, TokenName } from "../Scanner/types";
import { Declaration, Expr, WhileStmt, Identifier } from "../Parser/types";

class Resolver {
  private scopes: Map<string, boolean>[];
  private locals: Map<Identifier, number>;
  private resolverErrorCallback: (token: Exclude<Token, { tokenName: TokenName.EOF }>, message: string) => void;

  constructor(resolverErrorCallback: (token: Exclude<Token, { tokenName: TokenName.EOF }>, message: string) => void) {
    this.scopes = [];
    this.locals = new Map<Identifier, number>;
    this.resolverErrorCallback = resolverErrorCallback;
  }

  resolve(statements: Declaration[]): Map<Identifier, number> {
    this.locals.clear();
    for (let i = 0; i < statements.length; i++) this.resolveStmt(statements[i])
    return this.locals
  }

  private resolveStmt(statement: Declaration): void {
    return match(statement)
      .with({ stmtType: P.union("PRINT", "EXPR", "RETURN") }, ({ expr }) =>
        this.resolveExpr(expr)
      )
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
          this.declareVar(identifier.lexeme);
          if (initialiser) this.resolveExpr(initialiser);
          this.defineVar(identifier.lexeme);
        }
      )
      .with(
        { funName: P._, params: P._, funBody: P._ },
        ({ funName, params, funBody }) => {
          this.declareVar(funName.lexeme);
          // define name eagerly to allow recursive definitions
          this.defineVar(funName.lexeme);

          this.beginScope();
          for (let i = 0; i < params.length; i++) {
            const name = params[i].lexeme;
            this.declareVar(name);
            this.defineVar(name);
          }
          this.resolveStmt(funBody);
          this.endScope();
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
      .exhaustive();
  }

  private beginScope() {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope() {
    this.scopes.pop();
  }

  private declareVar(name: string) {
    if (!this.scopes.length) return;

    const scope = this.scopes[this.scopes.length - 1];
    scope.set(name, false);
  }

  private defineVar(name: string) {
    if (!this.scopes.length) return;

    const scope = this.scopes[this.scopes.length - 1];
    scope.set(name, true);
  }

  private resolveExpr(expression: Expr): void {
    return match(expression)
      .with({ tokenName: P._, lexeme: P._ }, () => {
        // do nothing
      })
      .with({ expr: P._ }, ({ expr }) => this.resolveExpr(expr))
      .with({ leftExpr: P._, rightExpr: P._ }, ({ leftExpr, rightExpr }) => {
        this.resolveExpr(leftExpr)
        this.resolveExpr(rightExpr)
      })
      .with({ variable: P._ }, ({ variable }) => {
        if (this.scopes.length && this.scopes[this.scopes.length - 1].get(variable.lexeme) === false)
          this.resolverErrorCallback(variable, "Can't read local variable in its own initialiser.")

        this.resolveLocal(variable)
      })
      .with({ assignVar: P._ }, ({ assignVar, assignExpr }) => {
        this.resolveExpr(assignExpr)
        this.resolveLocal(assignVar)
      })
      .with({ callee: P._ }, ({ callee, args }) => {
        for (let i = 0; i < args.length; i++) this.resolveExpr(args[i])
        this.resolveExpr(callee)
      })
      .exhaustive();
  }

  private resolveLocal(key: Identifier) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(key.lexeme)) {
        this.locals.set(key, this.scopes.length - 1 - i)
        return
      }
    }
  }
}

export default Resolver
