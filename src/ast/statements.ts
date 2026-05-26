import { Declaration, NSReturnType, Parameter } from "./declaration"
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
    variableType?: VarType
}

export interface DecrementStatement {
    type: "statement"
    statementType: "decrement"
    variableName: LiteralValue
    variableType?: VarType
}

export interface VariableDeclarationStatement {
    type: "statement"
    statementType: "variableDeclaration"
    variableName: LiteralValue
    variableType?: VarType
    variableScopeDefinition?: ScopingDefinition
    value: Expression
}

export interface PrintStatement {
    type: "statement"
    statementType: "print"
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
    blockDeclarations: Declaration[]
    staticScope?: StaticScopeTypes
}

export interface ForStatement {
    type: "statement"
    statementType: "for"
    definition: AssignmentStatement | VariableDeclarationStatement
    condition: Expression
    assignment: AssignmentStatements
    block: BlockStatement
}

export interface IfStatement {
    type: "statement"
    statementType: "if"
    ifBranch: BranchWithCondition
    elseIfBranches: BranchWithCondition[]
    elseBranch: BranchWithoutCondition | null
}

export interface BranchWithCondition {
    type: "statement"
    statementType: "branchWithCondition"
    condition: Expression
    block: BlockStatement
}

export interface BranchWithoutCondition {
type: "statement"
    statementType: "branchWithoutCondition"
    block: BlockStatement
}

export type StaticScopeTypes = {[key: string]: StaticVariableDefinition | StaticFunctionDefinition}

export type StaticVariableDefinition = {
    definitionType: "Variable"
    varType: VarType,
    line: number
}

export type StaticFunctionDefinition = {
    definitionType: "Function"
    parameters: Parameter[]
    returnType: NSReturnType
    line: number
}
export interface BlockName {
    type: "blockName"
    blockName: LiteralValue
}

export type AssignmentWithValueStatements = 
    | AssignmentStatement
    | AdditionAssignmentStatement
    | SubtractionAssignmentStatement
    | MultiplicationAssignmentStatement
    | DivisionAssignmentStatement
    | ModuloAssignmentStatement

export type AssignmentStatements = 
    | AssignmentWithValueStatements
    | IncrementStatement
    | DecrementStatement

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
    | ForStatement
    | IfStatement
    | PrintStatement
