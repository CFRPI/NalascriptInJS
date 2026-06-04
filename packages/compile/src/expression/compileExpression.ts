import type { BinaryExpression, Expression, ExpressionNode } from "staticAnalysis/ast/expression";
import type { Scope } from "staticAnalysis/typeChecking/types/scope";
import { handleValue } from "./handleValue";
import { createIndent } from "../createIndent";
import { handleBinary } from "./handleBinary";

export function compileExpression(expression: ExpressionNode, scopes: Map<string, Scope>, level: number): string {
    let value = expression
    switch (value.type) {
        case "binary":
            return handleBinary(expression as BinaryExpression, scopes, level)
        case "unary":
            break
        case "value":
            return createIndent(level) + handleValue(value)
        case "cast":
            break
    }
    return ""
}