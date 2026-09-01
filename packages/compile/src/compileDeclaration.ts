import type { Declaration } from "staticAnalysis/ast/declaration.ts";
import type { Scope } from "staticAnalysis/typeChecking/types/scope.ts";
import { compileStatement } from "./statement/compileStatement.ts";

export function compileDeclaration(declaration: Declaration, scopes: Map<string, Scope>, level: number): string {
    switch (declaration.declarationType) {
        case "function":
            // TODO: functions
            break;
        case "statement":
            return compileStatement(declaration.value, scopes, level) + "\n"
        default:
            break;
    }
    return ""
}