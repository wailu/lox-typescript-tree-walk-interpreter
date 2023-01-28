import { match, P } from "ts-pattern";
import {
  Operator,
  Literal,
  Unary,
  Grouping,
  Var,
  Expr,
  Stmt,
  VarDeclaration,
  Assign,
  Block,
  IfStmt,
  LogicalOperator,
  WhileStmt,
  Call,
  FunDeclaration,
  ReturnStmt,
  ReturnToken,
  ClassDeclaration,
  Get,
  Identifier,
  This,
  Super,
} from "./types";
import { TokenName, Token } from "../Scanner/types";

const MAX_FUN_PARAM_COUNT = 255;

class ParseError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

class Parser {
  private tokens: Token[];
  private errorCallback: (token: Token, message: string) => void;
  private current = 0;

  constructor(
    tokens: Token[],
    errorCallback: (token: Token, message: string) => void
  ) {
    this.tokens = tokens;
    this.errorCallback = errorCallback;
  }

  parse() {
    const statements = [];

    while (!this.isAtEnd()) {
      const statement = this.declaration();
      if (statement) statements.push(statement);
    }

    return statements;
  }

  private declaration() {
    try {
      switch (this.peek().tokenName) {
        case TokenName.VAR:
          return this.varDeclaration();
        case TokenName.FUN:
          return this.funDeclaration();
        case TokenName.CLASS:
          return this.classDeclaration();
        default:
          return this.statement();
      }
    } catch (err) {
      if (err instanceof ParseError) {
        this.synchronise(); // error recovery
      }
      return null;
    }
  }

  private classDeclaration(): ClassDeclaration {
    this.advance(); // "class" token

    return match(this.peek())
      .with({ tokenName: TokenName.IDENTIFIER }, (className) => {
        this.advance();

        let superclassVar: Var | null = null;

        if (this.peek().tokenName === TokenName.LESS) {
          this.advance();

          superclassVar = match(this.peek())
            .with({ tokenName: TokenName.IDENTIFIER }, (token) => {
              this.advance();
              return { variable: token };
            })
            .otherwise(() => {
              throw this.error(this.peek(), "Expect superclass name.");
            });
        }

        if (this.peek().tokenName !== TokenName.LEFT_BRACE)
          throw this.error(this.peek(), "Expect '{' after class name.");

        this.advance();

        const methods = [];

        while (
          this.peek().tokenName !== TokenName.RIGHT_BRACE &&
          !this.isAtEnd()
        ) {
          methods.push(this.fun(true));
        }

        if (this.peek().tokenName !== TokenName.RIGHT_BRACE)
          throw this.error(this.peek(), "Expect '}' after class body.");

        this.advance();

        return {
          superclassVar,
          className,
          methods,
        };
      })
      .otherwise((token) => {
        throw this.error(token, "Expect class name.");
      });
  }

  private funDeclaration(): FunDeclaration {
    this.advance(); // 'fun' token

    return this.fun();
  }

  private fun(isMethod?: boolean) {
    const methodOrFunction = `${!!isMethod ? "method" : "function"}`;

    return match(this.peek())
      .with({ tokenName: TokenName.IDENTIFIER }, (funName) => {
        this.advance();

        if (this.peek().tokenName !== TokenName.LEFT_PAREN)
          throw this.error(
            this.peek(),
            `Expect '(' after ${methodOrFunction}.`
          );

        this.advance();

        const params = match(this.peek())
          .with({ tokenName: TokenName.IDENTIFIER }, (first) => {
            this.advance();
            const paramList = [first];
            while (this.peek().tokenName === TokenName.COMMA) {
              this.advance();

              paramList.push(
                match(this.peek())
                  .with({ tokenName: TokenName.IDENTIFIER }, (token) => {
                    this.advance();
                    return token;
                  })
                  .otherwise(() => {
                    throw this.error(this.peek(), "Expect parameter name.");
                  })
              );

              if (paramList.length >= MAX_FUN_PARAM_COUNT)
                this.error(this.peek(), "Can't have more than 255 parameters.");
            }

            return paramList;
          })
          .otherwise(() => []);

        if (this.peek().tokenName !== TokenName.RIGHT_PAREN)
          throw this.error(this.peek(), "Expect ')' after parameters.");

        this.advance();

        if (this.peek().tokenName !== TokenName.LEFT_BRACE)
          throw this.error(
            this.peek(),
            `Expect '{' before ${methodOrFunction} body.`
          );

        // this.advance() is done in this.block()
        const funBody = this.block();

        return { funName, params, funBody };
      })
      .otherwise((token) => {
        throw this.error(token, `Expect ${methodOrFunction} name.`);
      });
  }

