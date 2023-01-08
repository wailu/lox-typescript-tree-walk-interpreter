import { TokenName, Token } from "../../Scanner/types";

type SharedTokenInfoPart = Omit<
  Exclude<Token, { tokenName: TokenName.EOF }>,
  "tokenName"
>;
export type OperatorToken =
  | TokenName.EQUAL_EQUAL
  | TokenName.BANG_EQUAL
  | TokenName.LESS
  | TokenName.LESS_EQUAL
  | TokenName.GREATER
  | TokenName.GREATER_EQUAL
  | TokenName.PLUS
  | TokenName.MINUS
  | TokenName.STAR
  | TokenName.SLASH
  | TokenName.BANG;

export type LiteralToken =
  | TokenName.STRING
  | TokenName.NUMBER
  | TokenName.TRUE
  | TokenName.FALSE
  | TokenName.NIL;

export type Operator = SharedTokenInfoPart & { tokenName: OperatorToken };

export type Literal =
  | {
      tokenName: TokenName.STRING;
      lexeme: string;
      literal: string;
      line: number;
    }
  | {
      tokenName: TokenName.NUMBER;
      lexeme: string;
      literal: number;
      line: number;
    }
  | {
      tokenName: TokenName.TRUE | TokenName.FALSE | TokenName.NIL;
      lexeme: string;
      literal: null;
      line: number;
    };
export type Unary = { op: Operator; expr: Expr };
export type Binary = { op: Operator; leftExpr: Expr; rightExpr: Expr };
export type Grouping = { expr: Expr };

export type Expr = Literal | Unary | Binary | Grouping;
