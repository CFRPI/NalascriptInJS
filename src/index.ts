import { readFileSync, writeFileSync } from "fs"
import peggy from "peggy"
import { NSTypeError } from "./typeChecking/expressionTypeHandling"
import { typeAnnotateAST } from "./typeChecking/expressionTypeChecking"
import { StmtExpr } from "./statement"
import { generateScopeDefinitions, NSReferenceError } from "./typeChecking/statementTypeChecking"
import { assertVariablesExistWhenUsed } from "./typeChecking/assertVariablesExist"


const sourceCode = readFileSync("examples/test1.nala").toString()
const grammar = readFileSync("src/nala.peggy").toString()

try {
    const parser = peggy.generate(grammar);
    let ast = parser.parse(sourceCode) as StmtExpr[];
    typeAnnotateAST(ast);
    const staticScopes = generateScopeDefinitions(ast);
    assertVariablesExistWhenUsed(ast, staticScopes);
    typeAnnotateAST(ast, null, staticScopes)
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