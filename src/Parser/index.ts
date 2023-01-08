import { match } from "ts-pattern";
import { Operator, Literal, Unary, Grouping, Expr } from "./types";
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
    try {
      const expr = this.expression();
      return expr;
    } catch (err) {
      if (err instanceof ParseError) return null;
      throw err;
    }
  }

  private expression(): Expr {
    return this.equality();
  }

  private equality(): Expr {
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

  private comparison(): Expr {
    let expr: Expr = this.term();

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

  private term(): Expr {
    let expr: Expr = this.factor();

    while (
      this.peek().tokenName === TokenName.MINUS ||
      this.peek().tokenName === TokenName.PLUS
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.factor() };
    }

    return expr;
  }

  private factor(): Expr {
    let expr: Expr = this.unary();

    while (
      this.peek().tokenName === TokenName.SLASH ||
      this.peek().tokenName === TokenName.STAR
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.unary() };
    }

    return expr;
  }

  private unary(): Literal | Grouping | Unary {
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

  private primary(): Literal | Grouping {
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
    if (this.isAtEnd()) this.peek();
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
