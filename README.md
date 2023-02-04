
# Lox TypeScript Tree-walk interpreter

## About
The lox language is a toy language from [this](https://craftinginterpreters.com/) great book to demonstrate how to implementing a scripting language. In the book, its tree-walk interpreter, `jlox`, is written in Java. While following along, I chose to write the interpreter instead using TypeScript as:
1. It is a language I'm comfortable with
2. I wanted to have a lox interpreter in the browser
3. I wanted to try to implement lox with a more functional approach instead of an object-oriented approach like in the book
	- Here I used [`ts-pattern`](https://github.com/gvergnaud/ts-pattern) to have a more sophisticated pattern matching feature like in functional languages

## Usage
Start by install the dependencies via `npm install`. This should also run the build step (`npm run build`) to compile the TS files into JS under the `lib` directory and produce `bundle.js` for the browser.

Additionally, if you'd like to add the lox interpreter to your path:
```
# install package globally
npm i -g .

# start lox
lox

# if you'd like to uninstall
npm uninstall -g lox-typescript-tree-walk-interpreter
```

To start a lox REPL:
```
# this uses ts-node to JIT transform TS -> JS and run
# also very useful during development
npm run start

# alternatively:
# this uses node and the pre-built js files in lib
./bin/jslox

# or (if you have lox in your path)
# this is the practically the same as ./bin/jslox
lox
```

To run a lox program from source, pass the path of a source file as an argument:

```
npm run start program.txt
# or
./bin/jslox program.txt
# or (if you have lox in your path)
lox program.txt
```

The project comes with an example of how to add lox to your webpage. To see lox in action in the browser, open `lox_in_browser_example/index.html` using your web browser. 

You will need an internet connection as the example requires React and ReactDOM using its CDN links. The `bundle.js` file should also be available (if not, run `npm run build`).

If everything works correctly, you should see something like below:

![Lox in browser](./lox_in_browser_example/lox-in-browser.gif)

`bundle.js` adds a function at `window.lox.runProgram`. Try in your browser console:

```
window.lox.runProgram('print "Hello world!";');
```
It should return:
```
{
	// code 0 -> all's good
	// code 65 -> error
	// code 70 -> runtime error
    "code": 0,
    "errors": [],
    "output": [
        "Hello world!"
    ]
}
```

## Brief details
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

At runtime, there are also objects created and used by the program, namely:
1. Environment
	- Data structure that associates variables to values
2. LoxMethod
	- represents a method of a class; this is an intermediate form of a lox function just before it is bound to an instance
3. LoxCallable
	- Represents a callable (able to be called like a function)
4. LoxInstance
	- Represents an object instantiation from a class

The Environment and these runtime objects can be found in `src/Interpreter/Environment/index.ts`.

The features of lox implemented are as in the book, including classes and inheritance. There are no additional features included in this implementation of lox yet (to be added in the future).

## Roadmap

There are still quite a lot of things that could be improved.

As my implementation was rather hasty the code is not as clean as I'd hope it to be. Also I'd like to test it more thoroughly, but this has also not been done.

- [x] Add lox in browser example
- [ ] Improve code quality
- [ ] Add test cases
- [ ] Implement new features (features to be decided)

There is likely to be a delay as I would like to proceed with the next part of the book which is to implement a virtual machine for lox first. After that, my plan is to try to implement new features in this tree-walk interpreter first before porting it to the VM implementation.

## Contributing

If you have a suggestion to improve this project or found a bug in my implementation, please feel free to open an issue or create a pull request. Any contributions you make will be greatly appreciated :innocent:.
