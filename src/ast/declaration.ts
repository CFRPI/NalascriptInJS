import { LiteralValue, VariableClass, VarType } from "./expression"
import { BlockStatement, Statement } from "./statements"

export type Declaration = StatementDeclaration | FunctionDeclaration

export interface StatementDeclaration {
    type: "declaration"
    declarationType: "statement"
    value: Statement
}

export interface FunctionDeclaration {
    type: "declaration"
    declarationType: "function"
    name: LiteralValue
    parameters: Parameter[]
    returnType: NSReturnType
    body: BlockStatement
}

export type NSReturnType = VarType | {
    varClass: VariableClass.Raw
    type: "void"
}

export interface Parameter {
    type: "declaration"
    declarationType: "parameter"
    name: LiteralValue
    dataType: VarType
}