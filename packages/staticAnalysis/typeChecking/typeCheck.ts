import { type Declaration, type NSReturnType } from "../ast/declaration";
import { type Expression, VariableClass, type VarType } from "../ast/expression";
import { type BlockStatement, type BranchWithCondition, type BranchWithoutCondition, type Statement } from "../ast/statements";
import { NSReferenceError } from "./calculateDefinitionScopes";
import { isBoolean, isNumeric, isVoid, NSTypeError } from "./handleExpressionTypes";
import { VariableDefinition } from "./types/defintion";
import { Scope } from "./types/scope";
import { validateTypeCast } from "./validateTypeCasting.ts";

export function typeCheckAST(ast: Declaration[], scopes: Map<string, Scope>) {
    typeCheckASTHelper(ast, "global", scopes);
}

function typeCheckASTHelper(decls: Declaration[], currentScopeName: string, scopes: Map<string, Scope>) {
    decls.forEach((declaration, lineInBlock) => {
        switch (declaration.declarationType) {
            case "function":
                typeCheckStatement(declaration.body, currentScopeName, lineInBlock, scopes)
                break
            case "statement":
                typeCheckStatement(declaration.value, currentScopeName, lineInBlock, scopes);
                break
        }
    })
}

function typeCheckStatement(statement: Statement, currentScopeName: string, lineInBlock: number, scopes: Map<string, Scope>) {
    const scope = scopes.get(currentScopeName);
    if (!scope)
        throw new Error(`Internal error, failed to get scope: ${currentScopeName}`)

    let variableType: VarType
    switch (statement.statementType) {
        case "block":
            handleBlock()
            break;
        case "print":
            // validateExpression(statement.value, scope, lineInBlock)
            break
        case "assignment":
            variableType = getVariableType(statement.variableName.value, scope, lineInBlock);
            validateTypeCast(getExpressionType(statement.value), variableType)
            break
        case "additionAssignment":
        case "subtractionAssignment":
        case "multiplicationAssignment":
        case "divisionAssignment":
        case "moduloAssignment":
            assertExpressionIsNumeric(statement.value, `Cannot use arithmetic assgnment with non numeric argument'`)
            variableType = getVariableType(statement.variableName.value, scope, lineInBlock);
            assertTypeIsNumeric(variableType, "Cannot use arithmetic assignment with non numeric variable")
            validateTypeCast(getExpressionType(statement.value), variableType)
            break
        case "increment":
        case "decrement":
            variableType = getVariableType(statement.variableName.value, scope, lineInBlock);
            assertTypeIsNumeric(variableType, "Cannot use arithmetic assignment with non numeric variable")
            break;
        case "if":
            validateIfBranch(statement.ifBranch, lineInBlock, currentScopeName, scopes)
            statement.elseIfBranches.forEach(branch => validateIfBranch(branch, lineInBlock, currentScopeName, scopes))
            if (statement.elseBranch)
                validateElseBranch(statement.elseBranch, lineInBlock, currentScopeName, scopes)
            break
        case "for":
            assertExpressionIsBoolean(statement.condition, "Expected for loop condition to be boolean")
            break
        case "variableDeclaration":
            let name = statement.variableName.value
            // this is often but inferred by the expression so this check will succeed but it can be explicitly set
            // so we check for that case
            let typeDefinition = getVariableType(name, scope, lineInBlock)
            let expressionType = getExpressionType(statement.value)
            if (typeDefinition)
                validateTypeCast(expressionType, typeDefinition)
        case "expression":
            break
        case "return":
            let returnType: NSReturnType = {
                varClass: VariableClass.Raw,
                type: "void"
            }

            let returnValue = statement.value
            if (returnValue) {
                returnType = getExpressionType(returnValue)
            }

            
            const blockReturnType = scope.blockReturnType

            if (blockReturnType == null) {
                throw new NSTypeError("Cannot return from non function context")
            } else if (isVoid(blockReturnType) && !isVoid(returnType)) {
                throw new NSTypeError("Cannot return value from void function")
            } else {
                validateTypeCast(returnType, blockReturnType)
            }
            break
        default:
            break;
    }

    function handleBlock() {
        const blockStatement = statement as BlockStatement

        const newScope = blockStatement.blockScopeName.blockName.value
        typeCheckASTHelper(blockStatement.blockDeclarations, newScope, scopes)
    }
}

function validateIfBranch(branch: BranchWithCondition, lineInBlock: number, scopeName: string, scopes: Map<string, Scope>) {
    assertExpressionIsBoolean(branch.condition, "Expected if branch condition to be boolean")
    typeCheckStatement(branch.block, scopeName, lineInBlock, scopes)
}

function validateElseBranch(branch: BranchWithoutCondition, lineInBlock: number, scopeName: string, scopes: Map<string, Scope>) {
    typeCheckStatement(branch.block, scopeName, lineInBlock, scopes)
}

function assertTypeIsNumeric(type: NSReturnType, message: string) {
    if (!isNumeric(type))
        throw new NSTypeError(message);
}

function assertExpressionIsNumeric(expression: Expression, message: string) {
    const type = expression.value.dataType
    if (!type || !isNumeric(type))
        throw new NSTypeError(message);
}

function assertExpressionIsBoolean(expression: Expression, message: string) {
    const type = expression.value.dataType
    if (!type || !isBoolean(type))
        throw new NSTypeError(message);
}

function getVariableType(name: string, scope: Scope, lineInBlock: number) {
    let definition = scope.lookupDefinition(name, lineInBlock);
    if (!definition)
        throw new NSReferenceError(`Attempting to access undefined variabel '${name}'`)

    if (definition.definitionType == "function")
        throw new NSTypeError(`Attempting to use function '${name}' as a variable`)

    const variable = definition as VariableDefinition
    return variable.type
}

function getExpressionType(expression: Expression): NSReturnType {
    if (!expression.value.dataType)
        throw new NSTypeError("Could not get type of expression")

    return expression.value.dataType
}