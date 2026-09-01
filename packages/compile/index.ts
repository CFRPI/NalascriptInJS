import { type Declaration } from "staticAnalysis/ast/declaration.ts"
import { Scope } from "staticAnalysis/typeChecking/types/scope.ts"
import createModule from "./src/createModule.ts";

export default function compile(ast: Declaration[], scopes: Map<string, Scope>): string {
    return createModule(ast, scopes);
}