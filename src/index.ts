import * as fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Token, TokenName } from "./Scanner/types";
import { Expr } from "./Parser/types";
import evaluateAST, { RuntimeError } from "./Parser/utils/evaluateAST";
import Scanner from "./Scanner";
import Parser from "./Parser";

let hadError = false;
let hadRuntimeError = false;

function main() {
  const args = process.argv.slice(2);
  if (args.length > 1) throw Error("Expected 0 or 1 args!");
  else if (args.length === 1) runFile(args[0]);
  else runPrompt();
}

function runFile(path: string) {
  const source = fs.readFileSync(path).toString();
  run(source);

  if (hadError) process.exit(65);
  if (hadRuntimeError) process.exit(70);
}

async function runPrompt() {
  const rl = readline.createInterface({ input, output });
  rl.on("close", () => process.exit(0));

  while (true) {
    hadError = false;
    // ctrl + C / ctrl + D will trigger close event for rl
    const input = await rl.question("> ");
    run(input);
  }
}

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

function interpret(expression: Expr) {
  try {
    const value = evaluateAST(expression);
    console.log(stringify(value));
  } catch (err) {
    if (err instanceof RuntimeError) {
      reportRuntimeError(err);
      hadRuntimeError = true;
    }
  }
}

function stringify(value: unknown) {
  if (value === null) return "nil";
  if (typeof value === "string") return `"${value}"`;
  return `${value}`;
}

function reportRuntimeError(error: RuntimeError) {
  console.error(error.message + `\n[line ${error.operator.line}]`);
}

function run(source: string) {
  const scanner = new Scanner(source, scannerErrorCallback);
  const tokens = scanner.scanTokens();

  if (hadError) return;

  const parser = new Parser(tokens, parserErrorCallback);
  const AST = parser.parse();

  if (hadError) return;

  interpret(AST!);
}

main();
