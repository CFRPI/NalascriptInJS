import type { Declaration } from "staticAnalysis/ast/declaration";
import type { Scope } from "staticAnalysis/typeChecking/types/scope";
import { compileStatement } from "./statement/compileStatement";

export function compileDeclaration(declaration: Declaration, scopes: Map<string, Scope>, level: number): string {
    switch (declaration.declarationType) {
        case "function":
            // TODO: functions
            break;
        case "statement":
            return compileStatement(declaration.value, scopes, level)
        default:
            break;
    }
    return ""
}