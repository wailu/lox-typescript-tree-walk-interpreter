import * as fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import Scanner from "./Scanner";

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
    // ctrl + C / ctrl + D will trigger close event for rl
    const input = await rl.question("> ");
    run(input);
  }
}

function errorCallback(line: number, message: string) {
  console.error(`[line ${line}] Error: ${message}`);
  hadError = true;
}

function run(source: string) {
  const scanner = new Scanner(source, errorCallback);
  const tokens = scanner.scanTokens();

  for (const token of tokens) {
    console.log(token);
  }
}

main();