  private varDeclaration(): VarDeclaration {
    this.advance(); // "var" token

    const identifier = match(this.peek())
      .with({ tokenName: TokenName.IDENTIFIER }, (token) => {
        this.advance();
        return token;
      })
      .otherwise(() => {
        throw this.error(this.peek(), "Expect variable name.");
      });

    const initialiser = match(this.peek())
      .with({ tokenName: TokenName.EQUAL }, () => {
        this.advance();
        return this.expression();
      })
      .otherwise(() => null);

    if (this.peek().tokenName !== TokenName.SEMICOLON)
      throw this.error(this.peek(), "Expect ';' after expression.");

    this.advance(); // ";" token

    return { identifier, initialiser };
  }

  private statement(): Stmt {
    return match(this.peek())
      .with({ tokenName: TokenName.PRINT }, () => this.printStatement())
      .with({ tokenName: TokenName.LEFT_BRACE }, () => this.block())
      .with({ tokenName: TokenName.IF }, () => this.ifStatement())
      .with({ tokenName: TokenName.WHILE }, () => this.whileStatement())
      .with({ tokenName: TokenName.FOR }, () => this.forStatement())
      .with({ tokenName: TokenName.RETURN }, () => this.returnStatement())
      .otherwise(() => this.expressionStatement());
  }

  private returnStatement(): ReturnStmt {
    const token = this.advance() as ReturnToken;

    return match(this.peek())
      .with({ tokenName: TokenName.SEMICOLON }, () => {
        this.advance();
        // implicitly return nil
        return {
          stmtType: "RETURN" as const,
          token,
          expr: {
            tokenName: TokenName.NIL as const,
            lexeme: "nil",
            literal: null,
            line: -1,
          },
        };
      })
      .otherwise(() => {
        const expr = this.expression();

        if (this.peek().tokenName !== TokenName.SEMICOLON)
          throw this.error(this.peek(), "Expect ';' after return value.");

        this.advance();

        return {
          stmtType: "RETURN" as const,
          token,
          expr,
        };
      });
  }

  private whileStatement(): WhileStmt {
    this.advance(); // "while" token

    if (this.peek().tokenName !== TokenName.LEFT_PAREN)
      throw this.error(this.peek(), "Expect '(' after 'while'.");

    this.advance();

    const condition = this.expression();

    if (this.peek().tokenName !== TokenName.RIGHT_PAREN)
      throw this.error(this.peek(), "Expect ')' after while condition.");

    this.advance();

    const body = this.statement();

    return { condition, body };
  }

  private forStatement(): Block | WhileStmt {
    this.advance(); // "for" token

    if (this.peek().tokenName !== TokenName.LEFT_PAREN)
      throw this.error(this.peek(), "Expect '(' after 'for'.");

    this.advance();

    const initialiser = match(this.peek())
      .with({ tokenName: TokenName.SEMICOLON }, () => {
        this.advance();
        return null;
      })
      .with({ tokenName: TokenName.VAR }, () => this.varDeclaration())
      .otherwise(() => this.expressionStatement());

    const condition = match(this.peek())
      .with({ tokenName: TokenName.SEMICOLON }, ({ line }) => {
        // condition assumed true
        return {
          tokenName: TokenName.TRUE as const,
          lexeme: "true",
          literal: null,
          line,
        };
      })
      .otherwise(() => this.expression());

    if (this.peek().tokenName !== TokenName.SEMICOLON)
      throw this.error(this.peek(), "Expect ';' after loop condition.");

    this.advance();

    const increment = match(this.peek())
      .with({ tokenName: TokenName.SEMICOLON }, () => {
        this.advance();
        return null;
      })
      .otherwise(() => this.expression());

    if (this.peek().tokenName !== TokenName.RIGHT_PAREN)
      throw this.error(this.peek(), "Expect ')' after for clauses.");

    this.advance();

    let body = this.statement();

    if (increment)
      // increment after body is executed
      body = { statements: [body, { stmtType: "EXPR", expr: increment }] };

    // body will be body of while loop; condition will be attached to the while loop
    body = { condition, body };

    if (initialiser) body = { statements: [initialiser, body] };

    return body;
  }

