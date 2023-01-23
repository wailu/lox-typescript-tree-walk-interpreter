import * as fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Token, TokenName } from "./Scanner/types";
import Scanner from "./Scanner";
import Parser from "./Parser";
import Interpreter from "./Interpreter";
import Resolver from "./Resolver";

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
  const interpreter = new Interpreter(interpreterErrorCallback);

  run(source, interpreter);

  if (hadError) process.exit(65);
  if (hadRuntimeError) process.exit(70);
}

async function runPrompt() {
  const rl = readline.createInterface({ input, output });
  rl.on("close", () => process.exit(0));

  const interpreter = new Interpreter(interpreterErrorCallback);

  while (true) {
    hadError = false;
    // ctrl + C / ctrl + D will trigger close event for rl
    const input = await rl.question("> ");
    run(input, interpreter);
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

main();
