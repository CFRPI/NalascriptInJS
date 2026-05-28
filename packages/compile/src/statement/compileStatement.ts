import type { Statement } from "staticAnalysis/ast/statements";
import type { Scope } from "staticAnalysis/typeChecking/types/scope";
import { compileExpression } from "../expression/compileExpression";
import { createIndent } from "../createIndent";
import { handlePrint } from "./handlePrint";

export function compileStatement(statement: Statement, scopes: Map<string, Scope>, level: number): string {
    switch (statement.statementType) {
        case "print":
            return compileExpression(statement.value, scopes, level) + "\n" 
            + createIndent(level) + handlePrint(statement)
        case "expression":
            return `${compileExpression(statement.value, scopes, level)}\n${createIndent(level)}drop`
        default:
            break;
    }
    return ""
}