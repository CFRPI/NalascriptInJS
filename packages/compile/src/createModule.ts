import type { Declaration } from "staticAnalysis/ast/declaration";
import type { Scope } from "staticAnalysis/typeChecking/types/scope";
import { compileDeclaration } from "./compileDeclaration";

export default function(decls: Declaration[], scopes: Map<string, Scope>): string {
    return `(module
\t(import "console" "log" (func $log (param i32)))
\t(func $nalascript_main
${decls.map(decl => compileDeclaration(decl, scopes, 2)).join("\n")}
\t)
\t(start $nalascript_main)
)`
}