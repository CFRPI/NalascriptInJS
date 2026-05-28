import { type LiteralValue, type VariableClass, type VarType } from "./expression.ts"
import { type BlockStatement, type Statement } from "./statements.ts"

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
    hoisted: boolean
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