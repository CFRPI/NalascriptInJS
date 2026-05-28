import { type Declaration } from "../ast/declaration.ts";
import { type Expression, type ExpressionNode } from "../ast/expression.ts";
import { type AssignmentWithValueStatements, type Statement } from "../ast/statements.ts";
import { NSReferenceError } from "./calculateDefinitionScopes.ts";
import { Scope } from "./types/scope.ts";

export function assertVariablesExistWhenUsed(ast: Declaration[], scopes: Map<string, Scope>) {
    const scopeName = "global"
    ast.forEach((decl, index)  => {
        assertVariableExistWhenUsedHelper(decl, index, scopeName, scopes)
    })
}

function assertVariableExistWhenUsedHelper(declaration: Declaration, lineInBlock: number, scopeName: string, scopes: Map<string, Scope>) {
    switch (declaration.declarationType) {
        case "statement":
            assertVariableExistWhenUsedStmt(declaration.value, lineInBlock, scopeName, scopes)
            break
        case "function":
            assertVariableExistWhenUsedStmt(declaration.body, lineInBlock, scopeName, scopes)
            break
    }
}

function assertVariableExistWhenUsedStmt(stmt: Statement, lineInBlock: number, scopeName: string, scopes: Map<string, Scope>) {
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
            validateExpression(stmt.value, scope, lineInBlock);
            break
        case "for":
            validateExpression(stmt.condition, scope, lineInBlock);
            
            // if we are assigning a variable, chck it exists
            if (stmt.definition.statementType == "assignment") 
                validateExpression(stmt.definition.value, scope, lineInBlock)
            if (stmt.assignment.statementType != "increment" && stmt.assignment.statementType != "decrement") {
                let assignment = stmt.assignment as AssignmentWithValueStatements
                validateExpression(assignment.value, scope, lineInBlock)
            }
            assertVariableExistWhenUsedStmt(stmt.block, lineInBlock, scopeName, scopes)
            break
        case "if":
            assertVariableExistWhenUsedStmt(stmt.ifBranch.block, lineInBlock, scopeName, scopes)
            validateExpression(stmt.ifBranch.condition, scope, lineInBlock)
            stmt.elseIfBranches.forEach(branch => {
                assertVariableExistWhenUsedStmt(branch.block, lineInBlock, scopeName, scopes)
                validateExpression(branch.condition, scope, lineInBlock)
            })

            if (stmt.elseBranch) {
                assertVariableExistWhenUsedStmt(stmt.elseBranch.block, lineInBlock, scopeName, scopes)
            }
            break
        case "return":
            if (stmt.value)
                validateExpression(stmt.value, scope, lineInBlock)
            break
        case "print":
            validateExpression(stmt.value, scope, lineInBlock)
            break
        case "block":
            let newScopeName = stmt.blockScopeName.blockName.value;
            stmt.blockDeclarations.forEach((subDecl, index) => {
                assertVariableExistWhenUsedHelper(subDecl, index, newScopeName, scopes)
            })
            break
        
        default:
            break;
    }
}

function validateExpression(expr: Expression, scope: Scope, lineInBlock: number) {
    const literalsAccessed = getAllLiteralsInExpression(expr)
    for (let literal of literalsAccessed) {
        if (!scope.lookupDefinition(literal, lineInBlock))
            referenceError(literal)
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
            else if (node.valueType == "functionCall")
                literals.add(node.name.value)
        default:
            break
    }
}

function referenceError(name: string) {
    throw new NSReferenceError(`Accessed undefined variable ${name}`)
}