import { Expression, ExpressionNode } from "../ast/expression";
import { Statement } from "../ast/statements";
import { NSReferenceError, Scope } from "./statementTypeChecking";

export function assertVariablesExistWhenUsed(ast: Statement[], scopes: Map<string, Scope>) {
    const scopeName = "global"
    ast.forEach((stmt, index)  => {
        assertVariableExistWhenUsedHelper(stmt, index, scopeName, scopes)
    })
}

function assertVariableExistWhenUsedHelper(stmt: Statement, lineInBlock: number, scopeName: string, scopes: Map<string, Scope>) {
    const scope = scopes.get(scopeName)
    if (!scope) {
        throw new Error("Internal Error asseertVariableExistWhenUsedHelper accessed nonexistent scope")
    }

    switch (stmt.statementType) {
        case "additionAssignment":
        case "subtractionAssignment":
        case "multiplicationAssignment":
        case "divisionAssignment":
        case "moduloAssignment":
        case "assignment":
        case "increment":
        case "decrement":
            const name = stmt.variableName.value
            if (!scope.lookupDefinition(name, lineInBlock))
                referenceError(name);
            break;
        case "expression":
            const literalsAccessed = getAllLiteralsInExpression(stmt.value)
            for (let literal of literalsAccessed) {
                if (!scope.lookupDefinition(literal, lineInBlock))
                    referenceError(literal)
            }
            break
        case "block":
            let scopeName = stmt.blockScopeName.blockName.value;
            stmt.blockStatements.forEach((subStmt, index) => {
                assertVariableExistWhenUsedHelper(subStmt, index, scopeName, scopes)
            })
            break
        default:
            break;
    }
}

function getAllLiteralsInExpression(expr: Expression): string[] {
    let literals: Set<string> = new Set()
    getAllLiteralsInExpressionHelper(expr.value, literals)
    return [...literals]
}

function getAllLiteralsInExpressionHelper(node: ExpressionNode, literals: Set<string>) {
    switch (node.type) {
        case "binary":
            getAllLiteralsInExpressionHelper(node.left, literals)
            getAllLiteralsInExpressionHelper(node.right, literals)
            break
        case "unary":
            getAllLiteralsInExpressionHelper(node.value, literals)
            break
        case "cast":
            getAllLiteralsInExpressionHelper(node.value, literals)
            break
        case "value":
            if (node.valueType == "literal")
                literals.add(node.value)
        default:
            break
    }
}

function referenceError(name: string) {
    throw new NSReferenceError(`Accessed undefined variable ${name}`)
}