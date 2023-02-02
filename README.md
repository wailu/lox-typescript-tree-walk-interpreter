#Lox Typescript Treewalk interpreter

##About
The Lox language is the language from the great book https://craftinginterpreters.com/. In the book, the treewalk interpreter, `jlox`, is written in Java. I chose to write the interpreter instead using TypeScript as:
1. It is a language I'm comfortable with
2. I wanted to have a Lox interpreter in the browser as I did not immediately find any Lox intepreters online.
3. I wanted to try to implement Lox with a more functional approach instead of an object-oriented approach like in the book.
	- Used [`ts-pattern`](https://github.com/gvergnaud/ts-pattern) to have more powerful pattern matching like in functional languages

##Usage
Start by installing the dependencies via `npm install`. To start a Lox REPL, do:

```
npm run start
```

You can also pass the path of a source file as an argument to run a Lox program:

```
npm run start program.txt
```

Since the interpreter is written in TypeScript, it is able to run in the browser too. There is a simple webpage included where you can try out your Lox programs in. To do so,

1. Build the bundle.js:
```
npm run build
```
2. Open the index.html file included.

The interpreter is accessible via `window.lox.runProgram` in the console too.

##Details
As per the book, there are 4 main components that make up the whole program. They each represent a different phase of the interpreting process.
1. Scanner (`src/Scanner/index.ts`)
	- takes in a source program and returns a list of tokens
2. Parser (`src/Parser/index.ts`)
	- transforms the list of tokens into an abstract syntax tree representing the program
3. Resolver (`src/Resolver/index.ts`)
	- Produces a side table of resolved variables (where in the environment chain to find them)
	- Also performs semantic checks on the program before interpretation
4. Interpreter (`src/Interpreter/index.ts`)
	- Walk the branches of the tree and interprets the program

In the runtime environment, there are also runtime objects in in the interpreter, namely:
2. LoxMethod
	- represents a method of a class; this is a intermediate form of a lox function just before it is bound to an instance
3. LoxCallable
	- Represents a callable (able to be called like a function)
4. LoxInstance
	- Represents an object instantiation from a class

The Environment and these runtime objects can be found in `src/Interpreter/Environment/index.ts`.
