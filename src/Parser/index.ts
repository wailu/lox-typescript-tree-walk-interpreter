import { match } from "ts-pattern";
import { Operator, Literal, Unary, Grouping, Expr } from "./types";
import { TokenName, Token } from "../Scanner/types";

class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
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
      (this.peek().tokenName === TokenName.EQUAL_EQUAL ||
        this.peek().tokenName === TokenName.BANG_EQUAL)
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
      (this.peek().tokenName === TokenName.GREATER ||
        this.peek().tokenName === TokenName.GREATER_EQUAL ||
        this.peek().tokenName === TokenName.LESS ||
        this.peek().tokenName === TokenName.LESS_EQUAL)
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
      (this.peek().tokenName === TokenName.MINUS ||
        this.peek().tokenName === TokenName.PLUS)
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
      (this.peek().tokenName === TokenName.SLASH ||
        this.peek().tokenName === TokenName.STAR)
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

        if (this.isAtEnd() || this.peek().tokenName !== TokenName.RIGHT_PAREN)
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
