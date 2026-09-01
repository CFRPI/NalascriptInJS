import type { BinaryExpression, Expression, ExpressionNode } from "staticAnalysis/ast/expression.ts";
import type { Scope } from "staticAnalysis/typeChecking/types/scope.ts";
import { handleValue } from "./handleValue.ts";
import { createIndent } from "../createIndent.ts";
import { handleBinary } from "./handleBinary.ts";

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