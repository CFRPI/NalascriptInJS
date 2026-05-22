import { ExpressionNode, Value, VarType } from "../ast/expression";
import { Statement } from "../ast/statements";
import { validateTypeCast } from "./expressionTypeCasting";
import { handleBinary, handleUnary } from "./expressionTypeHandling";

export function typeCheckAST(ast: Statement[]) {
    for (let statement of ast) {
        switch (statement.statementType) {
            case "block":
                typeCheckAST(statement.blockStatements)
                break
            case "additionAssignment":
            case "subtractionAssignment":
            case "multiplicationAssignment":
            case "divisionAssignment":
            case "moduloAssignment":
            case "assignment":
                typeCheckExpression(statement.value.value)
                break
            case "variableDeclaration":
                typeCheckExpression(statement.value.value)
                let scopeDefault = statement.variableScopeDefinition?.scopeDefinitionDefault;
                if (scopeDefault) typeCheckExpression(scopeDefault);
                break
            case "expression":
                typeCheckExpression(statement.value.value)
            default:
                break
        }
    }
}

export function typeCheckExpression(expr: ExpressionNode) {
    switch (expr.type) {
        case "binary":
            typeCheckExpression(expr.left);
            typeCheckExpression(expr.right);
            let leftType = expr.left.dataType ?? "null";
            let rightType = expr.right.dataType ?? "null";
            let binaryOperator = expr.operator;
            expr.dataType = handleBinary(leftType, rightType, binaryOperator);
            break;
        case "unary":
            typeCheckExpression(expr.value);
            let type = expr.value.dataType ?? "null";
            let unaaryOperator = expr.operator;
            expr.dataType = handleUnary(type, unaaryOperator);
            break;
        case "value":
            expr.dataType = getValueDataType(expr as Value);
            break;
        case "cast":
            typeCheckExpression(expr.value);
            let preCastType = expr.value.dataType ?? "null";
            let postCastType = expr.castType;
            validateTypeCast(preCastType, postCastType);
            expr.dataType = postCastType;
        default:
            break;
    }
}

function getValueDataType(value: Value): VarType {
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
            // to be implemented
            return "null";
        default:
            break;
    }

    return "null";
}
