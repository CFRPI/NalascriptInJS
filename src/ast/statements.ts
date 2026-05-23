import { Expression, LiteralValue, Value, VarType } from "./expression"

// Scoping definition
export interface ScopingDefinition {
    type: "scopeDefinition"
    scopeDefinitionName: LiteralValue
    scopeDefinitionDefault: Value
}

// Statements
export interface AssignmentStatement {
    type: "statement"
    statementType: "assignment"
    variableName: LiteralValue
    value: Expression
}

export interface AdditionAssignmentStatement {
    type: "statement"
    statementType: "additionAssignment"
    variableName: LiteralValue
    value: Expression
}

export interface SubtractionAssignmentStatement {
    type: "statement"
    statementType: "subtractionAssignment"
    variableName: LiteralValue
    value: Expression
}

export interface MultiplicationAssignmentStatement {
    type: "statement"
    statementType: "multiplicationAssignment"
    variableName: LiteralValue
    value: Expression
}

export interface DivisionAssignmentStatement {
    type: "statement"
    statementType: "divisionAssignment"
    variableName: LiteralValue
    value: Expression
}

export interface ModuloAssignmentStatement {
    type: "statement"
    statementType: "moduloAssignment"
    variableName: LiteralValue
    value: Expression
}

export interface IncrementStatement {
    type: "statement"
    statementType: "increment"
    variableName: LiteralValue
}

export interface DecrementStatement {
    type: "statement"
    statementType: "decrement"
    variableName: LiteralValue
}

export interface VariableDeclarationStatement {
    type: "statement"
    statementType: "variableDeclaration"
    variableName: LiteralValue
    variableType?: VarType
    variableScopeDefinition?: ScopingDefinition
    value: Expression
}

export interface ExpressionStatement {
    type: "statement"
    statementType: "expression"
    value: Expression
}

export interface BlockStatement {
    type: "statement"
    statementType: "block"
    blockScopeName: BlockName
    blockStatements: Statement[]
    staticScope?: StaticScopeTypes
}

export type StaticScopeTypes = {[key: string]: {
        varType: VarType,
        line: number
    }
}

export interface BlockName {
    type: "blockName"
    blockName: LiteralValue
}

export type Statement =
    | AssignmentStatement
    | AdditionAssignmentStatement
    | SubtractionAssignmentStatement
    | MultiplicationAssignmentStatement
    | DivisionAssignmentStatement
    | ModuloAssignmentStatement
    | IncrementStatement
    | DecrementStatement
    | VariableDeclarationStatement
    | ExpressionStatement
    | BlockStatement
