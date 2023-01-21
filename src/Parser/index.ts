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
} from "./types";
import { TokenName, Token } from "../Scanner/types";

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
      if (this.peek().tokenName === TokenName.VAR) return this.varDeclaration();
      return this.statement();
    } catch (err) {
      if (err instanceof ParseError) {
        this.synchronise(); // error recovery
      }
      return null;
    }
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
      .otherwise(() => this.expressionStatement());
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

  private unary(): Literal | Grouping | Unary | Var {
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
      .otherwise(() => this.primary());
  }

  private primary(): Literal | Grouping | Var {
    const token = this.peek();

    return match(token)
      .with(
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
