import { Token, TokenName } from "./Scanner/types";
import Scanner from "./Scanner";
import Parser from "./Parser";
import Interpreter from "./Interpreter";
import Resolver from "./Resolver";

let hadError = false;
let hadRuntimeError = false;

function scannerErrorCallback(line: number, message: string) {
  console.error(`[line ${line}] Error: ${message}`);
  hadError = true;
}

function parserErrorCallback(token: Token, message: string) {
  console.error(
    token.tokenName === TokenName.EOF
      ? `[line ${token.line}] Error: ${message}`
      : `[line ${token.line} at '${token.lexeme}'] Error: ${message}`
  );

  hadError = true;
}

function resolverErrorCallback(
  token: Exclude<Token, { tokenName: TokenName.EOF }>,
  message: string
) {
  console.error(`[line ${token.line} at '${token.lexeme}'] Error: ${message}`);
  hadError = true;
}

function interpreterErrorCallback(line: number, message: string) {
  console.error(message + `\n[line ${line}]`);
}

function run(source: string, interpreter: Interpreter) {
  const scanner = new Scanner(source, scannerErrorCallback);
  const tokens = scanner.scanTokens();

  if (hadError) return;

  const parser = new Parser(tokens, parserErrorCallback);
  const statements = parser.parse();

  if (hadError) return;

  const resolver = new Resolver(resolverErrorCallback);
  const sideTable = resolver.resolve(statements);

  if (hadError) return;

  interpreter.interpret(statements, sideTable);
}

function runProgram(program: string) {
  const interpreter = new Interpreter(interpreterErrorCallback);

  run(program, interpreter);

  if (hadError) return 65;
  if (hadRuntimeError) return 70;

  return 0;
}

declare global {
  interface Window {
    lox: any;
  }
}

const lox = {
  runProgram,
};

window.lox = lox;
