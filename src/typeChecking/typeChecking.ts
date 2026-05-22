import { Expression, ExpressionNode, Value, VarType } from "../expression";
import { StmtExpr } from "../statement";
import { validateTypeCast } from "./expressionTypeCasting";
import { handleBinary, handleUnary } from "./expressionTypeHandling";

function CheckStmtTypes(stmt: StmtExpr) {
    // deep copy
    let expr = JSON.parse(JSON.stringify(stmt.value))
    typeCheckExpression(expr);
    return expr;
}

export function typeCheckExpression(expr: ExpressionNode) {
    switch (expr.type) {
        case "binary":
            typeCheckExpression(expr.left)
            typeCheckExpression(expr.right)
            let leftType= expr.left.dataType ?? "null"
            let rightType = expr.right.dataType ?? "null"
            let binaryOperator = expr.operator
            expr.dataType = handleBinary(leftType, rightType, binaryOperator)
            break
        case "unary":
            typeCheckExpression(expr.value)
            let type = expr.value.dataType ?? "null"
            let unaaryOperator = expr.operator
            expr.dataType = handleUnary(type, unaaryOperator)
            break
        case "value":
            expr.dataType = getValueDataType(expr as Value)
            break
        case "cast":
            typeCheckExpression(expr.value)
            let preCastType = expr.value.dataType ?? "null"
            let postCastType = expr.castType
            validateTypeCast(preCastType, postCastType)
            expr.dataType = postCastType
        default:
            break
    }
}

function getValueDataType(value: Value): VarType {
    switch (value.valueType) {
        case "boolean":
            return "bool"
        case "string":
            return "str"
        case "float":
            return "f32"
        case "integer":
            return "i32"
        case "literal":
            // to be implemented
            return "null"
        default:
            break;
    }

    return "null"
}