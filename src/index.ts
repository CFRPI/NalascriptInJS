import { readFileSync, writeFileSync } from "fs"
import peggy from "peggy"
import { Expression } from "./expression"
import { handleBinary, NSTypeError } from "./typeChecking/expressionTypeHandling"
import { typeCheckExpression } from "./typeChecking/typeChecking"
import { StmtExpr } from "./statement"


const sourceCode = readFileSync("src/examples/test1.nala").toString()
const grammar = readFileSync("src/nala.peggy").toString()

try {
    const parser = peggy.generate(grammar);
    let ast = parser.parse(sourceCode) as StmtExpr[];
    typeCheckExpression(ast[0].value.value);
    writeFileSync("src/output/ast.json", JSON.stringify(ast, null, 4));
} catch (e: any) {
    if (e instanceof NSTypeError) {
        let error = {
            "type": "type error",
            "message": e.message
        }
        writeFileSync("src/output/ast.json", JSON.stringify(error, null, 4));
    } else {
        let error = {
            "type": "syntax error",
            "message": `Failed to parse: \n${e.message}`
        }
        writeFileSync("src/output/ast.json", JSON.stringify(error, null, 4));
    }
    
}

console.log(handleBinary("bool", "bool", "&&"));