export enum TokenName {
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  LEFT_BRACE = "LEFT_BRACE",
  RIGHT_BRACE = "RIGHT_BRACE",
  COMMA = "COMMA",
  DOT = "DOT",
  MINUS = "MINUS",
  PLUS = "PLUS",
  SEMICOLON = "SEMICOLON",
  STAR = "STAR",

  BANG = "BANG",
  BANG_EQUAL = "BANG_EQUAL",
  EQUAL = "EQUAL",
  EQUAL_EQUAL = "EQUAL_EQUAL",
  LESS = "LESS",
  LESS_EQUAL = "LESS_EQUAL",
  GREATER = "GREATER",
  GREATER_EQUAL = "GREATER_EQUAL",
  SLASH = "SLASH",

  STRING = "STRING",
  NUMBER = "NUMBER",

  IDENTIFIER = "IDENTIFIER",

  AND = "AND",
  CLASS = "CLASS",
  ELSE = "ELSE",
  FALSE = "FALSE",
  FOR = "FOR",
  FUN = "FUN",
  IF = "IF",
  NIL = "NIL",
  OR = "OR",
  PRINT = "PRINT",
  RETURN = "RETURN",
  SUPER = "SUPER",
  THIS = "THIS",
  TRUE = "TRUE",
  VAR = "VAR",
  WHILE = "WHILE",

  EOF = "EOF",
}

export type Token =
  | {
      tokenName: Exclude<
        TokenName,
        TokenName.STRING | TokenName.NUMBER | TokenName.EOF
      >;
      lexeme: string;
      line: number;
    }
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
      tokenName: TokenName.EOF;
    };
