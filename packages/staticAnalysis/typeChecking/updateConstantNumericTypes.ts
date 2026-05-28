import { type Declaration, type NSReturnType } from "../ast/declaration";
import { type ExpressionNode, type RawVarType, type Value, VariableClass,type  VarType } from "../ast/expression";
import { type AssignmentStatement, type Statement } from "../ast/statements";
import { VariableDefinition } from "./types/defintion";
import { createRawType, handleBinary, handleUnary, isFloat, isNumeric, isVoid, NSTypeError } from "./handleExpressionTypes";
import { Scope } from "./types/scope";

export function updateConstantNumericTypes(ast: Declaration[], currentScope?: string | null, scopes?: Map<string, Scope>) {
    let scopeName = currentScope ?? "global"
    for (let lineNum = 0; lineNum < ast.length; lineNum++) {
        const declaration = ast[lineNum]
        switch (declaration.declarationType) {
            case "statement":
                updateNumericTypesInStatement(declaration.value, lineNum, scopeName, scopes)
                break;
            case "function":
                updateNumericTypesInStatement(declaration.body, lineNum, scopeName, scopes)
                break
        }
    }
}

function typeAnnotateStatements(statements: Statement[], scope: string, scopes?: Map<string, Scope>) {
    statements.forEach((stmt, index) => updateNumericTypesInStatement(stmt, index, scope, scopes))
}

function updateNumericTypesInStatement(statement: Statement, lineNum: number, scopeName: string, scopes?: Map<string, Scope>) {
    const scope = scopes?.get(scopeName)
    if (!scope) {
        throw new Error("Internal Error: Failed to update numeric types, scope does not exist")
    }

    switch (statement.statementType) {
            case "block":
                let newScope = statement.blockScopeName.blockName.value
                updateConstantNumericTypes(statement.blockDeclarations, newScope, scopes)
                break
            case "additionAssignment":
            case "subtractionAssignment":
            case "multiplicationAssignment":
            case "divisionAssignment":
            case "moduloAssignment":
            case "assignment":
                const variableDefinition = scope.lookupDefinition(statement.variableName.value, lineNum) as VariableDefinition | null

                if (variableDefinition)
                    updateNumericTypesTo(statement.value.value, lineNum, scopeName, variableDefinition.type)
                break
            case "variableDeclaration":
                const varType = statement.variableType
                if (varType)
                    updateNumericTypesTo(statement.value.value, lineNum, scopeName, varType)
                let scopeDefault = statement.variableScopeDefinition?.scopeDefinitionDefault;
                if (scopeDefault && varType) updateNumericTypesTo(scopeDefault, lineNum, scopeName, varType);
                break
            case "for":
                let targetType = createRawType("null")
                if (statement.definition.statementType == "assignment") {
                    const assignmentStatement = statement.definition as AssignmentStatement
                    const name = assignmentStatement.variableName.value

                    const definition = scope?.lookupDefinition(name, lineNum) as VariableDefinition
                    if (definition)
                        targetType = definition.type
                } else {
                    const variableDeclation = statement.definition
                    if (variableDeclation.variableType)
                        targetType = variableDeclation.variableType
                }
                updateNumericTypesTo(statement.definition.value.value, lineNum, scopeName, targetType)
                // easy way to handle whatever kind of statement this is
                typeAnnotateStatements([statement.block], scopeName, scopes)
                break
            case "return":
                const returnType = scope?.blockReturnType
                if (statement.value && returnType && !isVoid(returnType))
                    updateNumericTypesTo(statement.value.value, lineNum, scopeName, returnType as VarType)
                break
            default:
                break
        }
} 

export function updateNumericTypesTo(expr: ExpressionNode, lineNum: number, currentScope: string, targetType: VarType) {
    switch (expr.type) {
        case "binary":
            updateNumericTypesTo(expr.left, lineNum, currentScope, targetType);
            updateNumericTypesTo(expr.right, lineNum, currentScope, targetType);
            let leftType = expr.left.dataType ?? createRawType("null");
            let rightType = expr.right.dataType ?? createRawType("null");
            let binaryOperator = expr.operator;
            expr.dataType = handleBinary(leftType, rightType, binaryOperator);
            break;
        case "unary":
            updateNumericTypesTo(expr.value, lineNum, currentScope, targetType);
            let type = expr.value.dataType ?? createRawType("null");
            let unaaryOperator = expr.operator;
            expr.dataType = handleUnary(type, unaaryOperator);
            break;
        case "value":
            expr.dataType = getValueDataType(expr as Value, lineNum, targetType);
            break;
        default:
            break;
    }
}

function getValueDataType(value: Value, lineNum: number, targetType: VarType): NSReturnType {
    const originalType = value.dataType
    if (!originalType) {
        throw new Error("Internal Error: Attempting to update numeric types without original type")
    }

    if (!isNumeric(originalType))
        return originalType

    switch (value.valueType) {
        case "float":
            if (!isFloat(targetType))
                throw new NSTypeError("Cannot pass float value to non float type")
            return targetType
        case "integer":
            return targetType
        default:
            return originalType;
    }
}