  private ifStatement(): IfStmt {
    this.advance(); // "if" token

    if (this.peek().tokenName !== TokenName.LEFT_PAREN)
      throw this.error(this.peek(), "Expect '(' after 'if'.");

    this.advance();

    const condition = this.expression();

    if (this.peek().tokenName !== TokenName.RIGHT_PAREN)
      throw this.error(this.peek(), "Expect ')' after if condition.");

    this.advance();

    const consequent = this.statement();

    let alternative: Stmt | null = null;

    if (this.peek().tokenName === TokenName.ELSE) {
      this.advance();
      alternative = this.statement();
    }

    return { condition, consequent, alternative };
  }

  private block(): Block {
    this.advance(); // "{" token

    const statements = [];

    while (this.peek().tokenName !== TokenName.RIGHT_BRACE && !this.isAtEnd()) {
      const statement = this.declaration();
      if (statement) statements.push(statement);
    }

    if (this.peek().tokenName !== TokenName.RIGHT_BRACE)
      throw this.error(this.peek(), "Expect ';' after expression.");

    this.advance();

    return { statements };
  }

  private printStatement(): Stmt {
    this.advance(); // "print" token
    const expr = this.expression();

    if (this.peek().tokenName !== TokenName.SEMICOLON)
      throw this.error(this.peek(), "Expect ';' after expression.");

    this.advance(); // ";" token

    return { stmtType: "PRINT", expr };
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();

    if (this.peek().tokenName !== TokenName.SEMICOLON)
      throw this.error(this.peek(), "Expect ';' after expression.");

    this.advance(); // ";" token

    return { stmtType: "EXPR", expr };
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr = this.or();

    return match(this.peek())
      .with({ tokenName: TokenName.EQUAL }, (token) => {
        this.advance(); // "equals" token
        const assignExpr = this.assignment();

        return match(expr)
          .with({ variable: P._ }, ({ variable }) => ({
            assignVar: variable,
            assignExpr,
          }))
          .with({ before: P._, field: P._ }, (assignTo) => ({
            assignTo,
            token,
            assignExpr,
          }))
          .otherwise(() => {
            // we don't need to synchronise here;
            // report the error will do
            this.error(token, "Invalid assignment target.");
            return expr;
          });
      })
      .otherwise(() => expr);
  }

  private or() {
    let expr = this.and();

    while (this.peek().tokenName === TokenName.OR) {
      const op = this.advance() as LogicalOperator;
      const rightExpr = this.and();
      expr = { op, leftExpr: expr, rightExpr };
    }

    return expr;
  }

  private and() {
    let expr = this.equality();

    while (this.peek().tokenName === TokenName.AND) {
      const op = this.advance() as LogicalOperator;
      const rightExpr = this.equality();
      expr = { op, leftExpr: expr, rightExpr };
    }

    return expr;
  }

  private equality(): Exclude<Expr, Assign> {
    let expr: Expr = this.comparison();

    while (
      this.peek().tokenName === TokenName.EQUAL_EQUAL ||
      this.peek().tokenName === TokenName.BANG_EQUAL
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.equality() };
    }

