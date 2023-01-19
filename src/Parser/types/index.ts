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

export type Operator = SharedTokenInfoPart & {
  tokenName: OperatorToken;
  literal: null;
};

export type Variable = SharedTokenInfoPart & {
  tokenName: TokenName.IDENTIFIER;
  literal: null;
};

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
export type Var = { variable: Variable };

export type Expr = Literal | Unary | Binary | Grouping | Var;

export type PrintStmt = { stmtType: "PRINT"; expr: Expr };
export type ExprStmt = { stmtType: "EXPR"; expr: Expr };

export type Stmt = PrintStmt | ExprStmt;
export type VarDeclaration = {
  identifier: Variable;
  initialiser: Expr | null;
};

export type Declaration = VarDeclaration | Stmt;
