import type { Statement } from "staticAnalysis/ast/statements.ts";
import type { Scope } from "staticAnalysis/typeChecking/types/scope.ts";
import { compileExpression } from "../expression/compileExpression.ts";
import { createIndent } from "../createIndent.ts";
import { handlePrint } from "./handlePrint.ts";

export function compileStatement(statement: Statement, scopes: Map<string, Scope>, level: number): string {
    switch (statement.statementType) {
        case "print":
            return compileExpression(statement.value.value, scopes, level) + "\n" 
            + createIndent(level) + handlePrint(statement)
        case "expression":
            return `${compileExpression(statement.value.value, scopes, level)}\n${createIndent(level)}drop`
        default:
            break;
    }
    return ""
}