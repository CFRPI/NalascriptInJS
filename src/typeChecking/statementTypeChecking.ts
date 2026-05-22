import { BlockStatement, Statement, StaticScopeTypes, VariableDeclarationStatement } from "../ast/statements";
import { Definition } from "./defintion";
import { VarType } from "../ast/expression";

export class NSReferenceError extends Error {
    constructor(message: string) {
        super(message); // Sets the error message
        this.name = "Nalscript Reference Error"; // Customizes the error name
    }
}

export class Scope {
    definitions: Definition[]
    block: BlockStatement | null

    constructor(block: BlockStatement | null) {
        this.definitions = []
        this.block = block
    }
}

export function generateScopeDefinitions(stmts: Statement[]) {
    let scopes: Map<string, Scope> = new Map();

    const global = new Scope(null);
    scopes.set("global", global);

    for (let stmt of stmts) {
        generateScopeDefinitionsHelper(stmt, global, scopes);
    }

    for (let scopeName of scopes.keys()) {
        const scope = scopes.get(scopeName)

        if (scope?.block)
            scope.block.staticScope = getStaticScope(scope);
    }
}

function getStaticScope(scope: Scope | undefined): StaticScopeTypes {
    if (!scope) return {}

    let res: StaticScopeTypes = {}
    for (let definition of scope.definitions)
        res[definition.name] = definition.type;

    return res
}

function generateScopeDefinitionsHelper(stmt: Statement, currentScope: Scope, scopes: Map<string, Scope>) {
    if (stmt.statementType == "variableDeclaration") {
        const name = stmt.variableName.value;
        const type = getVariableType(stmt);
        let scopeDefinition = stmt.variableScopeDefinition?.scopeDefinitionName.value

        let scope: Scope
        if (scopeDefinition) {
            if (!scopes.has(scopeDefinition))
                throw new NSReferenceError(`Attempting to assign variable '${name}' to non existent scope '${scopeDefinition}'`)

            scope = scopes.get(scopeDefinition)!
        } else {
            scope = currentScope;
        }

        if (scopeHasVariable(scope, name))
            throw new NSReferenceError(`Attempting to re define variable '${name}'`)

        scope.definitions?.push(new Definition(name, type))
    } else if (stmt.statementType == "block") {
        let name = stmt.blockScopeName?.blockName.value

        let selfScope = scopes.get(name)

        if (!selfScope) {
            selfScope = new Scope(stmt)
            scopes.set(name, selfScope)
        }

        for (let subStmt of stmt.blockStatements) {
            generateScopeDefinitionsHelper(subStmt, selfScope, scopes)
        }
    }
    
    console.log("======")
    console.dir(stmt)
    console.log("<>")
    console.dir(scopes)
    console.log("======")
}

function getVariableType(stmt: VariableDeclarationStatement): VarType {
    let type = stmt.variableType ?? "null"

    if (!stmt.variableType) {
        type = stmt.value.value.dataType ?? "null"
    }

    return type
}

function scopeHasVariable(scope: Scope, name: string): boolean {
    for (let definition of scope.definitions ?? []) {
        if (definition.name == name)
            return true
    }
    return false
}



function typeCheckStatement(stmt: Statement) {
    switch (stmt.statementType) {
        case "additionAssignment":
        case "subtractionAssignment":
        case "multiplicationAssignment":
        case "divisionAssignment":
        case "moduloAssignment":
            break;

        default:
            break;
    }
}
