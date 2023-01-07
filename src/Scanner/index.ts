enum Token {
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

type TokenInfo =
  | {
      token: Token;
      lexeme: string;
      literal: Object | null;
      line: number;
    }
  | {
      token: Token.EOF;
    };

const reservedWords = new Map<string, Token>([
  [Token.AND.toLowerCase(), Token.AND],
  [Token.CLASS.toLowerCase(), Token.CLASS],
  [Token.ELSE.toLowerCase(), Token.ELSE],
  [Token.FALSE.toLowerCase(), Token.FALSE],
  [Token.FOR.toLowerCase(), Token.FOR],
  [Token.FUN.toLowerCase(), Token.FUN],
  [Token.IF.toLowerCase(), Token.IF],
  [Token.NIL.toLowerCase(), Token.NIL],
  [Token.OR.toLowerCase(), Token.OR],
  [Token.PRINT.toLowerCase(), Token.PRINT],
  [Token.RETURN.toLowerCase(), Token.RETURN],
  [Token.SUPER.toLowerCase(), Token.SUPER],
  [Token.THIS.toLowerCase(), Token.THIS],
  [Token.TRUE.toLowerCase(), Token.TRUE],
  [Token.VAR.toLowerCase(), Token.VAR],
  [Token.WHILE.toLowerCase(), Token.WHILE],
]);

class Scanner {
  private source: string;
  private errorCallback: (line: number, message: string) => void;

  private tokens: TokenInfo[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(
    source: string,
    errorCallback: (line: number, message: string) => void
  ) {
    this.source = source;
    this.errorCallback = errorCallback;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({ token: Token.EOF });
    return this.tokens;
  }

  private isAtEnd() {
    return this.current >= this.source.length;
  }

  private scanToken() {
    // c is the token at current; current is also advanced by 1
    const c = this.advance();

    switch (c) {
      // simple, single characters
      case "(":
        this.addToken(Token.LEFT_PAREN);
        break;
      case ")":
        this.addToken(Token.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(Token.LEFT_BRACE);
        break;
      case "}":
        this.addToken(Token.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(Token.COMMA);
        break;
      case ".":
        this.addToken(Token.DOT);
        break;
      case "-":
        this.addToken(Token.MINUS);
        break;
      case "+":
        this.addToken(Token.PLUS);
        break;
      case ";":
        this.addToken(Token.SEMICOLON);
        break;
      case "*":
        this.addToken(Token.STAR);
        break;
      // for the below we need to look at the second character
      case "!":
        this.addToken(this.match("=") ? Token.BANG_EQUAL : Token.BANG);
        break;
      case "=":
        this.addToken(this.match("=") ? Token.EQUAL_EQUAL : Token.EQUAL);
        break;
      case "<":
        this.addToken(this.match("=") ? Token.LESS_EQUAL : Token.LESS);
        break;
      case ">":
        this.addToken(this.match("=") ? Token.GREATER_EQUAL : Token.GREATER);
        break;
      case "/":
        if (this.match("/"))
          // a comment; keep consuming until we find the end of the line
          while (this.peek() != "\n" && !this.isAtEnd()) this.advance();
        else this.addToken(Token.SLASH);
        break;
      // ignore newlines and whitespace
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this.line++;
        break;
      // string
      case '"':
        this.string();
        break;
      default:
        // number
        if (this.isDigit(c)) this.number();
        // identifier / reserved word
        else if (this.isAlpha(c)) this.identifier();
        else this.errorCallback(this.line, `Unexpected character.`);
        break;
    }
  }

  private advance() {
    return this.source[this.current++];
  }

  private addToken(token: Token, literal: Object | null = null) {
    const lexeme = this.source.substring(this.start, this.current);
    this.tokens.push({ token, lexeme, literal, line: this.line });
  }

  private match(expected: string) {
    if (this.isAtEnd()) return false;
    if (this.peek() !== expected) return false;

    // matched
    this.current++;
    return true;
  }

  // a lookahead
  private peek(n: 1 | 2 = 1) {
    if (this.isAtEnd()) return "/0";
    return this.source[this.current + (n - 1)];
  }

  private string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      this.errorCallback(this.line, "Unterminated string.");
      return;
    }

    // consume the closing "
    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(Token.STRING, value);
  }

  private isDigit(c: string) {
    return !!c.match(/^[0-9]$/);
  }

  private number() {
    while (this.isDigit(this.peek())) this.advance();

    // look for fractional part
    // we should make sure there are actually digits following the '.'
    // so we peek even forward
    if (this.peek() === "." && this.isDigit(this.peek(2))) {
      // consume the '.' and deal with the fractional
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    const value = parseFloat(this.source.substring(this.start, this.current));
    this.addToken(Token.NUMBER, value);
  }

  private identifier() {
    // principle of maximal munch
    // when we can scanning and we can match 'orchid' (a variable name) vs 'or' (a keyword)
    // we match 'orchid' because it has more characters
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const lexeme = this.source.substring(this.start, this.current);

    // reserverd words are actually identifiers that have been claimed by the language for its own use
    if (reservedWords.has(lexeme)) this.addToken(reservedWords.get(lexeme)!);
    else this.addToken(Token.IDENTIFIER);
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isAlpha(c: string) {
    return !!c.match(/^[a-zA-Z_]$/);
  }
}

export default Scanner;
