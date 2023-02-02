"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a2, b2) => {
    for (var prop in b2 ||= {})
      if (__hasOwnProp.call(b2, prop))
        __defNormalProp(a2, prop, b2[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b2)) {
        if (__propIsEnum.call(b2, prop))
          __defNormalProp(a2, prop, b2[prop]);
      }
    return a2;
  };
  var __spreadProps = (a2, b2) => __defProps(a2, __getOwnPropDescs(b2));

  // node_modules/ts-pattern/dist/index.modern.js
  var e = Symbol("@ts-pattern/matcher");
  var t = "@ts-pattern/anonymous-select-key";
  var n = (e2) => Boolean(e2 && "object" == typeof e2);
  var r = (t2) => t2 && !!t2[e];
  var o = (t2, c2, a2) => {
    if (n(t2)) {
      if (r(t2)) {
        const n2 = t2[e](), { matched: r2, selections: o2 } = n2.match(c2);
        return r2 && o2 && Object.keys(o2).forEach((e2) => a2(e2, o2[e2])), r2;
      }
      if (!n(c2))
        return false;
      if (Array.isArray(t2))
        return !!Array.isArray(c2) && t2.length === c2.length && t2.every((e2, t3) => o(e2, c2[t3], a2));
      if (t2 instanceof Map)
        return c2 instanceof Map && Array.from(t2.keys()).every((e2) => o(t2.get(e2), c2.get(e2), a2));
      if (t2 instanceof Set) {
        if (!(c2 instanceof Set))
          return false;
        if (0 === t2.size)
          return 0 === c2.size;
        if (1 === t2.size) {
          const [e2] = Array.from(t2.values());
          return r(e2) ? Array.from(c2.values()).every((t3) => o(e2, t3, a2)) : c2.has(e2);
        }
        return Array.from(t2.values()).every((e2) => c2.has(e2));
      }
      return Object.keys(t2).every((n2) => {
        const s2 = t2[n2];
        return (n2 in c2 || r(i2 = s2) && "optional" === i2[e]().matcherType) && o(s2, c2[n2], a2);
        var i2;
      });
    }
    return Object.is(c2, t2);
  };
  var c = (t2) => {
    var o2, s2, i2;
    return n(t2) ? r(t2) ? null != (o2 = null == (s2 = (i2 = t2[e]()).getSelectionKeys) ? void 0 : s2.call(i2)) ? o2 : [] : Array.isArray(t2) ? a(t2, c) : a(Object.values(t2), c) : [];
  };
  var a = (e2, t2) => e2.reduce((e3, n2) => e3.concat(t2(n2)), []);
  function s(t2) {
    return { [e]: () => ({ match: (e2) => {
      let n2 = {};
      const r2 = (e3, t3) => {
        n2[e3] = t3;
      };
      return void 0 === e2 ? (c(t2).forEach((e3) => r2(e3, void 0)), { matched: true, selections: n2 }) : { matched: o(t2, e2, r2), selections: n2 };
    }, getSelectionKeys: () => c(t2), matcherType: "optional" }) };
  }
  function i(t2) {
    return { [e]: () => ({ match: (e2) => {
      if (!Array.isArray(e2))
        return { matched: false };
      let n2 = {};
      if (0 === e2.length)
        return c(t2).forEach((e3) => {
          n2[e3] = [];
        }), { matched: true, selections: n2 };
      const r2 = (e3, t3) => {
        n2[e3] = (n2[e3] || []).concat([t3]);
      };
      return { matched: e2.every((e3) => o(t2, e3, r2)), selections: n2 };
    }, getSelectionKeys: () => c(t2) }) };
  }
  function u(...t2) {
    return { [e]: () => ({ match: (e2) => {
      let n2 = {};
      const r2 = (e3, t3) => {
        n2[e3] = t3;
      };
      return { matched: t2.every((t3) => o(t3, e2, r2)), selections: n2 };
    }, getSelectionKeys: () => a(t2, c), matcherType: "and" }) };
  }
  function l(...t2) {
    return { [e]: () => ({ match: (e2) => {
      let n2 = {};
      const r2 = (e3, t3) => {
        n2[e3] = t3;
      };
      return a(t2, c).forEach((e3) => r2(e3, void 0)), { matched: t2.some((t3) => o(t3, e2, r2)), selections: n2 };
    }, getSelectionKeys: () => a(t2, c), matcherType: "or" }) };
  }
  function h(t2) {
    return { [e]: () => ({ match: (e2) => ({ matched: !o(t2, e2, () => {
    }) }), getSelectionKeys: () => [], matcherType: "not" }) };
  }
  function f(t2) {
    return { [e]: () => ({ match: (e2) => ({ matched: Boolean(t2(e2)) }) }) };
  }
  function y(...n2) {
    const r2 = "string" == typeof n2[0] ? n2[0] : void 0, a2 = 2 === n2.length ? n2[1] : "string" == typeof n2[0] ? void 0 : n2[0];
    return { [e]: () => ({ match: (e2) => {
      let n3 = { [null != r2 ? r2 : t]: e2 };
      return { matched: void 0 === a2 || o(a2, e2, (e3, t2) => {
        n3[e3] = t2;
      }), selections: n3 };
    }, getSelectionKeys: () => [null != r2 ? r2 : t].concat(void 0 === a2 ? [] : c(a2)) }) };
  }
  var m = f(function(e2) {
    return true;
  });
  var v = m;
  var d = f(function(e2) {
    return "string" == typeof e2;
  });
  var g = f(function(e2) {
    return "number" == typeof e2;
  });
  var p = f(function(e2) {
    return "boolean" == typeof e2;
  });
  var b = f(function(e2) {
    return "bigint" == typeof e2;
  });
  var w = f(function(e2) {
    return "symbol" == typeof e2;
  });
  var A = f(function(e2) {
    return null == e2;
  });
  var S = { __proto__: null, optional: s, array: i, intersection: u, union: l, not: h, when: f, select: y, any: m, _: v, string: d, number: g, boolean: p, bigint: b, symbol: w, nullish: A, instanceOf: function(e2) {
    return f(function(e3) {
      return (t2) => t2 instanceof e3;
    }(e2));
  }, typed: function() {
    return { array: i, optional: s, intersection: u, union: l, not: h, select: y, when: f };
  } };
  var K = (e2) => new O(e2, []);
  var O = class {
    constructor(e2, t2) {
      this.value = void 0, this.cases = void 0, this.value = e2, this.cases = t2;
    }
    with(...e2) {
      const n2 = e2[e2.length - 1], r2 = [e2[0]], c2 = [];
      return 3 === e2.length && "function" == typeof e2[1] ? (r2.push(e2[0]), c2.push(e2[1])) : e2.length > 2 && r2.push(...e2.slice(1, e2.length - 1)), new O(this.value, this.cases.concat([{ match: (e3) => {
        let n3 = {};
        const a2 = Boolean(r2.some((t2) => o(t2, e3, (e4, t3) => {
          n3[e4] = t3;
        })) && c2.every((t2) => t2(e3)));
        return { matched: a2, value: a2 && Object.keys(n3).length ? t in n3 ? n3[t] : n3 : e3 };
      }, handler: n2 }]));
    }
    when(e2, t2) {
      return new O(this.value, this.cases.concat([{ match: (t3) => ({ matched: Boolean(e2(t3)), value: t3 }), handler: t2 }]));
    }
    otherwise(e2) {
      return new O(this.value, this.cases.concat([{ match: (e3) => ({ matched: true, value: e3 }), handler: e2 }])).run();
    }
    exhaustive() {
      return this.run();
    }
    run() {
      let e2, t2 = this.value;
      for (let n2 = 0; n2 < this.cases.length; n2++) {
        const r2 = this.cases[n2], o2 = r2.match(this.value);
        if (o2.matched) {
          t2 = o2.value, e2 = r2.handler;
          break;
        }
      }
      if (!e2) {
        let e3;
        try {
          e3 = JSON.stringify(this.value);
        } catch (t3) {
          e3 = this.value;
        }
        throw new Error(`Pattern matching error: no pattern matches value ${e3}`);
      }
      return e2(t2, this.value);
    }
  };

  // src/Scanner/index.ts
  var reservedWords = /* @__PURE__ */ new Map([
    ["AND" /* AND */.toLowerCase(), "AND" /* AND */],
    ["CLASS" /* CLASS */.toLowerCase(), "CLASS" /* CLASS */],
    ["ELSE" /* ELSE */.toLowerCase(), "ELSE" /* ELSE */],
    ["FALSE" /* FALSE */.toLowerCase(), "FALSE" /* FALSE */],
    ["FOR" /* FOR */.toLowerCase(), "FOR" /* FOR */],
    ["FUN" /* FUN */.toLowerCase(), "FUN" /* FUN */],
    ["IF" /* IF */.toLowerCase(), "IF" /* IF */],
    ["NIL" /* NIL */.toLowerCase(), "NIL" /* NIL */],
    ["OR" /* OR */.toLowerCase(), "OR" /* OR */],
    ["PRINT" /* PRINT */.toLowerCase(), "PRINT" /* PRINT */],
    ["RETURN" /* RETURN */.toLowerCase(), "RETURN" /* RETURN */],
    ["SUPER" /* SUPER */.toLowerCase(), "SUPER" /* SUPER */],
    ["THIS" /* THIS */.toLowerCase(), "THIS" /* THIS */],
    ["TRUE" /* TRUE */.toLowerCase(), "TRUE" /* TRUE */],
    ["VAR" /* VAR */.toLowerCase(), "VAR" /* VAR */],
    ["WHILE" /* WHILE */.toLowerCase(), "WHILE" /* WHILE */]
  ]);
  var Scanner = class {
    constructor(source, errorCallback) {
      this.tokens = [];
      this.start = 0;
      this.current = 0;
      this.line = 1;
      this.source = source;
      this.errorCallback = errorCallback;
    }
    scanTokens() {
      while (!this.isAtEnd()) {
        this.start = this.current;
        this.scanToken();
      }
      this.addToken("EOF" /* EOF */);
      return this.tokens;
    }
    isAtEnd() {
      return this.current >= this.source.length;
    }
    scanToken() {
      const c2 = this.advance();
      switch (c2) {
        case "(":
          this.addToken("LEFT_PAREN" /* LEFT_PAREN */);
          break;
        case ")":
          this.addToken("RIGHT_PAREN" /* RIGHT_PAREN */);
          break;
        case "{":
          this.addToken("LEFT_BRACE" /* LEFT_BRACE */);
          break;
        case "}":
          this.addToken("RIGHT_BRACE" /* RIGHT_BRACE */);
          break;
        case ",":
          this.addToken("COMMA" /* COMMA */);
          break;
        case ".":
          this.addToken("DOT" /* DOT */);
          break;
        case "-":
          this.addToken("MINUS" /* MINUS */);
          break;
        case "+":
          this.addToken("PLUS" /* PLUS */);
          break;
        case ";":
          this.addToken("SEMICOLON" /* SEMICOLON */);
          break;
        case "*":
          this.addToken("STAR" /* STAR */);
          break;
        case "!":
          this.addToken(this.match("=") ? "BANG_EQUAL" /* BANG_EQUAL */ : "BANG" /* BANG */);
          break;
        case "=":
          this.addToken(
            this.match("=") ? "EQUAL_EQUAL" /* EQUAL_EQUAL */ : "EQUAL" /* EQUAL */
          );
          break;
        case "<":
          this.addToken(this.match("=") ? "LESS_EQUAL" /* LESS_EQUAL */ : "LESS" /* LESS */);
          break;
        case ">":
          this.addToken(
            this.match("=") ? "GREATER_EQUAL" /* GREATER_EQUAL */ : "GREATER" /* GREATER */
          );
          break;
        case "/":
          if (this.match("/"))
            while (this.peek() != "\n" && !this.isAtEnd())
              this.advance();
          else
            this.addToken("SLASH" /* SLASH */);
          break;
        case " ":
        case "\r":
        case "	":
          break;
        case "\n":
          this.line++;
          break;
        case '"':
          this.string();
          break;
        default:
          if (this.isDigit(c2))
            this.number();
          else if (this.isAlpha(c2))
            this.identifier();
          else
            this.errorCallback(this.line, `Unexpected character.`);
          break;
      }
    }
    advance() {
      return this.source[this.current++];
    }
    addToken(tokenName, literal = null) {
      const lexeme = this.source.substring(this.start, this.current);
      K([tokenName, literal]).with(
        ["STRING" /* STRING */, S.string],
        ([, literal2]) => this.tokens.push({
          tokenName: "STRING" /* STRING */,
          lexeme,
          literal: literal2,
          line: this.line
        })
      ).with(
        ["NUMBER" /* NUMBER */, S.number],
        ([, literal2]) => this.tokens.push({
          tokenName: "NUMBER" /* NUMBER */,
          lexeme,
          literal: literal2,
          line: this.line
        })
      ).with(
        ["EOF" /* EOF */],
        () => this.tokens.push({ tokenName: "EOF" /* EOF */, line: this.line })
      ).with(
        [
          S.when(
            (tokenName2) => tokenName2 !== "STRING" /* STRING */ || "NUMBER" /* NUMBER */ || "EOF" /* EOF */
          ),
          S.nullish
        ],
        ([tokenName2]) => this.tokens.push({
          tokenName: tokenName2,
          lexeme,
          literal: null,
          line: this.line
        })
      ).otherwise(() => this.errorCallback(this.line, "Unexpected token form."));
    }
    match(expected) {
      if (this.isAtEnd())
        return false;
      if (this.peek() !== expected)
        return false;
      this.current++;
      return true;
    }
    // a lookahead
    peek(n2 = 1) {
      if (this.isAtEnd())
        return "/0";
      return this.source[this.current + (n2 - 1)];
    }
    string() {
      while (this.peek() !== '"' && !this.isAtEnd()) {
        if (this.peek() === "\n")
          this.line++;
        this.advance();
      }
      if (this.isAtEnd()) {
        this.errorCallback(this.line, "Unterminated string.");
        return;
      }
      this.advance();
      const value = this.source.substring(this.start + 1, this.current - 1);
      this.addToken("STRING" /* STRING */, value);
    }
    isDigit(c2) {
      return !!c2.match(/^[0-9]$/);
    }
    number() {
      while (this.isDigit(this.peek()))
        this.advance();
      if (this.peek() === "." && this.isDigit(this.peek(2))) {
        this.advance();
        while (this.isDigit(this.peek()))
          this.advance();
      }
      const value = parseFloat(this.source.substring(this.start, this.current));
      this.addToken("NUMBER" /* NUMBER */, value);
    }
    identifier() {
      while (this.isAlphaNumeric(this.peek()))
        this.advance();
      const lexeme = this.source.substring(this.start, this.current);
      if (reservedWords.has(lexeme))
        this.addToken(reservedWords.get(lexeme));
      else
        this.addToken("IDENTIFIER" /* IDENTIFIER */);
    }
    isAlphaNumeric(c2) {
      return this.isAlpha(c2) || this.isDigit(c2);
    }
    isAlpha(c2) {
      return !!c2.match(/^[a-zA-Z_]$/);
    }
  };
  var Scanner_default = Scanner;

  // src/Parser/index.ts
  var MAX_FUN_PARAM_COUNT = 255;
  var ParseError = class extends Error {
    constructor() {
      super();
      Object.setPrototypeOf(this, ParseError.prototype);
    }
  };
  var Parser = class {
    constructor(tokens, errorCallback) {
      this.current = 0;
      this.tokens = tokens;
      this.errorCallback = errorCallback;
    }
    parse() {
      const statements = [];
      while (!this.isAtEnd()) {
        const statement = this.declaration();
        if (statement)
          statements.push(statement);
      }
      return statements;
    }
    declaration() {
      try {
        switch (this.peek().tokenName) {
          case "VAR" /* VAR */:
            return this.varDeclaration();
          case "FUN" /* FUN */:
            return this.funDeclaration();
          case "CLASS" /* CLASS */:
            return this.classDeclaration();
          default:
            return this.statement();
        }
      } catch (err) {
        if (err instanceof ParseError) {
          this.synchronise();
        }
        return null;
      }
    }
    classDeclaration() {
      this.advance();
      return K(this.peek()).with({ tokenName: "IDENTIFIER" /* IDENTIFIER */ }, (className) => {
        this.advance();
        let superclassVar = null;
        if (this.peek().tokenName === "LESS" /* LESS */) {
          this.advance();
          superclassVar = K(this.peek()).with({ tokenName: "IDENTIFIER" /* IDENTIFIER */ }, (token) => {
            this.advance();
            return { variable: token };
          }).otherwise(() => {
            throw this.error(this.peek(), "Expect superclass name.");
          });
        }
        if (this.peek().tokenName !== "LEFT_BRACE" /* LEFT_BRACE */)
          throw this.error(this.peek(), "Expect '{' after class name.");
        this.advance();
        const methods = [];
        while (this.peek().tokenName !== "RIGHT_BRACE" /* RIGHT_BRACE */ && !this.isAtEnd()) {
          methods.push(this.fun(true));
        }
        if (this.peek().tokenName !== "RIGHT_BRACE" /* RIGHT_BRACE */)
          throw this.error(this.peek(), "Expect '}' after class body.");
        this.advance();
        return {
          superclassVar,
          className,
          methods
        };
      }).otherwise((token) => {
        throw this.error(token, "Expect class name.");
      });
    }
    funDeclaration() {
      this.advance();
      return this.fun();
    }
    fun(isMethod) {
      const methodOrFunction = `${!!isMethod ? "method" : "function"}`;
      return K(this.peek()).with({ tokenName: "IDENTIFIER" /* IDENTIFIER */ }, (funName) => {
        this.advance();
        if (this.peek().tokenName !== "LEFT_PAREN" /* LEFT_PAREN */)
          throw this.error(
            this.peek(),
            `Expect '(' after ${methodOrFunction}.`
          );
        this.advance();
        const params = K(this.peek()).with({ tokenName: "IDENTIFIER" /* IDENTIFIER */ }, (first) => {
          this.advance();
          const paramList = [first];
          while (this.peek().tokenName === "COMMA" /* COMMA */) {
            this.advance();
            paramList.push(
              K(this.peek()).with({ tokenName: "IDENTIFIER" /* IDENTIFIER */ }, (token) => {
                this.advance();
                return token;
              }).otherwise(() => {
                throw this.error(this.peek(), "Expect parameter name.");
              })
            );
            if (paramList.length >= MAX_FUN_PARAM_COUNT)
              this.error(this.peek(), "Can't have more than 255 parameters.");
          }
          return paramList;
        }).otherwise(() => []);
        if (this.peek().tokenName !== "RIGHT_PAREN" /* RIGHT_PAREN */)
          throw this.error(this.peek(), "Expect ')' after parameters.");
        this.advance();
        if (this.peek().tokenName !== "LEFT_BRACE" /* LEFT_BRACE */)
          throw this.error(
            this.peek(),
            `Expect '{' before ${methodOrFunction} body.`
          );
        const funBody = this.block();
        return { funName, params, funBody };
      }).otherwise((token) => {
        throw this.error(token, `Expect ${methodOrFunction} name.`);
      });
    }
    varDeclaration() {
      this.advance();
      const identifier = K(this.peek()).with({ tokenName: "IDENTIFIER" /* IDENTIFIER */ }, (token) => {
        this.advance();
        return token;
      }).otherwise(() => {
        throw this.error(this.peek(), "Expect variable name.");
      });
      const initialiser = K(this.peek()).with({ tokenName: "EQUAL" /* EQUAL */ }, () => {
        this.advance();
        return this.expression();
      }).otherwise(() => null);
      if (this.peek().tokenName !== "SEMICOLON" /* SEMICOLON */)
        throw this.error(this.peek(), "Expect ';' after expression.");
      this.advance();
      return { identifier, initialiser };
    }
    statement() {
      return K(this.peek()).with({ tokenName: "PRINT" /* PRINT */ }, () => this.printStatement()).with({ tokenName: "LEFT_BRACE" /* LEFT_BRACE */ }, () => this.block()).with({ tokenName: "IF" /* IF */ }, () => this.ifStatement()).with({ tokenName: "WHILE" /* WHILE */ }, () => this.whileStatement()).with({ tokenName: "FOR" /* FOR */ }, () => this.forStatement()).with({ tokenName: "RETURN" /* RETURN */ }, () => this.returnStatement()).otherwise(() => this.expressionStatement());
    }
    returnStatement() {
      const token = this.advance();
      return K(this.peek()).with({ tokenName: "SEMICOLON" /* SEMICOLON */ }, () => {
        this.advance();
        return {
          stmtType: "RETURN",
          token,
          expr: {
            tokenName: "NIL" /* NIL */,
            lexeme: "nil",
            literal: null,
            line: -1
          }
        };
      }).otherwise(() => {
        const expr = this.expression();
        if (this.peek().tokenName !== "SEMICOLON" /* SEMICOLON */)
          throw this.error(this.peek(), "Expect ';' after return value.");
        this.advance();
        return {
          stmtType: "RETURN",
          token,
          expr
        };
      });
    }
    whileStatement() {
      this.advance();
      if (this.peek().tokenName !== "LEFT_PAREN" /* LEFT_PAREN */)
        throw this.error(this.peek(), "Expect '(' after 'while'.");
      this.advance();
      const condition = this.expression();
      if (this.peek().tokenName !== "RIGHT_PAREN" /* RIGHT_PAREN */)
        throw this.error(this.peek(), "Expect ')' after while condition.");
      this.advance();
      const body = this.statement();
      return { condition, body };
    }
    forStatement() {
      this.advance();
      if (this.peek().tokenName !== "LEFT_PAREN" /* LEFT_PAREN */)
        throw this.error(this.peek(), "Expect '(' after 'for'.");
      this.advance();
      const initialiser = K(this.peek()).with({ tokenName: "SEMICOLON" /* SEMICOLON */ }, () => {
        this.advance();
        return null;
      }).with({ tokenName: "VAR" /* VAR */ }, () => this.varDeclaration()).otherwise(() => this.expressionStatement());
      const condition = K(this.peek()).with({ tokenName: "SEMICOLON" /* SEMICOLON */ }, ({ line }) => {
        return {
          tokenName: "TRUE" /* TRUE */,
          lexeme: "true",
          literal: null,
          line
        };
      }).otherwise(() => this.expression());
      if (this.peek().tokenName !== "SEMICOLON" /* SEMICOLON */)
        throw this.error(this.peek(), "Expect ';' after loop condition.");
      this.advance();
      const increment = K(this.peek()).with({ tokenName: "SEMICOLON" /* SEMICOLON */ }, () => {
        this.advance();
        return null;
      }).otherwise(() => this.expression());
      if (this.peek().tokenName !== "RIGHT_PAREN" /* RIGHT_PAREN */)
        throw this.error(this.peek(), "Expect ')' after for clauses.");
      this.advance();
      let body = this.statement();
      if (increment)
        body = { statements: [body, { stmtType: "EXPR", expr: increment }] };
      body = { condition, body };
      if (initialiser)
        body = { statements: [initialiser, body] };
      return body;
    }
    ifStatement() {
      this.advance();
      if (this.peek().tokenName !== "LEFT_PAREN" /* LEFT_PAREN */)
        throw this.error(this.peek(), "Expect '(' after 'if'.");
      this.advance();
      const condition = this.expression();
      if (this.peek().tokenName !== "RIGHT_PAREN" /* RIGHT_PAREN */)
        throw this.error(this.peek(), "Expect ')' after if condition.");
      this.advance();
      const consequent = this.statement();
      let alternative = null;
      if (this.peek().tokenName === "ELSE" /* ELSE */) {
        this.advance();
        alternative = this.statement();
      }
      return { condition, consequent, alternative };
    }
    block() {
      this.advance();
      const statements = [];
      while (this.peek().tokenName !== "RIGHT_BRACE" /* RIGHT_BRACE */ && !this.isAtEnd()) {
        const statement = this.declaration();
        if (statement)
          statements.push(statement);
      }
      if (this.peek().tokenName !== "RIGHT_BRACE" /* RIGHT_BRACE */)
        throw this.error(this.peek(), "Expect ';' after expression.");
      this.advance();
      return { statements };
    }
    printStatement() {
      this.advance();
      const expr = this.expression();
      if (this.peek().tokenName !== "SEMICOLON" /* SEMICOLON */)
        throw this.error(this.peek(), "Expect ';' after expression.");
      this.advance();
      return { stmtType: "PRINT", expr };
    }
    expressionStatement() {
      const expr = this.expression();
      if (this.peek().tokenName !== "SEMICOLON" /* SEMICOLON */)
        throw this.error(this.peek(), "Expect ';' after expression.");
      this.advance();
      return { stmtType: "EXPR", expr };
    }
    expression() {
      return this.assignment();
    }
    assignment() {
      const expr = this.or();
      return K(this.peek()).with({ tokenName: "EQUAL" /* EQUAL */ }, (token) => {
        this.advance();
        const assignExpr = this.assignment();
        return K(expr).with({ variable: S._ }, ({ variable }) => ({
          assignVar: variable,
          assignExpr
        })).with({ before: S._, field: S._ }, (assignTo) => ({
          assignTo,
          token,
          assignExpr
        })).otherwise(() => {
          this.error(token, "Invalid assignment target.");
          return expr;
        });
      }).otherwise(() => expr);
    }
    or() {
      let expr = this.and();
      while (this.peek().tokenName === "OR" /* OR */) {
        const op = this.advance();
        const rightExpr = this.and();
        expr = { op, leftExpr: expr, rightExpr };
      }
      return expr;
    }
    and() {
      let expr = this.equality();
      while (this.peek().tokenName === "AND" /* AND */) {
        const op = this.advance();
        const rightExpr = this.equality();
        expr = { op, leftExpr: expr, rightExpr };
      }
      return expr;
    }
    equality() {
      let expr = this.comparison();
      while (this.peek().tokenName === "EQUAL_EQUAL" /* EQUAL_EQUAL */ || this.peek().tokenName === "BANG_EQUAL" /* BANG_EQUAL */) {
        const op = this.advance();
        expr = { op, leftExpr: expr, rightExpr: this.equality() };
      }
      return expr;
    }
    comparison() {
      let expr = this.term();
      while (this.peek().tokenName === "GREATER" /* GREATER */ || this.peek().tokenName === "GREATER_EQUAL" /* GREATER_EQUAL */ || this.peek().tokenName === "LESS" /* LESS */ || this.peek().tokenName === "LESS_EQUAL" /* LESS_EQUAL */) {
        const op = this.advance();
        expr = { op, leftExpr: expr, rightExpr: this.term() };
      }
      return expr;
    }
    term() {
      let expr = this.factor();
      while (this.peek().tokenName === "MINUS" /* MINUS */ || this.peek().tokenName === "PLUS" /* PLUS */) {
        const op = this.advance();
        expr = { op, leftExpr: expr, rightExpr: this.factor() };
      }
      return expr;
    }
    factor() {
      let expr = this.unary();
      while (this.peek().tokenName === "SLASH" /* SLASH */ || this.peek().tokenName === "STAR" /* STAR */) {
        const op = this.advance();
        expr = { op, leftExpr: expr, rightExpr: this.unary() };
      }
      return expr;
    }
    unary() {
      const token = this.peek();
      return K(token).with(
        { tokenName: "BANG" /* BANG */ },
        { tokenName: "MINUS" /* MINUS */ },
        (token2) => {
          this.advance();
          const expr = this.unary();
          return { op: token2, expr };
        }
      ).otherwise(() => this.call());
    }
    call() {
      let expr = this.primary();
      while (this.peek().tokenName === "DOT" /* DOT */ || this.peek().tokenName === "LEFT_PAREN" /* LEFT_PAREN */) {
        K(this.peek()).with({ tokenName: "DOT" /* DOT */ }, (token) => {
          this.advance();
          if (this.peek().tokenName !== "IDENTIFIER" /* IDENTIFIER */)
            throw this.error(this.peek(), "Expect property name after '.'.");
          const identifier = this.advance();
          expr = {
            before: expr,
            token,
            field: identifier
          };
        }).with({ tokenName: "LEFT_PAREN" /* LEFT_PAREN */ }, () => {
          this.advance();
          const args = this.peek().tokenName !== "RIGHT_PAREN" /* RIGHT_PAREN */ ? this.args() : [];
          const endToken = K(this.peek()).with({ tokenName: "RIGHT_PAREN" /* RIGHT_PAREN */ }, (token) => {
            this.advance();
            return token;
          }).otherwise((token) => {
            throw this.error(token, "Expect ')' after arguments.");
          });
          expr = {
            callee: expr,
            endToken,
            args
          };
        }).otherwise(() => expr);
      }
      return expr;
    }
    args() {
      const argList = [this.expression()];
      while (this.peek().tokenName === "COMMA" /* COMMA */) {
        this.advance();
        argList.push(this.expression());
        if (argList.length >= MAX_FUN_PARAM_COUNT)
          this.error(this.peek(), "Can't have more than 255 arguments.");
      }
      return argList;
    }
    primary() {
      const token = this.peek();
      return K(token).with(
        { tokenName: "THIS" /* THIS */ },
        { tokenName: "NUMBER" /* NUMBER */ },
        { tokenName: "STRING" /* STRING */ },
        { tokenName: "TRUE" /* TRUE */ },
        { tokenName: "FALSE" /* FALSE */ },
        { tokenName: "NIL" /* NIL */ },
        (token2) => {
          this.advance();
          return token2;
        }
      ).with({ tokenName: "LEFT_PAREN" /* LEFT_PAREN */ }, () => {
        this.advance();
        const expr = this.expression();
        if (this.peek().tokenName !== "RIGHT_PAREN" /* RIGHT_PAREN */)
          throw this.error(this.peek(), "Expect ')' after expression.");
        this.advance();
        return { expr };
      }).with({ tokenName: "IDENTIFIER" /* IDENTIFIER */ }, (token2) => {
        this.advance();
        return { variable: token2 };
      }).with({ tokenName: "SUPER" /* SUPER */ }, (token2) => {
        this.advance();
        if (this.peek().tokenName !== "DOT" /* DOT */)
          throw this.error(this.peek(), "Expect '.' after 'super'.");
        this.advance();
        if (this.peek().tokenName !== "IDENTIFIER" /* IDENTIFIER */)
          throw this.error(this.peek(), "Expect superclass method name.");
        return {
          token: token2,
          method: this.advance()
        };
      }).otherwise((token2) => {
        throw this.error(token2, "Expect expression.");
      });
    }
    peek() {
      return this.tokens[this.current];
    }
    isAtEnd() {
      return this.peek().tokenName === "EOF" /* EOF */;
    }
    advance() {
      if (this.isAtEnd())
        return this.peek();
      return this.tokens[this.current++];
    }
    previous() {
      return this.tokens[this.current - 1];
    }
    error(token, message) {
      this.errorCallback(token, message);
      return new ParseError();
    }
    // we'll do synchronisation on statement boundaries
    synchronise() {
      this.advance();
      while (!this.isAtEnd()) {
        if (this.previous().tokenName === "SEMICOLON" /* SEMICOLON */)
          return;
        switch (this.peek().tokenName) {
          case "CLASS" /* CLASS */:
          case "FUN" /* FUN */:
          case "VAR" /* VAR */:
          case "FOR" /* FOR */:
          case "IF" /* IF */:
          case "WHILE" /* WHILE */:
          case "PRINT" /* PRINT */:
          case "RETURN" /* RETURN */:
            return;
        }
        this.advance();
      }
    }
  };
  var Parser_default = Parser;

  // src/Interpreter/Environment/index.ts
  var Environment = class {
    constructor(enclosing) {
      this.values = /* @__PURE__ */ new Map();
      this.enclosing = enclosing != null ? enclosing : null;
    }
    define(name, value) {
      this.values.set(name, value);
    }
    get(variable) {
      if (this.values.has(variable.lexeme))
        return this.values.get(variable.lexeme);
      throw new RuntimeError(
        variable,
        `Undefined variable "${variable.lexeme}".`
      );
    }
    assign(variable, value) {
      if (this.values.has(variable.lexeme)) {
        this.values.set(variable.lexeme, value);
        return value;
      }
      throw new RuntimeError(
        variable,
        `Undefined variable "${variable.lexeme}".`
      );
    }
    getEnclosingEnv() {
      return this.enclosing;
    }
  };
  var Environment_default = Environment;

  // src/Interpreter/index.ts
  var Return = class {
    constructor(value) {
      this.value = value;
    }
  };
  var RuntimeError = class extends Error {
    constructor(token, message) {
      super(message);
      Object.setPrototypeOf(this, RuntimeError.prototype);
      this.token = token;
    }
  };
  function stringify(value) {
    return K(value).with(S.nullish, () => "nil").with({ stringRepr: S.string }, ({ stringRepr }) => stringRepr).otherwise(() => `${value}`);
  }
  var Interpreter = class {
    constructor(errorCallback, writeFn2) {
      this.env = new Environment_default();
      this.errorCallback = errorCallback;
      this.writeFn = writeFn2;
      this.injectNativeFunctions();
    }
    injectNativeFunctions() {
      this.env.define("clock", {
        arity: 0,
        call: () => performance.now() / 1e3,
        stringRepr: "<native fn>",
        isInitialiser: false,
        isClass: false
      });
    }
    interpret(statements, sideTable) {
      try {
        for (let i2 = 0; i2 < statements.length; i2++) {
          const statement = statements[i2];
          this.executeStmt(statement, this.env, sideTable);
        }
      } catch (err) {
        if (err instanceof RuntimeError) {
          this.errorCallback(err.token.line, err.message);
        }
      }
    }
    executeStmt(statement, env, sideTable) {
      return K(statement).with({ stmtType: "PRINT" }, ({ expr }) => {
        const value = this.evaluateAST(expr, env, sideTable);
        this.writeFn(stringify(value));
        return null;
      }).with({ stmtType: "EXPR" }, ({ expr }) => {
        this.evaluateAST(expr, env, sideTable);
        return null;
      }).with({ identifier: S._ }, ({ identifier, initialiser }) => {
        const initialValue = initialiser ? this.evaluateAST(initialiser, env, sideTable) : null;
        env.define(identifier.lexeme, initialValue);
        return null;
      }).with({ statements: S._ }, ({ statements }) => {
        const newEnv = new Environment_default(env);
        for (let i2 = 0; i2 < statements.length; i2++) {
          try {
            this.executeStmt(statements[i2], newEnv, sideTable);
          } catch (ret) {
            if (ret instanceof Return)
              return ret.value;
            throw ret;
          }
        }
        return null;
      }).with(
        { condition: S._, consequent: S._, alternative: S._ },
        ({ condition, consequent, alternative }) => {
          if (!!this.evaluateAST(condition, env, sideTable))
            this.executeStmt(consequent, env, sideTable);
          else if (!!alternative)
            this.executeStmt(alternative, env, sideTable);
          return null;
        }
      ).with({ condition: S._, body: S._ }, ({ condition, body }) => {
        while (this.isTruthy(this.evaluateAST(condition, env, sideTable)))
          this.executeStmt(body, env, sideTable);
        return null;
      }).with(
        { funName: S._, funBody: S._, params: S._ },
        ({ funName, funBody, params }) => {
          const call = (args) => {
            const newEnv = new Environment_default(env);
            params.forEach(
              (param, index) => newEnv.define(param.lexeme, args[index])
            );
            return this.executeStmt(funBody, newEnv, sideTable);
          };
          env.define(funName.lexeme, {
            arity: params.length,
            call,
            stringRepr: `<fn ${funName.lexeme}>`,
            isInitialiser: false,
            isClass: false
          });
          return null;
        }
      ).with({ stmtType: "RETURN" }, ({ expr }) => {
        const returnValue = this.evaluateAST(expr, env, sideTable);
        throw new Return(returnValue);
      }).with({ className: S._ }, ({ className, superclassVar, methods }) => {
        const superclass = superclassVar && K(this.lookUpVariable(env, superclassVar.variable, sideTable)).with({ isClass: true }, (superklass) => superklass).otherwise(() => null);
        let currEnv = env;
        if (superclass) {
          currEnv = new Environment_default(env);
          currEnv.define("super", superclass);
        }
        const methodStore = /* @__PURE__ */ new Map();
        for (let i2 = 0; i2 < methods.length; i2++) {
          const method = methods[i2];
          const { params, funName, funBody } = method;
          const isInitialiser = funName.lexeme === "init";
          methodStore.set(funName.lexeme, {
            arity: methods[i2].params.length,
            bind: (instance) => {
              const newEnv = new Environment_default(currEnv);
              newEnv.define("this", instance);
              return (args) => {
                const newNewEnv = new Environment_default(newEnv);
                params.forEach(
                  (param, index) => newNewEnv.define(param.lexeme, args[index])
                );
                const value = this.executeStmt(funBody, newNewEnv, sideTable);
                if (isInitialiser)
                  return instance;
                return value;
              };
            },
            stringRepr: `<${className.lexeme} method ${funName.lexeme}>`,
            isInitialiser
          });
        }
        const klass = {
          isClass: true,
          arity: (() => {
            if (methodStore.has("init"))
              return methodStore.get("init").arity;
            return 0;
          })(),
          stringRepr: className.lexeme,
          isInitialiser: false,
          findMethod: (methodName) => {
            if (methodStore.has(methodName))
              return methodStore.get(methodName);
            if (superclass)
              return superclass.findMethod(methodName);
            return null;
          },
          call: (args) => {
            const fieldStore = /* @__PURE__ */ new Map();
            const instance = {
              fieldStore,
              access: (property) => {
                if (fieldStore.has(property.lexeme))
                  return fieldStore.get(property.lexeme);
                const foundMethod = klass.findMethod(property.lexeme);
                if (foundMethod) {
                  const { arity, bind, stringRepr, isInitialiser } = foundMethod;
                  return {
                    isClass: false,
                    arity,
                    call: bind(instance),
                    isInitialiser,
                    stringRepr
                  };
                }
                throw new RuntimeError(
                  property,
                  `Undefined property ${property.lexeme}`
                );
              },
              put: (property, value) => {
                fieldStore.set(property.lexeme, value);
              },
              stringRepr: `${className.lexeme} instance`
            };
            if (methodStore.has("init")) {
              const initialiser = methodStore.get("init");
              initialiser.bind(instance)(args);
            }
            return instance;
          }
        };
        env.define(className.lexeme, klass);
        return null;
      }).exhaustive();
    }
    evaluateAST(expr, env, sideTable) {
      return K(expr).with(
        { tokenName: "STRING" /* STRING */ },
        { tokenName: "NUMBER" /* NUMBER */ },
        ({ literal }) => literal
      ).with({ tokenName: "TRUE" /* TRUE */ }, () => true).with({ tokenName: "FALSE" /* FALSE */ }, () => false).with({ tokenName: "NIL" /* NIL */ }, () => null).with({ expr: S._, op: S._ }, ({ expr: expr2, op }) => {
        const value = this.evaluateAST(expr2, env, sideTable);
        switch (op.tokenName) {
          case "MINUS" /* MINUS */:
            this.checkNumberOperand(op, value);
            return -1 * Number(value);
          case "BANG" /* BANG */:
            return !this.isTruthy(value);
        }
        return null;
      }).with(
        {
          leftExpr: S._,
          rightExpr: S._,
          op: { tokenName: S.not(S.union("AND" /* AND */, "OR" /* OR */)) }
        },
        ({ leftExpr, rightExpr, op }) => {
          const left = this.evaluateAST(leftExpr, env, sideTable);
          const right = this.evaluateAST(rightExpr, env, sideTable);
          switch (op.tokenName) {
            case "MINUS" /* MINUS */:
              this.checkNumberOperands(op, left, right);
              return Number(left) - Number(right);
            case "PLUS" /* PLUS */: {
              if (typeof left === "string" && typeof right === "string")
                return String(left) + String(right);
              if (typeof left === "number" && typeof right === "number")
                return Number(left) + Number(right);
              throw new RuntimeError(
                op,
                "Operands must be two numbers or two strings."
              );
            }
            case "SLASH" /* SLASH */:
              this.checkNumberOperands(op, left, right);
              return Number(left) / Number(right);
            case "STAR" /* STAR */:
              this.checkNumberOperands(op, left, right);
              return Number(left) * Number(right);
            case "GREATER" /* GREATER */:
              this.checkNumberOperands(op, left, right);
              return Number(left) > Number(right);
            case "GREATER_EQUAL" /* GREATER_EQUAL */:
              this.checkNumberOperands(op, left, right);
              return Number(left) >= Number(right);
            case "LESS" /* LESS */:
              this.checkNumberOperands(op, left, right);
              return Number(left) < Number(right);
            case "LESS_EQUAL" /* LESS_EQUAL */:
              this.checkNumberOperands(op, left, right);
              return Number(left) <= Number(right);
            case "BANG_EQUAL" /* BANG_EQUAL */:
              return left !== right;
            case "EQUAL_EQUAL" /* EQUAL_EQUAL */:
              return left === right;
          }
          return null;
        }
      ).with(
        {
          leftExpr: S._,
          rightExpr: S._,
          op: { tokenName: S.union("AND" /* AND */, "OR" /* OR */) }
        },
        ({ leftExpr, rightExpr, op }) => {
          const left = this.evaluateAST(leftExpr, env, sideTable);
          switch (op.tokenName) {
            case "AND" /* AND */: {
              if (!this.isTruthy(left))
                return left;
              return this.evaluateAST(rightExpr, env, sideTable);
            }
            case "OR" /* OR */: {
              if (this.isTruthy(left))
                return left;
              return this.evaluateAST(rightExpr, env, sideTable);
            }
          }
        }
      ).with(
        { expr: S._ },
        ({ expr: expr2 }) => this.evaluateAST(expr2, env, sideTable)
      ).with({ variable: S._ }, ({ variable }) => {
        return this.lookUpVariable(env, variable, sideTable);
      }).with(
        { assignVar: S._, assignExpr: S._ },
        ({ assignVar, assignExpr }) => {
          const value = this.evaluateAST(assignExpr, env, sideTable);
          return this.assignVariable(env, assignVar, sideTable, value);
        }
      ).with(
        { callee: S._, endToken: S._, args: S._ },
        ({ callee, endToken, args }) => {
          return K(this.evaluateAST(callee, env, sideTable)).with({ arity: S.number, call: S._ }, ({ arity, call }) => {
            if (args.length !== arity) {
              throw new RuntimeError(
                endToken,
                `Expected ${arity} arguments but got ${args.length}.`
              );
            }
            return call(
              args.map((arg) => this.evaluateAST(arg, env, sideTable))
            );
          }).otherwise(() => {
            throw new RuntimeError(
              endToken,
              "Can only call functions and classes."
            );
          });
        }
      ).with({ before: S._ }, ({ before, token, field }) => {
        const obj = this.evaluateAST(before, env, sideTable);
        return K(obj).with({ fieldStore: S._ }, ({ access }) => {
          return access(field);
        }).otherwise(() => {
          throw new RuntimeError(token, "Only instances have properties.");
        });
      }).with(
        { assignTo: S._, assignExpr: S._ },
        ({ assignTo: { before, field, token }, assignExpr }) => {
          const obj = this.evaluateAST(before, env, sideTable);
          return K(obj).with({ fieldStore: S._ }, ({ put }) => {
            const value = this.evaluateAST(assignExpr, env, sideTable);
            put(field, value);
            return value;
          }).otherwise(() => {
            throw new RuntimeError(token, "Only instances have fields");
          });
        }
      ).with({ tokenName: "THIS" /* THIS */ }, (token) => {
        return this.lookUpVariable(env, token, sideTable);
      }).with({ token: { tokenName: "SUPER" /* SUPER */ } }, ({ token, method }) => {
        const superDepth = sideTable.get(token);
        const thisDepth = superDepth - 1;
        const superclass = this.lookUpVariable(
          env,
          token,
          sideTable
        );
        const instance = this.searchEnvAtDepth(
          env,
          {
            tokenName: "THIS" /* THIS */,
            line: -1,
            lexeme: "this",
            literal: null
          },
          thisDepth
        );
        const foundMethod = superclass.findMethod(method.lexeme);
        if (foundMethod)
          return {
            arity: foundMethod.arity,
            call: foundMethod.bind(instance),
            stringRepr: foundMethod.stringRepr,
            isInitialiser: foundMethod.isInitialiser,
            isClass: false
          };
        throw new RuntimeError(
          method,
          "Undefined property '" + method.lexeme + "'."
        );
      }).exhaustive();
    }
    isTruthy(value) {
      if (value === null)
        return false;
      if (typeof value === "boolean")
        return !!value;
      return true;
    }
    checkNumberOperands(operator, leftOperand, rightOperand) {
      if (typeof leftOperand === "number" && typeof rightOperand === "number")
        return;
      throw new RuntimeError(operator, "Operands must be numbers.");
    }
    checkNumberOperand(operator, operand) {
      if (typeof operand === "number")
        return;
      throw new RuntimeError(operator, "Operand must be a number.");
    }
    lookUpVariable(curr, identifier, sideTable) {
      if (!sideTable.has(identifier))
        return this.env.get(identifier);
      const depth = sideTable.get(identifier);
      return this.searchEnvAtDepth(curr, identifier, depth);
    }
    assignVariable(curr, identifier, sideTable, value) {
      return this.searchEnv(curr, identifier, sideTable).assign(
        identifier,
        value
      );
    }
    searchEnvAtDepth(curr, identifier, depth) {
      var _a;
      let c2 = curr;
      for (let i2 = 0; i2 < depth; i2++) {
        c2 = (_a = c2 == null ? void 0 : c2.getEnclosingEnv()) != null ? _a : null;
      }
      return (c2 != null ? c2 : this.env).get(identifier);
    }
    searchEnv(curr, identifier, sideTable) {
      var _a;
      if (!sideTable.has(identifier))
        return this.env;
      const depth = sideTable.get(identifier);
      let c2 = curr;
      for (let i2 = 0; i2 < depth; i2++) {
        c2 = (_a = c2 == null ? void 0 : c2.getEnclosingEnv()) != null ? _a : null;
      }
      return c2 != null ? c2 : this.env;
    }
  };
  var Interpreter_default = Interpreter;

  // src/Resolver/index.ts
  var Resolver = class {
    constructor(resolverErrorCallback2) {
      this.currentFunctionType = 0 /* NONE */;
      this.currentClassType = 0 /* NONE */;
      this.scopes = [];
      this.locals = /* @__PURE__ */ new Map();
      this.resolverErrorCallback = resolverErrorCallback2;
    }
    resolve(statements) {
      this.locals.clear();
      for (let i2 = 0; i2 < statements.length; i2++)
        this.resolveStmt(statements[i2]);
      return this.locals;
    }
    resolveStmt(statement) {
      return K(statement).with(
        { stmtType: S.union("PRINT", "EXPR") },
        ({ expr }) => this.resolveExpr(expr)
      ).with({ stmtType: "RETURN" }, ({ expr, token }) => {
        if (this.currentFunctionType === 0 /* NONE */)
          this.resolverErrorCallback(
            token,
            "Can't return from top-level code."
          );
        K(expr).with(
          { tokenName: S.not("NIL" /* NIL */) },
          () => this.currentFunctionType === 3 /* INITIALISER */,
          () => this.resolverErrorCallback(
            token,
            "Can't return a value from an initialiser"
          )
        ).otherwise(() => {
        });
        this.resolveExpr(expr);
      }).with({ statements: S._ }, ({ statements }) => {
        this.beginScope();
        for (let i2 = 0; i2 < statements.length; i2++) {
          this.resolveStmt(statements[i2]);
        }
        this.endScope();
      }).with(
        { identifier: S._, initialiser: S._ },
        ({ identifier, initialiser }) => {
          this.declareVar(identifier);
          if (initialiser)
            this.resolveExpr(initialiser);
          this.defineVar(identifier);
        }
      ).with(
        { funName: S._, params: S._, funBody: S._ },
        ({
          funName,
          params,
          funBody,
          functionType = 1 /* FUNCTION */
        }) => {
          this.declareVar(funName);
          this.defineVar(funName);
          const enclosingFunctionType = this.currentFunctionType;
          this.currentFunctionType = functionType;
          this.beginScope();
          for (let i2 = 0; i2 < params.length; i2++) {
            const name = params[i2];
            this.declareVar(name);
            this.defineVar(name);
          }
          this.resolveStmt(funBody);
          this.endScope();
          this.currentFunctionType = enclosingFunctionType;
        }
      ).with(
        { consequent: S._, alternative: S._ },
        ({ condition, consequent, alternative }) => {
          this.resolveExpr(condition);
          this.resolveStmt(consequent);
          if (alternative)
            this.resolveStmt(alternative);
        }
      ).with({ condition: S._, body: S._ }, ({ condition, body }) => {
        this.resolveExpr(condition);
        this.resolveStmt(body);
      }).with({ className: S._ }, ({ superclassVar, className, methods }) => {
        if (superclassVar)
          this.resolveExpr(superclassVar);
        if (superclassVar && superclassVar.variable.lexeme === className.lexeme)
          this.resolverErrorCallback(
            superclassVar.variable,
            "A class can't inherit from itself."
          );
        const enclosingClass = this.currentClassType;
        this.currentClassType = !!superclassVar ? 2 /* SUBCLASS */ : 1 /* CLASS */;
        this.declareVar(className);
        this.defineVar(className);
        if (superclassVar) {
          this.beginScope();
          this.scopes[this.scopes.length - 1].set("super", true);
        }
        this.beginScope();
        this.scopes[this.scopes.length - 1].set("this", true);
        for (let i2 = 0; i2 < methods.length; i2++) {
          const method = methods[i2];
          const functionType = method.funName.lexeme === "init" ? 3 /* INITIALISER */ : 2 /* METHOD */;
          this.resolveStmt(__spreadProps(__spreadValues({}, method), { functionType }));
        }
        this.endScope();
        if (superclassVar)
          this.endScope();
        this.currentClassType = enclosingClass;
      }).exhaustive();
    }
    beginScope() {
      this.scopes.push(/* @__PURE__ */ new Map());
    }
    endScope() {
      this.scopes.pop();
    }
    declareVar(identifier) {
      if (!this.scopes.length)
        return;
      const scope = this.scopes[this.scopes.length - 1];
      if (scope.has(identifier.lexeme))
        this.resolverErrorCallback(
          identifier,
          "Already a variable with this name in this scope."
        );
      scope.set(identifier.lexeme, false);
    }
    defineVar(identifier) {
      if (!this.scopes.length)
        return;
      const scope = this.scopes[this.scopes.length - 1];
      scope.set(identifier.lexeme, true);
    }
    resolveExpr(expression) {
      return K(expression).with({ tokenName: "THIS" /* THIS */ }, (token) => {
        if (this.currentClassType === 0 /* NONE */) {
          this.resolverErrorCallback(
            token,
            "Can't use this outside of a class"
          );
          return;
        }
        this.resolveLocal(token);
      }).with({ tokenName: S._, lexeme: S._ }, () => {
      }).with({ expr: S._ }, ({ expr }) => this.resolveExpr(expr)).with({ leftExpr: S._, rightExpr: S._ }, ({ leftExpr, rightExpr }) => {
        this.resolveExpr(leftExpr);
        this.resolveExpr(rightExpr);
      }).with({ variable: S._ }, ({ variable }) => {
        if (this.scopes.length && this.scopes[this.scopes.length - 1].get(variable.lexeme) === false)
          this.resolverErrorCallback(
            variable,
            "Can't read local variable in its own initialiser."
          );
        this.resolveLocal(variable);
      }).with({ assignVar: S._ }, ({ assignVar, assignExpr }) => {
        this.resolveExpr(assignExpr);
        this.resolveLocal(assignVar);
      }).with({ callee: S._ }, ({ callee, args }) => {
        for (let i2 = 0; i2 < args.length; i2++)
          this.resolveExpr(args[i2]);
        this.resolveExpr(callee);
      }).with({ before: S._, field: S._ }, ({ before }) => {
        this.resolveExpr(before);
      }).with(
        { assignTo: S._, assignExpr: S._ },
        ({ assignTo: { before }, assignExpr }) => {
          this.resolveExpr(before);
          this.resolveExpr(assignExpr);
        }
      ).with({ token: { tokenName: "SUPER" /* SUPER */ } }, ({ token }) => {
        if (this.currentClassType !== 2 /* SUBCLASS */)
          this.resolverErrorCallback(
            token,
            "Can't use 'super' in a class with no superclass."
          );
        this.resolveLocal(token);
      }).exhaustive();
    }
    resolveLocal(key) {
      for (let i2 = this.scopes.length - 1; i2 >= 0; i2--) {
        if (this.scopes[i2].has(key.lexeme)) {
          this.locals.set(key, this.scopes.length - 1 - i2);
          return;
        }
      }
    }
  };
  var Resolver_default = Resolver;

  // src/browser.ts
  var hadError = false;
  var hadRuntimeError = false;
  var errors = [];
  var output = [];
  var writeFn = (text) => output.push(text);
  function scannerErrorCallback(line, message) {
    const msg = `[line ${line}] Error: ${message}`;
    console.error(msg);
    errors.push(msg);
    hadError = true;
  }
  function parserErrorCallback(token, message) {
    const msg = token.tokenName === "EOF" /* EOF */ ? `[line ${token.line}] Error: ${message}` : `[line ${token.line} at '${token.lexeme}'] Error: ${message}`;
    console.error(msg);
    errors.push(msg);
    hadError = true;
  }
  function resolverErrorCallback(token, message) {
    const msg = `[line ${token.line} at '${token.lexeme}'] Error: ${message}`;
    console.error(msg);
    errors.push(msg);
    hadError = true;
  }
  function interpreterErrorCallback(line, message) {
    const msg = message + `
[line ${line}]`;
    console.error(msg);
    errors.push(msg);
    hadRuntimeError = true;
  }
  function run(source, interpreter) {
    const scanner = new Scanner_default(source, scannerErrorCallback);
    const tokens = scanner.scanTokens();
    if (hadError)
      return;
    const parser = new Parser_default(tokens, parserErrorCallback);
    const statements = parser.parse();
    if (hadError)
      return;
    const resolver = new Resolver_default(resolverErrorCallback);
    const sideTable = resolver.resolve(statements);
    if (hadError)
      return;
    interpreter.interpret(statements, sideTable);
  }
  function runProgram(program) {
    hadError = false;
    hadRuntimeError = false;
    errors = [];
    output = [];
    const interpreter = new Interpreter_default(interpreterErrorCallback, writeFn);
    run(program, interpreter);
    let code = 0;
    if (hadError)
      code = 65;
    if (hadRuntimeError)
      code = 70;
    return {
      code,
      errors,
      output
    };
  }
  var lox = {
    runProgram
  };
  window.lox = lox;
})();
