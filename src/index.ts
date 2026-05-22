import { readFileSync, writeFileSync } from "fs"
import peggy from "peggy"
import { handleBinary, NSTypeError } from "./typeChecking/expressionTypeHandling"
import { typeCheckAST } from "./typeChecking/expressionTypeChecking"
import { StmtExpr } from "./statement"
import { generateScopeDefinitions } from "./typeChecking/statementTypeChecking"


const sourceCode = readFileSync("examples/test1.nala").toString()
const grammar = readFileSync("src/nala.peggy").toString()

try {
    const parser = peggy.generate(grammar);
    let ast = parser.parse(sourceCode) as StmtExpr[];
    typeCheckAST(ast);
    generateScopeDefinitions(ast);
    writeFileSync("output/ast.json", JSON.stringify(ast, null, 4));
} catch (e: any) {
    if (e instanceof NSTypeError) {
        let error = {
            "type": "type error",
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

console.log(handleBinary("bool", "bool", "&&"));