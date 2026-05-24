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
    parent: Scope | null
    lineInParent: number | null

    constructor(block: BlockStatement | null, parent: Scope | null, lineInParent: number | null) {
        this.definitions = []
        this.block = block
        this.parent = parent
        this.lineInParent = lineInParent
    }

    lookupDefinition(name: string, line: number): Definition | null {
        for (let definition of this.definitions)
            if (definition.name == name && line >= definition.line)
                return definition

        let parentLookup = null
        if (this.parent)
            parentLookup = this.parent.lookupDefinition(name, this.lineInParent!)
        return parentLookup;
    }
}

export function generateScopeDefinitions(stmts: Statement[]): Map<string, Scope> {
    let scopes: Map<string, Scope> = new Map();

    const global = new Scope(null, null, null);
    scopes.set("global", global);

    for (let stmtNum = 0; stmtNum < stmts.length; stmtNum++) {
        generateScopeDefinitionsHelper(stmts[stmtNum], global, stmtNum, scopes);
    }

    for (let scopeName of scopes.keys()) {
        const scope = scopes.get(scopeName)

        if (scope?.block)
            scope.block.staticScope = getStaticScope(scope);
    }

    return scopes
}

function getStaticScope(scope: Scope | undefined): StaticScopeTypes {
    if (!scope) return {}

    let res: StaticScopeTypes = {}
    for (let definition of scope.definitions)
        res[definition.name] = {
            varType: definition.type,
            line: definition.line
        }

    return res
}

function generateScopeDefinitionsHelper(stmt: Statement, currentScope: Scope, lineInBlock: number, scopes: Map<string, Scope>) {
    if (stmt.statementType == "variableDeclaration") {
        const name = stmt.variableName.value;
        const type = getVariableType(stmt);
        let scopeDefinition = stmt.variableScopeDefinition?.scopeDefinitionName.value
        let definitionLine = lineInBlock

        let scope: Scope
        if (scopeDefinition) {
            if (!scopes.has(scopeDefinition))
                throw new NSReferenceError(`Attempting to assign variable '${name}' to non existent scope '${scopeDefinition}'`)

            scope = scopes.get(scopeDefinition)!
            lineInBlock = 0 // float to top of block if it is not declared in the default block
        } else {
            scope = currentScope;
        }

        if (scope.lookupDefinition(name, lineInBlock) != null)
            throw new NSReferenceError(`Attempting to re define variable '${name}'`)

        scope.definitions?.push(new Definition(name, type, lineInBlock))
    } else if (stmt.statementType == "for") {
        if (stmt.definition.statementType == "variableDeclaration") {
            generateScopeDefinitionsHelper(stmt.definition, currentScope, lineInBlock, scopes)
        }
        generateScopeDefinitionsHelper(stmt.block, currentScope, lineInBlock, scopes)
    } else if (stmt.statementType == "if") {
        generateScopeDefinitionsHelper(stmt.ifBranch.block, currentScope, lineInBlock, scopes);
        stmt.elseIfBranches.forEach(branch => generateScopeDefinitionsHelper(branch.block, currentScope, lineInBlock, scopes))
        if (stmt.elseBranch?.block)
            generateScopeDefinitionsHelper(stmt.elseBranch.block, currentScope, lineInBlock, scopes);
    } else if (stmt.statementType == "block") {
        let name = stmt.blockScopeName?.blockName.value

        let childScope = scopes.get(name)

        if (!childScope) {
            childScope = new Scope(stmt, currentScope, lineInBlock)
            scopes.set(name, childScope)
        }

        for (let subStmtNum = 0; subStmtNum < stmt.blockStatements.length; subStmtNum++) {
            const subStmt = stmt.blockStatements[subStmtNum]
            generateScopeDefinitionsHelper(subStmt, childScope, subStmtNum, scopes)
        }
    }
}

function getVariableType(stmt: VariableDeclarationStatement): VarType {
    let type = stmt.variableType ?? "null"

    if (!stmt.variableType) {
        type = stmt.value.value.dataType ?? "null"
    }

    return type
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
