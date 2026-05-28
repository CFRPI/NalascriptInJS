import parser from "./packages/parse/src/index"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import type { Declaration } from "staticAnalysis/ast/declaration"
import { typeAnnotateAST } from "staticAnalysis/typeChecking/annotateExpressionTypes"
import { calculateScopeDefinitions } from "staticAnalysis/typeChecking/calculateDefinitionScopes"
import { assertVariablesExistWhenUsed } from "staticAnalysis/typeChecking/assertVariablesExist"
import { typeCheckAST } from "staticAnalysis/typeChecking/typeCheck"
import compile from "compile"
import { exit } from "process"
import { resolve, basename } from "path"
import { execSync } from "child_process"


if (process.argv.length < 4) {
    console.error("Usage: bun nsc <input.nala> <output.wasm> <writeAST: true/false>")
    exit(1)
}

const inputFileName = process.argv[2]
let programName = basename(inputFileName).split(".")[0]

const outputFileName = process.argv[3]
const writeAST = process.argv[4] == "true" || process.argv[4] == "t"

const sourceCode = readFileSync(resolve(inputFileName)).toString()
let ast = parser.parse(sourceCode) as Declaration[];
typeAnnotateAST(ast);
let staticScopes = calculateScopeDefinitions(ast);
assertVariablesExistWhenUsed(ast, staticScopes);
typeAnnotateAST(ast, null, staticScopes)
typeCheckAST(ast, staticScopes)

if (!existsSync(".nalascript"))
    mkdirSync(resolve("./.nalascript"))

if (writeAST)
    writeFileSync(resolve(".nalascript/ast.json"), JSON.stringify(ast, null, 4))

const compiledWAT = compile(ast, staticScopes);
writeFileSync(resolve(`.nalascript/${programName}.wat`), compiledWAT)

execSync(`wat2wasm .nalascript/${programName}.wat -o ${outputFileName}`)