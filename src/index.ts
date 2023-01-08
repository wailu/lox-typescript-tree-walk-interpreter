import * as fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Token, TokenName } from "./Scanner/types";
import printAST from "./Parser/utils/printAST";
import evaluateAST from "./Parser/utils/evaluateAST";
import Scanner from "./Scanner";
import Parser from "./Parser";

let hadError = false;

function main() {
  const args = process.argv.slice(2);
  if (args.length > 1) throw Error("Expected 0 or 1 args!");
  else if (args.length === 1) runFile(args[0]);
  else runPrompt();
}

function runFile(path: string) {
  const source = fs.readFileSync(path).toString();
  run(source);
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
  if (token.tokenName === TokenName.EOF) {
    console.error(`[line ${token.line}] Error: ${message}`);
  } else {
    console.error(`[line ${token.line} at '${token.lexeme}'] Eror: ${message}`);
  }
  hadError = true;
}

function run(source: string) {
  const scanner = new Scanner(source, scannerErrorCallback);
  const tokens = scanner.scanTokens();

  if (hadError) return;

  const parser = new Parser(tokens, parserErrorCallback);
  const AST = parser.parse();

  if (hadError) return;

  console.log(printAST(AST!));
  console.log(evaluateAST(AST!));
}

main();
