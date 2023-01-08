import { match } from "ts-pattern";
import { Operator, Literal, Unary, Grouping, Expr } from "./types";
import { Token, TokenInfo } from "../Scanner";

// Parser code
class Parser {
  private tokens: TokenInfo[];
  private current = 0;

  constructor(tokens: TokenInfo[]) {
    this.tokens = tokens;
  }

  parse() {
    const expr = this.expression();
    return expr;
  }

  private expression(): Expr {
    return this.equality();
  }

  private equality(): Expr {
    let expr: Expr = this.comparison();

    while (
      !this.isAtEnd() &&
      (this.peek().token === Token.EQUAL_EQUAL ||
        this.peek().token === Token.BANG_EQUAL)
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.equality() };
    }

    return expr;
  }

  private comparison(): Expr {
    let expr: Expr = this.term();

    while (
      !this.isAtEnd() &&
      (this.peek().token === Token.GREATER ||
        this.peek().token === Token.GREATER_EQUAL ||
        this.peek().token === Token.LESS ||
        this.peek().token === Token.LESS_EQUAL)
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.term() };
    }

    return expr;
  }

  private term(): Expr {
    let expr: Expr = this.factor();

    while (
      !this.isAtEnd() &&
      (this.peek().token === Token.MINUS || this.peek().token === Token.PLUS)
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.factor() };
    }

    return expr;
  }

  private factor(): Expr {
    let expr: Expr = this.unary();

    while (
      !this.isAtEnd() &&
      (this.peek().token === Token.SLASH || this.peek().token === Token.STAR)
    ) {
      const op = this.advance() as Operator;
      expr = { op, leftExpr: expr, rightExpr: this.unary() };
    }

    return expr;
  }

  private unary(): Literal | Grouping | Unary {
    const token = this.peek();

    return match(token)
      .with({ token: Token.BANG }, { token: Token.MINUS }, (token) => {
        this.advance();
        const expr = this.unary();
        return { op: token, expr };
      })
      .otherwise(() => this.primary());
  }

  private primary(): Literal | Grouping {
    const token = this.peek();

    console.log("primary", token);

    return match(token)
      .with(
        { token: Token.NUMBER },
        { token: Token.STRING },
        { token: Token.TRUE },
        { token: Token.FALSE },
        { token: Token.NIL },
        (token) => {
          this.advance();
          return token;
        }
      )
      .with({ token: Token.LEFT_PAREN }, () => {
        this.advance();
        const expr = this.expression();

        if (this.isAtEnd() || this.peek().token !== Token.RIGHT_PAREN)
          throw Error("Unexpected token!");

        this.advance();

        return { expr };
      })
      .otherwise(() => {
        throw Error("Unexpected token!");
      });
  }

  private peek() {
    return this.tokens[this.current];
  }

  private isAtEnd() {
    return this.current >= this.tokens.length;
  }

  private advance() {
    return this.tokens[this.current++];
  }
}

export default Parser;
