import { Token, TokenInfo } from "../../Scanner";

export type SharedTokenInfoPart = Omit<
  Exclude<TokenInfo, { token: Token.EOF }>,
  "token"
>;
export type OperatorToken =
  | Token.EQUAL_EQUAL
  | Token.BANG_EQUAL
  | Token.LESS
  | Token.LESS_EQUAL
  | Token.GREATER
  | Token.GREATER_EQUAL
  | Token.PLUS
  | Token.MINUS
  | Token.STAR
  | Token.SLASH;

export type LiteralToken =
  | Token.STRING
  | Token.NUMBER
  | Token.TRUE
  | Token.FALSE
  | Token.NIL;

export type Operator = SharedTokenInfoPart & { token: OperatorToken };

export type Literal = SharedTokenInfoPart & { token: LiteralToken };
export type Unary = { op: Operator; expr: Expr };
export type Binary = { op: Operator; leftExpr: Expr; rightExpr: Expr };
export type Grouping = { expr: Expr };

export type Expr = Literal | Unary | Binary | Grouping;
