import { Declaration, NSReturnType } from "../ast/declaration";
import { ExpressionNode, RawVarType, Value, VariableClass, VarType } from "../ast/expression";
import { Statement } from "../ast/statements";
import { DefinitionType, FunctionDefinition, VariableDefinition } from "./types/defintion";
import { validateTypeCast } from "./validateTypeCasting";
import { createRawType, handleBinary, handleUnary, isVoid, NSTypeError } from "./handleExpressionTypes";
import { Scope } from "./types/scope";

export function typeAnnotateAST(ast: Declaration[], currentScope?: string | null, scopes?: Map<string, Scope>) {
    let scopeName = currentScope ?? "global"
    for (let lineNum = 0; lineNum < ast.length; lineNum++) {
        const declaration = ast[lineNum]
        switch (declaration.declarationType) {
            case "statement":
                typeAnnotateStatement(declaration.value, lineNum, scopeName, scopes)
                break;
            case "function":
                typeAnnotateStatement(declaration.body, lineNum, scopeName, scopes)
                break
        }
    }
}

function typeAnnotateStatements(statements: Statement[], scope: string, scopes?: Map<string, Scope>) {
    statements.forEach((stmt, index) => typeAnnotateStatement(stmt, index, scope, scopes))
}

function typeAnnotateStatement(statement: Statement, lineNum: number, scopeName: string, scopes?: Map<string, Scope>) {
    switch (statement.statementType) {
            case "block":
                let newScope = statement.blockScopeName.blockName.value
                typeAnnotateAST(statement.blockDeclarations, newScope, scopes)
                break
            case "additionAssignment":
            case "subtractionAssignment":
            case "multiplicationAssignment":
            case "divisionAssignment":
            case "moduloAssignment":
            case "assignment":
                typeCheckExpression(statement.value.value, lineNum, scopeName, scopes)
                break
            case "increment":
            case "decrement":
                let scope = scopes?.get(scopeName ?? "")
                let name = statement.variableName.value
                if (scope) {
                    const target = scope.lookupDefinition(name, lineNum)
                    if (target?.definitionType != DefinitionType.variable) {
                        throw new NSTypeError(`Cannot increment or decrement on type 'function' (function '${name}')`)
                    }
                    const variableTarget = target as VariableDefinition
                    statement.variableType = variableTarget.type
                }
                break
            case "print":
                typeCheckExpression(statement.value.value, lineNum, scopeName, scopes)
                break
            case "variableDeclaration":
                typeCheckExpression(statement.value.value, lineNum, scopeName, scopes)
                let scopeDefault = statement.variableScopeDefinition?.scopeDefinitionDefault;
                if (scopeDefault) typeCheckExpression(scopeDefault, lineNum, scopeName, scopes);
                const valueType = statement.value.value.dataType as RawVarType;
                
                const varName = statement.variableName.value
                if (isVoid(valueType))
                    throw new NSTypeError(`Cannot assign type 'void' to variable (variable ${varName})`)

                if (!statement.variableType)
                    statement.variableType = valueType as VarType 
                break
            case "for":
                typeCheckExpression(statement.definition.value.value, lineNum, scopeName, scopes)
                typeCheckExpression(statement.condition.value, lineNum, scopeName, scopes)
                // easy way to handle whatever kind of statement this is
                typeAnnotateStatements([statement.assignment], scopeName, scopes)
                typeAnnotateStatements([statement.block], scopeName, scopes)
                break
            case "if":
                typeCheckExpression(statement.ifBranch.condition.value, lineNum, scopeName, scopes)
                typeAnnotateStatements([statement.ifBranch.block], scopeName, scopes)

                for (const ifelse of statement.elseIfBranches) {
                    typeCheckExpression(ifelse.condition.value, lineNum, scopeName, scopes)
                    typeAnnotateStatements([ifelse.block], scopeName, scopes)
                }
                if (statement.elseBranch) {
                    typeAnnotateStatements([statement.elseBranch.block], scopeName, scopes)
                }
                
                break
            case "return":
                if (statement.value)
                    typeCheckExpression(statement.value.value, lineNum, scopeName, scopes)
                break
            case "expression":
                typeCheckExpression(statement.value.value, lineNum, scopeName, scopes)
                break
            default:
                break
        }
} 

export function typeCheckExpression(expr: ExpressionNode, lineNum: number, currentScope: string, scopes?: Map<string, Scope>) {
    switch (expr.type) {
        case "binary":
            typeCheckExpression(expr.left, lineNum, currentScope, scopes);
            typeCheckExpression(expr.right, lineNum, currentScope, scopes);
            let leftType = expr.left.dataType ?? createRawType("null");
            let rightType = expr.right.dataType ?? createRawType("null");
            let binaryOperator = expr.operator;
            expr.dataType = handleBinary(leftType, rightType, binaryOperator);
            break;
        case "unary":
            typeCheckExpression(expr.value, lineNum, currentScope, scopes);
            let type = expr.value.dataType ?? createRawType("null");
            let unaaryOperator = expr.operator;
            expr.dataType = handleUnary(type, unaaryOperator);
            break;
        case "value":
            expr.dataType = getValueDataType(expr as Value, lineNum, currentScope, scopes);
            break;
        case "cast":
            typeCheckExpression(expr.value, lineNum, currentScope, scopes);
            let preCastType = expr.value.dataType ?? createRawType("null");
            let postCastType = expr.castType;
            validateTypeCast(preCastType, postCastType);
            expr.dataType = postCastType;

        default:
            break;
    }
}

function getValueDataType(value: Value, lineNum: number, currentScopeName?: string, scopes?: Map<string, Scope>): NSReturnType {
    let scope: Scope | null = null
    if (scopes && currentScopeName)
        scope = scopes.get(currentScopeName) ?? null

    switch (value.valueType) {
        case "boolean":
            return {
                varClass: VariableClass.Raw,
                type: "bool"
            };
        case "string":
            return {
                varClass: VariableClass.Raw,
                type: "str"
            };
        case "float":
            return {
                varClass: VariableClass.Raw,
                type: "f32"
            };
        case "integer":
            return {
                varClass: VariableClass.Raw,
                type: "i32"
            };
        case "functionCall":
            let funcName = value.name.value
            const potentialFuncDefinition = scope?.lookupDefinition(funcName, lineNum)
            if (potentialFuncDefinition?.definitionType != DefinitionType.function)
                return {
                varClass: VariableClass.Raw,
                type: "null"
            }
            const func = potentialFuncDefinition as FunctionDefinition
            return func.returnType
        case "literal":
            let name = value.value
            let definition = scope?.lookupDefinition(name, lineNum)
            if (definition?.definitionType != DefinitionType.variable)
                return {
                    varClass: VariableClass.Raw,
                    type: "null"
                }
            const variable = definition as VariableDefinition
            return variable?.type ?? {
                varClass: VariableClass.Raw,
                type: "null"
            }
        default:
            break;
    }

    return {
    varClass: VariableClass.Raw,
    type: "null"
};
}
