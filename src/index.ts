import { readFileSync, writeFileSync } from "fs"
import peggy from "peggy"
import { NSTypeError } from "./typeChecking/handleExpressionTypes"
import { typeAnnotateAST } from "./typeChecking/annotateExpressionTypes"
import { calculateScopeDefinitions, NSReferenceError } from "./typeChecking/calculateDefinitionScopes"
import { assertVariablesExistWhenUsed } from "./typeChecking/assertVariablesExist"
import { Declaration } from "./ast/declaration"


const sourceCode = readFileSync("examples/test1.nala").toString()
const grammar = readFileSync("src/nala.peggy").toString()

try {
    const parser = peggy.generate(grammar);
    let ast = parser.parse(sourceCode) as Declaration[];
    typeAnnotateAST(ast);
    let staticScopes = calculateScopeDefinitions(ast);
    assertVariablesExistWhenUsed(ast, staticScopes);
    // fills in variable & function call types
    writeFileSync("output/ast.json", JSON.stringify(ast, null, 4));
} catch (e: any) {
    if (e instanceof NSTypeError) {
        let error = {
            "type": "Type error",
            "message": e.message
        }
        writeFileSync("output/ast.json", JSON.stringify(error, null, 4));
    } else if (e instanceof NSReferenceError) {
        let error = {
            "type": "Reference error",
            "message": e.message
        }
        writeFileSync("output/ast.json", JSON.stringify(error, null, 4));
    } else {
        let error = {
            "type": "syntax error",
            "message": `Failed to parse: \n${e.message}`
        }
        writeFileSync("output/ast.json", JSON.stringify(error, null, 4));
    }
    
}