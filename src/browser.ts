import { Token, TokenName } from "./Scanner/types";
import Scanner from "./Scanner";
import Parser from "./Parser";
import Interpreter from "./Interpreter";
import Resolver from "./Resolver";

let hadError = false;
let hadRuntimeError = false;
let errors: string[] = [];
let output: string[] = [];

const writeFn = (text: string) => output.push(text);

function scannerErrorCallback(line: number, message: string) {
  const msg = `[line ${line}] Error: ${message}`;
  console.error(msg);
  errors.push(msg);
  hadError = true;
}

function parserErrorCallback(token: Token, message: string) {
  const msg =
    token.tokenName === TokenName.EOF
      ? `[line ${token.line}] Error: ${message}`
      : `[line ${token.line} at '${token.lexeme}'] Error: ${message}`;

  console.error(msg);
  errors.push(msg);
  hadError = true;
}

function resolverErrorCallback(
  token: Exclude<Token, { tokenName: TokenName.EOF }>,
  message: string
) {
  const msg = `[line ${token.line} at '${token.lexeme}'] Error: ${message}`;
  console.error(msg);
  errors.push(msg);
  hadError = true;
}

function interpreterErrorCallback(line: number, message: string) {
  const msg = message + `\n[line ${line}]`;
  console.error(msg);
  errors.push(msg);
  hadRuntimeError = true;
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
  hadError = false;
  hadRuntimeError = false;

  const interpreter = new Interpreter(interpreterErrorCallback, writeFn);

  run(program, interpreter);

  let code = 0;
  if (hadError) code = 65;
  if (hadRuntimeError) code = 70;

  return {
    code,
    errors,
    output,
  };
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
