import type { Expression, Value } from "staticAnalysis/ast/expression";
import { isNumeric } from "staticAnalysis/typeChecking/handleExpressionTypes";
import type { Scope } from "staticAnalysis/typeChecking/types/scope";
import { handleValue } from "./handleValue";
import { createIndent } from "../createIndent";

export function compileExpression(expression: Expression, scopes: Map<string, Scope>, level: number): string {
    let value = expression.value
    switch (value.type) {
        case "binary":
            break
        case "unary":
            break
        case "value":
            return createIndent(level) + handleValue(value)
        case "cast":
            break
    }
    return ""
}