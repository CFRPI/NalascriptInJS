import type { Declaration } from "staticAnalysis/ast/declaration.ts";
import type { Scope } from "staticAnalysis/typeChecking/types/scope.ts";
import { compileDeclaration } from "./compileDeclaration.ts";

export default function(decls: Declaration[], scopes: Map<string, Scope>): string {
    return `(module
\t(import "console" "log" (func $nalascript_logi32 (param i32)))
\t(import "console" "log" (func $nalascript_logi64 (param i64)))
\t(import "console" "log" (func $nalascript_logf32 (param f32)))
\t(import "console" "log" (func $nalascript_logf64 (param f64)))
\t(import "console" "logBool" (func $nalascript_logbool (param i32)))
\t(func $nalascript_main
${decls.map(decl => compileDeclaration(decl, scopes, 2)).join("\n")}
\t)
\t(start $nalascript_main)
)`
}