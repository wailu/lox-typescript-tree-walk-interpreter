import { match, P } from "ts-pattern";
import { TokenName, Token } from "./types";

const reservedWords = new Map<string, TokenName>([
  [TokenName.AND.toLowerCase(), TokenName.AND],
  [TokenName.CLASS.toLowerCase(), TokenName.CLASS],
  [TokenName.ELSE.toLowerCase(), TokenName.ELSE],
  [TokenName.FALSE.toLowerCase(), TokenName.FALSE],
  [TokenName.FOR.toLowerCase(), TokenName.FOR],
  [TokenName.FUN.toLowerCase(), TokenName.FUN],
  [TokenName.IF.toLowerCase(), TokenName.IF],
  [TokenName.NIL.toLowerCase(), TokenName.NIL],
  [TokenName.OR.toLowerCase(), TokenName.OR],
  [TokenName.PRINT.toLowerCase(), TokenName.PRINT],
  [TokenName.RETURN.toLowerCase(), TokenName.RETURN],
  [TokenName.SUPER.toLowerCase(), TokenName.SUPER],
  [TokenName.THIS.toLowerCase(), TokenName.THIS],
  [TokenName.TRUE.toLowerCase(), TokenName.TRUE],
  [TokenName.VAR.toLowerCase(), TokenName.VAR],
  [TokenName.WHILE.toLowerCase(), TokenName.WHILE],
]);

class Scanner {
  private source: string;
  private errorCallback: (line: number, message: string) => void;

  private tokens: Token[] = [];
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

    this.addToken(TokenName.EOF);
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
        this.addToken(TokenName.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenName.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenName.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenName.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenName.COMMA);
        break;
      case ".":
        this.addToken(TokenName.DOT);
        break;
      case "-":
        this.addToken(TokenName.MINUS);
        break;
      case "+":
        this.addToken(TokenName.PLUS);
        break;
      case ";":
        this.addToken(TokenName.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenName.STAR);
        break;
      // for the below we need to look at the second character
      case "!":
        this.addToken(this.match("=") ? TokenName.BANG_EQUAL : TokenName.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenName.EQUAL_EQUAL : TokenName.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenName.LESS_EQUAL : TokenName.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenName.GREATER_EQUAL : TokenName.GREATER
        );
        break;
      case "/":
        if (this.match("/"))
          // a comment; keep consuming until we find the end of the line
          while (this.peek() != "\n" && !this.isAtEnd()) this.advance();
        else this.addToken(TokenName.SLASH);
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

  private addToken(
    tokenName: TokenName,
    literal: string | number | null = null
  ) {
    const lexeme = this.source.substring(this.start, this.current);

    match([tokenName, literal])
      .with([TokenName.STRING, P.string], ([, literal]) =>
        this.tokens.push({
          tokenName: TokenName.STRING,
          lexeme,
          literal,
          line: this.line,
        })
      )
      .with([TokenName.NUMBER, P.number], ([, literal]) =>
        this.tokens.push({
          tokenName: TokenName.NUMBER,
          lexeme,
          literal,
          line: this.line,
        })
      )
      .with([TokenName.EOF], () =>
        this.tokens.push({ tokenName: TokenName.EOF })
      )
      .with(
        [
          P.when(
            (tokenName) =>
              tokenName !== TokenName.STRING ||
              TokenName.NUMBER ||
              TokenName.EOF
          ),
          P.nullish,
        ],
        ([tokenName]: [
          Exclude<
            TokenName,
            TokenName.NUMBER | TokenName.STRING | TokenName.EOF
          >
        ]) =>
          this.tokens.push({
            tokenName,
            lexeme,
            literal: null,
            line: this.line,
          })
      )
      .otherwise(() => this.errorCallback(this.line, "Unexpected token form."));
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
    this.addToken(TokenName.STRING, value);
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
    this.addToken(TokenName.NUMBER, value);
  }

  private identifier() {
    // principle of maximal munch
    // when we can scanning and we can match 'orchid' (a variable name) vs 'or' (a keyword)
    // we match 'orchid' because it has more characters
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const lexeme = this.source.substring(this.start, this.current);

    // reserverd words are actually identifiers that have been claimed by the language for its own use
    if (reservedWords.has(lexeme)) this.addToken(reservedWords.get(lexeme)!);
    else this.addToken(TokenName.IDENTIFIER);
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isAlpha(c: string) {
    return !!c.match(/^[a-zA-Z_]$/);
  }
}

export default Scanner;
