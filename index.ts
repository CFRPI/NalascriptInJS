import { parser } from "./packages/parse/src/index.ts"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import type { Declaration } from "staticAnalysis/ast/declaration.ts"
import { typeAnnotateAST } from "staticAnalysis/typeChecking/annotateExpressionTypes.ts"
import { calculateScopeDefinitions, NSReferenceError } from "staticAnalysis/typeChecking/calculateDefinitionScopes.ts"
import { assertVariablesExistWhenUsed } from "staticAnalysis/typeChecking/assertVariablesExist.ts"
import { typeCheckAST } from "staticAnalysis/typeChecking/typeCheck.ts"
import compile from "compile"
import { exit } from "process"
import { resolve, basename } from "path"
import { execSync } from "child_process"
import { updateConstantNumericTypes } from "staticAnalysis/typeChecking/updateConstantNumericTypes.ts"
import { NSTypeError } from "staticAnalysis/typeChecking/handleExpressionTypes.ts"
import type { Scope } from "staticAnalysis/typeChecking/types/scope.ts"


if (process.argv.length < 4) {
    console.error("Usage: bun nsc <input.nala> <output.wasm> <writeAST: true/false>")
    exit(1)
}

const inputFileName = process.argv[2]
let programName = basename(inputFileName).split(".")[0]

const outputFileName = process.argv[3]
const writeAST = process.argv[4] == "true" || process.argv[4] == "t"

let ast: Declaration[]
let staticScopes: Map<string, Scope>

if (!existsSync(".nalascript"))
    mkdirSync(resolve("./.nalascript"))

try {
    const sourceCode = readFileSync(resolve(inputFileName)).toString()
    ast = parser.parse(sourceCode) as Declaration[];

    // initial write for debug if compile fails
    if (writeAST)
        writeFileSync(resolve(".nalascript/ast.json"), JSON.stringify(ast, null, 4))

    typeAnnotateAST(ast);
    staticScopes = calculateScopeDefinitions(ast);
    assertVariablesExistWhenUsed(ast, staticScopes);
    typeAnnotateAST(ast, null, staticScopes)
    updateConstantNumericTypes(ast, null, staticScopes)
    typeCheckAST(ast, staticScopes)
} catch (error: any) {
    if (error instanceof NSTypeError) {
        console.error(`Nalascript Type Error:\n${error.message}`)
    } else if (error instanceof NSReferenceError) {
        console.error(`Nalascript Reference Error:\n${error.message}`)
    } else {
        console.error(`Nalascript Internal Error:\n${error.message}`)
    }
    exit(1)
}

if (writeAST)
    writeFileSync(resolve(".nalascript/ast.json"), JSON.stringify(ast, null, 4))

const compiledWAT = compile(ast, staticScopes);
writeFileSync(resolve(`.nalascript/${programName}.wat`), compiledWAT)

execSync(`wat2wasm .nalascript/${programName}.wat -o ${outputFileName}`)