import { ExpressionNode, Value, VarType } from "../ast/expression";
import { Statement } from "../ast/statements";
import { validateTypeCast } from "./expressionTypeCasting";
import { handleBinary, handleUnary } from "./expressionTypeHandling";
import { Scope } from "./statementTypeChecking";

export function typeAnnotateAST(ast: Statement[], currentScope?: string | null, scopes?: Map<string, Scope>) {
    let scopeName = currentScope ?? "global"
    for (let lineNum = 0; lineNum < ast.length; lineNum++) {
        const statement = ast[lineNum]
        switch (statement.statementType) {
            case "block":
                let newScope = statement.blockScopeName.blockName.value
                typeAnnotateAST(statement.blockStatements, newScope, scopes)
                break
            case "additionAssignment":
            case "subtractionAssignment":
            case "multiplicationAssignment":
            case "divisionAssignment":
            case "moduloAssignment":
            case "assignment":
                typeCheckExpression(statement.value.value, lineNum, scopeName, scopes)
                break
            case "variableDeclaration":
                typeCheckExpression(statement.value.value, lineNum, scopeName, scopes)
                let scopeDefault = statement.variableScopeDefinition?.scopeDefinitionDefault;
                if (scopeDefault) typeCheckExpression(scopeDefault, lineNum, scopeName, scopes);
                break
            case "expression":
                typeCheckExpression(statement.value.value, lineNum, scopeName, scopes)
            default:
                break
        }
    }
}

export function typeCheckExpression(expr: ExpressionNode, lineNum: number, currentScope: string, scopes?: Map<string, Scope>) {
    switch (expr.type) {
        case "binary":
            typeCheckExpression(expr.left, lineNum, currentScope, scopes);
            typeCheckExpression(expr.right, lineNum, currentScope, scopes);
            let leftType = expr.left.dataType ?? "null";
            let rightType = expr.right.dataType ?? "null";
            let binaryOperator = expr.operator;
            expr.dataType = handleBinary(leftType, rightType, binaryOperator);
            break;
        case "unary":
            typeCheckExpression(expr.value, lineNum, currentScope, scopes);
            let type = expr.value.dataType ?? "null";
            let unaaryOperator = expr.operator;
            expr.dataType = handleUnary(type, unaaryOperator);
            break;
        case "value":
            expr.dataType = getValueDataType(expr as Value, lineNum, currentScope, scopes);
            break;
        case "cast":
            typeCheckExpression(expr.value, lineNum, currentScope, scopes);
            let preCastType = expr.value.dataType ?? "null";
            let postCastType = expr.castType;
            validateTypeCast(preCastType, postCastType);
            expr.dataType = postCastType;

        default:
            break;
    }
}

function getValueDataType(value: Value, lineNum: number, currentScopeName?: string, scopes?: Map<string, Scope>): VarType {
    let scope: Scope | null = null
    if (scopes && currentScopeName)
        scope = scopes.get(currentScopeName) ?? null

    switch (value.valueType) {
        case "boolean":
            return "bool";
        case "string":
            return "str";
        case "float":
            return "f32";
        case "integer":
            return "i32";
        case "literal":
            let name = value.value
            return scope?.lookupDefinition(name, lineNum)?.type ?? "null"
        default:
            break;
    }

    return "null";
}
