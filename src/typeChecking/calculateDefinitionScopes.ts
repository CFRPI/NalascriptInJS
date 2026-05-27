import { BlockStatement, Statement, StaticScopeTypes, VariableDeclarationStatement } from "../ast/statements";
import { FunctionCallValue, Value, VarType } from "../ast/expression";
import { Declaration, FunctionDeclaration } from "../ast/declaration";
import { createRawType, isNull, isVoid, NSTypeError } from "./handleExpressionTypes";
import { Scope } from "./types/scope";
import { DefinitionType, FunctionDefinition, VariableDefinition } from "./types/defintion";

export class NSReferenceError extends Error {
    constructor(message: string) {
        super(message); // Sets the error message
        this.name = "Nalscript Reference Error"; // Customizes the error name
    }
}

export function calculateScopeDefinitions(decls: Declaration[], scopes?: Map<string, Scope>): Map<string, Scope> {
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
            let childScope = createBlockScope(decl.body, lineInBlock, currentScope, scopes)
            decl.parameters.forEach(parameter => {
                let name = parameter.name.value
                let type = parameter.dataType
                if (childScope.lookupDefinition(name, lineInBlock) != null)
                    throw new NSReferenceError(`Attempting to re define value '${name}'`)

                childScope.definitions.push(new VariableDefinition(name, 0, type, childScope))
            })
            childScope.setReturnType(decl.returnType)
            let childScopeName = decl.body.blockScopeName.blockName.value
            scopes.set(childScopeName, childScope)
            decl.body.blockDeclarations.forEach((blockDecl, line) => {
                generateScopeDefinitionsHelper(blockDecl, childScope, line, scopes)
            })
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

        const definition = new VariableDefinition(name, lineInBlock, type, currentScope)
       
        if (isNull(type)) {
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
        let childScope = createBlockScope(stmt, lineInBlock, currentScope, scopes)
        let childScopeName = stmt.blockScopeName.blockName.value
        scopes.set(childScopeName, childScope)
        stmt.blockDeclarations.forEach((blockDecl, line) => {
            generateScopeDefinitionsHelper(blockDecl, childScope, line, scopes)
        })
    }
}

function createBlockScope(stmt: BlockStatement, lineInBlock: number, currentScope: Scope, scopes: Map<string, Scope>) {
    let name = stmt.blockScopeName?.blockName.value

    let childScope = scopes.get(name)

    if (!childScope) {
        childScope = new Scope(stmt, currentScope, lineInBlock)
        scopes.set(name, childScope)
    }

    calculateScopeDefinitions(stmt.blockDeclarations)

    return childScope
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
    let type = stmt.variableType ?? createRawType("null")

    if (!stmt.variableType) {
        let returnType = stmt.value.value.dataType ?? "null"
        if (returnType == "void")
            throw new NSTypeError("Cannot assign type void to variable");
        type = returnType as VarType
    }

    if (isNull(type)) {
        let valueType = stmt.value.value.type 
        if (valueType == "value") {
            const value = stmt.value.value as Value
            if (value.valueType == "functionCall") {
                const funcCallName = (value as FunctionCallValue).name.value
                const funcCall = scope.lookupDefinition(funcCallName, lineNo)

                if (funcCall && funcCall.definitionType == "function") {
                    let returnType = (funcCall as FunctionDefinition).returnType
                    if (isVoid(returnType)) {
                        throw new NSTypeError("Cannot use type 'void' as a value")
                    }
                    type = returnType as VarType
                }
            }
        }
    }

    return type
}