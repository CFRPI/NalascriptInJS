# Nalascript

Nalascript is a toy language I am in progress making. It has syntax inspired by swift and is statically typed. It is parsed with the help of peg.js and is compiled to webassembly.

## Currently Done
- Parsing expressions, statements, control flow, functions and variables
- Compile time type checking
- Simple type inference ie int/float/bool/string
- Compiling expressions and print statements to webasembly (in progress strings do not work, other expressions may be buggy)

## To do
- Finish compiling expressions
- Compile control flow, functions/return, and variables

## Examples
```
print 2 * 4 / 3 + 1

print 2f * 4f / 3f + 1f
```
$ npm run nsc examples/test1.nala output/output.wasm true
$ npm run runNS output/output.wasm
prints
```
3
3.6666667461395264
```

Compute and print 2^5
```
let x = 2
let n = 5

let res = x
for let i = 0; i < n; i += 1 {
    res = res * x
}

print res
```
$ npm run nsc examples/test1.nala output/output.wasm true
Fails to compile since compiler is not done but generates an abstract syntax tree in .nalascript/ast.json
