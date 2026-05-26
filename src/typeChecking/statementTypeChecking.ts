import { BlockStatement, Statement, StaticScopeTypes, VariableDeclarationStatement } from "../ast/statements";
import { Definition, DefinitionType, FunctionDefinition, VariableDefinition } from "./defintion";
import { FunctionCallValue, Value, VarType } from "../ast/expression";
import { Declaration, FunctionDeclaration } from "../ast/declaration";
import { NSTypeError } from "./expressionTypeHandling";

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

    applyReferences() {
        this.definitions.forEach(definition => definition.applyReference())
    }
}

export function generateScopeDefinitions(decls: Declaration[], scopes?: Map<string, Scope>): Map<string, Scope> {
    scopes = scopes ?? new Map();

    const global = new Scope(null, null, null);
    scopes.set("global", global);

    for (let declNum = 0; declNum < decls.length; declNum++) {
        generateScopeDefinitionsHelper(decls[declNum], global, declNum, scopes);
    }

    scopes.forEach(scope => scope.applyReferences())

    for (let scopeName of scopes.keys()) {
        const scope = scopes.get(scopeName)

        if (scope?.block)
            scope.block.staticScope = getStaticScope(scope);
    }

    return scopes
}

function generateScopeDefinitionsHelper(decl: Declaration, currentScope: Scope, lineInBlock: number, scopes: Map<string, Scope>) {
    switch (decl.declarationType) {
        case "function":
            addFunctionDefinition(decl, currentScope, lineInBlock)
            break
        case "statement":
            generateScopeDefinitionsForStatement(decl.value, currentScope, lineInBlock, scopes)
            break
    }
}

function addFunctionDefinition(decl: FunctionDeclaration, currentScope: Scope, lineInBlock: number) {
    const name = decl.name.value;

    if (currentScope.lookupDefinition(name, lineInBlock)) {
        throw new NSReferenceError(`Attempting to re define value '${name}'`)
    }

    currentScope.definitions.push(new FunctionDefinition(name, lineInBlock, decl.parameters, decl.returnType))
}

function generateScopeDefinitionsForStatement(stmt: Statement, currentScope: Scope, lineInBlock: number, scopes: Map<string, Scope>) {
    if (stmt.statementType == "variableDeclaration") {
        const name = stmt.variableName.value;
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
            throw new NSReferenceError(`Attempting to re define value '${name}'`)

        const type = getVariableType(stmt, scope, lineInBlock);

        const definition = new VariableDefinition(name, lineInBlock, type, currentScope, lineInBlock)
       
        if (type == "null") {
            let valueType = stmt.value.value.type 
            if (valueType == "value") {
                const value = stmt.value.value as Value
                if (value.valueType == "literal"){
                    // if we don't know the type yet, check for references to other variables
                    const name = stmt.variableName.value
                    const referenceName = value.value
                    const variable = scope.lookupDefinition(name, lineInBlock)
                    definition?.addReference(referenceName)
                }
            }
        }

        scope.definitions?.push(definition)
    } else if (stmt.statementType == "for") {
        if (stmt.definition.statementType == "variableDeclaration") {
            generateScopeDefinitionsForStatement(stmt.definition, currentScope, lineInBlock, scopes)
        }
        generateScopeDefinitionsForStatement(stmt.block, currentScope, lineInBlock, scopes)
    } else if (stmt.statementType == "if") {
        generateScopeDefinitionsForStatement(stmt.ifBranch.block, currentScope, lineInBlock, scopes);
        stmt.elseIfBranches.forEach(branch => generateScopeDefinitionsForStatement(branch.block, currentScope, lineInBlock, scopes))
        if (stmt.elseBranch?.block)
            generateScopeDefinitionsForStatement(stmt.elseBranch.block, currentScope, lineInBlock, scopes);
    } else if (stmt.statementType == "block") {
        let name = stmt.blockScopeName?.blockName.value

        let childScope = scopes.get(name)

        if (!childScope) {
            childScope = new Scope(stmt, currentScope, lineInBlock)
            scopes.set(name, childScope)
        }

        generateScopeDefinitions(stmt.blockDeclarations)

        for (let subStmtNum = 0; subStmtNum < stmt.blockDeclarations.length; subStmtNum++) {
            const subStmt = stmt.blockDeclarations[subStmtNum]
            generateScopeDefinitionsHelper(subStmt, childScope, subStmtNum, scopes)
        }
    }
}


function getStaticScope(scope: Scope | undefined): StaticScopeTypes {
    if (!scope) return {}

    let res: StaticScopeTypes = {}
    for (let definition of scope.definitions) {
        if (definition.definitionType == DefinitionType.variable) {
            const variableDefinition = definition as VariableDefinition
            res[definition.name] = {
                definitionType: "Variable",
                varType: variableDefinition.type,
                line: definition.line
            }
        } else { // function
            const functionDeclaration = definition as FunctionDefinition
            res[definition.name] = {
                definitionType: "Function",
                parameters: functionDeclaration.parameters,
                returnType: functionDeclaration.returnType,
                line: definition.line
            }
        }
    }

    return res
}

function getVariableType(stmt: VariableDeclarationStatement, scope: Scope, lineNo: number): VarType {
    let type = stmt.variableType ?? "null"

    if (!stmt.variableType) {
        let returnType = stmt.value.value.dataType ?? "null"
        if (returnType == "void")
            throw new NSTypeError("Cannot assign type void to variable");
        type = returnType as VarType
    }

    if (type == "null") {
        let valueType = stmt.value.value.type 
        if (valueType == "value") {
            const value = stmt.value.value as Value
            if (value.valueType == "functionCall") {
                const funcCallName = (value as FunctionCallValue).name.value
                const funcCall = scope.lookupDefinition(funcCallName, lineNo)

                if (funcCall && funcCall.definitionType == "function") {
                    let returnType = (funcCall as FunctionDefinition).returnType
                    if (returnType == "void") {
                        throw new NSTypeError("Cannot use type 'void' as a value")
                    }
                    type = returnType as VarType
                }
            }
        }
    }

    return type
}