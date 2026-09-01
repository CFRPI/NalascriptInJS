import { VariableClass } from "staticAnalysis/ast/expression.ts";
import type { PrintStatement } from "staticAnalysis/ast/statements.ts";
import { isVoid } from "staticAnalysis/typeChecking/handleExpressionTypes.ts";

export function handlePrint(statement: PrintStatement): string {
    const dataType = statement.value.value.dataType
    if (!dataType || isVoid(dataType))
        return "<Invalid Print Datatype - Datatype undefined or void>"

    if (dataType.varClass != VariableClass.Raw)
        return "<Invalid Print Datatype - Non-Raw datatype>"

    switch (dataType.type) {
        case "i32":
            return "call $nalascript_logi32"
        case "i64":
            return "call $nalascript_logi64"
        case "f32":
            return "call $nalascript_logf32"
        case "f64":
            return "call $nalascript_logf64"
        case "bool":
            return "call $nalascript_logbool"
        default:
            break;
    }

    return "<Invalid Print Datatype - default>"
}