    return expr;
  }

  private comparison(): Exclude<Expr, Assign> {
    let expr: Exclude<Expr, Assign> = this.term();

    while (
      this.peek().tokenName === TokenName.GREATER ||
      this.peek().tokenName === TokenName.GREATER_EQUAL ||
      this.peek().tokenName === TokenName.LESS ||
      this.peek().tokenName === TokenName.LESS_EQUAL
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.term() };
    }

    return expr;
  }

  private term(): Exclude<Expr, Assign> {
    let expr: Exclude<Expr, Assign> = this.factor();

    while (
      this.peek().tokenName === TokenName.MINUS ||
      this.peek().tokenName === TokenName.PLUS
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.factor() };
    }

    return expr;
  }

  private factor(): Exclude<Expr, Assign> {
    let expr: Exclude<Expr, Assign> = this.unary();

    while (
      this.peek().tokenName === TokenName.SLASH ||
      this.peek().tokenName === TokenName.STAR
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.unary() };
    }

    return expr;
  }

  private unary():
    | Literal
    | Grouping
    | Unary
    | Var
    | Call
    | Get
    | This
    | Super {
    const token = this.peek();

    return match(token)
      .with(
        { tokenName: TokenName.BANG },
        { tokenName: TokenName.MINUS },
        (token) => {
          this.advance();
          const expr = this.unary();
          return { op: token, expr };
        }
      )
      .otherwise(() => this.call());
  }

  private call(): ReturnType<typeof this.primary> | Call | Get {
    let expr: ReturnType<typeof this.primary> | Call | Get = this.primary();

    while (
      this.peek().tokenName === TokenName.DOT ||
      this.peek().tokenName === TokenName.LEFT_PAREN
    ) {
      match(this.peek())
        .with({ tokenName: TokenName.DOT }, (token) => {
          this.advance();

          if (this.peek().tokenName !== TokenName.IDENTIFIER)
            throw this.error(this.peek(), "Expect property name after '.'.");

          const identifier = this.advance() as Identifier;

          expr = {
            before: expr,
            token,
            field: identifier,
          };
        })
        .with({ tokenName: TokenName.LEFT_PAREN }, () => {
          this.advance();

          const args =
            this.peek().tokenName !== TokenName.RIGHT_PAREN ? this.args() : [];

          const endToken = match(this.peek())
            .with({ tokenName: TokenName.RIGHT_PAREN }, (token) => {
              this.advance();
              return token;
            })
            .otherwise((token) => {
              throw this.error(token, "Expect ')' after arguments.");
            });

          expr = {
            callee: expr,
            endToken,
            args,
          };
        })
        .otherwise(() => expr);
    }

    return expr;
  }

  private args() {
    const argList = [this.expression()];

    while (this.peek().tokenName === TokenName.COMMA) {
      this.advance();
      argList.push(this.expression());
      if (argList.length >= MAX_FUN_PARAM_COUNT)
        this.error(this.peek(), "Can't have more than 255 arguments.");
    }

    return argList;
  }

  private primary(): Literal | Grouping | Var | This | Super {
    const token = this.peek();

    return match(token)
      .with(
        { tokenName: TokenName.THIS },
        { tokenName: TokenName.NUMBER },
        { tokenName: TokenName.STRING },
        { tokenName: TokenName.TRUE },
        { tokenName: TokenName.FALSE },
        { tokenName: TokenName.NIL },
        (token) => {
          this.advance();
          return token;
        }
      )
      .with({ tokenName: TokenName.LEFT_PAREN }, () => {
        this.advance();
        const expr = this.expression();

        if (this.peek().tokenName !== TokenName.RIGHT_PAREN)
          throw this.error(this.peek(), "Expect ')' after expression.");

        this.advance();

        return { expr };
      })
      .with({ tokenName: TokenName.IDENTIFIER }, (token) => {
        this.advance();
        return { variable: token };
      })
      .with({ tokenName: TokenName.SUPER }, (token) => {
        this.advance();

        if (this.peek().tokenName !== TokenName.DOT)
          throw this.error(this.peek(), "Expect '.' after 'super'.");

        this.advance();

        if (this.peek().tokenName !== TokenName.IDENTIFIER)
          throw this.error(this.peek(), "Expect superclass method name.");

        return {
          token,
          method: this.advance() as Identifier,
        };
      })
      .otherwise((token) => {
        throw this.error(token, "Expect expression.");
      });
  }

  private peek() {
    return this.tokens[this.current];
  }

  private isAtEnd() {
    return this.peek().tokenName === TokenName.EOF;
  }

  private advance() {
    // if at EOF, then calling advance() will still return EOF
    if (this.isAtEnd()) return this.peek();
    return this.tokens[this.current++];
  }

  private previous() {
    return this.tokens[this.current - 1];
  }

  private error(token: Token, message: string) {
    this.errorCallback(token, message);
    return new ParseError();
  }

  // we'll do synchronisation on statement boundaries
  private synchronise() {
    this.advance();

    while (!this.isAtEnd()) {
      // after a semicolon, it's likely that the statement is concluded
      // not always the case though; for example in a for loop
      if (this.previous().tokenName === TokenName.SEMICOLON) return;

      switch (this.peek().tokenName) {
        case TokenName.CLASS:
        case TokenName.FUN:
        case TokenName.VAR:
        case TokenName.FOR:
        case TokenName.IF:
        case TokenName.WHILE:
        case TokenName.PRINT:
        case TokenName.RETURN:
          return;
      }

      this.advance();
    }
  }
}

export default Parser;
