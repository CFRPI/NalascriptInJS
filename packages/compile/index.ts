import { type Declaration } from "staticAnalysis/ast/declaration"
import { Scope } from "staticAnalysis/typeChecking/types/scope"
import createModule from "./src/createModule";

export default function compile(ast: Declaration[], scopes: Map<string, Scope>): string {
    return createModule(ast, scopes);
}