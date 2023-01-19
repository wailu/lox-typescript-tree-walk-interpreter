import * as fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Token, TokenName } from "./Scanner/types";
import { Stmt } from "./Parser/types";
import { RuntimeError } from "./Parser/utils/evaluateAST";
import executeStmt from "./Parser/utils/executeStmt";
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

function interpret(statements: Stmt[]) {
  try {
    for (let i = 0; i < statements.length; i++) {
      executeStmt(statements[i]);
    }
  } catch (err) {
    if (err instanceof RuntimeError) {
      reportRuntimeError(err);
      hadRuntimeError = true;
    }
  }
}

function reportRuntimeError(error: RuntimeError) {
  console.error(error.message + `\n[line ${error.operator.line}]`);
}

function run(source: string) {
  const scanner = new Scanner(source, scannerErrorCallback);
  const tokens = scanner.scanTokens();

  if (hadError) return;

  const parser = new Parser(tokens, parserErrorCallback);
  const statements = parser.parse();

  if (hadError) return;

  interpret(statements!);
}

main();
