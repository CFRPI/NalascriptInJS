import { type NSReturnType } from "./declaration"

export type RawVarTypes =
    | "u32"
    | "u64"
    | "i32"
    | "i64"
    | "f32"
    | "f64"
    | "str"
    | "bool"
    | "null"

export enum VariableClass {
    Raw = "Raw", Function = "Function"
}

export interface RawVarType {
    varClass: VariableClass.Raw
    type: RawVarTypes
}

export interface FunctionVarType {
    varClass: VariableClass.Function,
    name: string
}

export type VarType = RawVarType | FunctionVarType

export type BinaryOperator =
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | "=="
    | "!="
    | "<="
    | ">="
    | ">"
    | "<"
    | "&&"
    | "||"
export type UnaryOperator = "!" | "-"

// Value types
export interface LiteralValue {
    type: "value"
    valueType: "literal"
    value: string
    dataType?: NSReturnType
}

export interface IntegerValue {
    type: "value"
    valueType: "integer"
    value: number
    dataType?: VarType
}

export interface FloatValue {
    type: "value"
    valueType: "float"
    value: number
    dataType?: VarType
}

export interface BooleanValue {
    type: "value"
    valueType: "boolean"
    value: boolean
    dataType?: VarType
}

export interface StringValue {
    type: "value"
    valueType: "string"
    value: string
    dataType?: VarType
}

export interface FunctionCallValue {
    type: "value",
    valueType: "functionCall",
    arguments: Expression[],
    dataType?: NSReturnType
    name: LiteralValue
}

export type Value =
    | LiteralValue
    | IntegerValue
    | FloatValue
    | BooleanValue
    | StringValue
    | FunctionCallValue

// Expression nodes
export interface BinaryExpression {
    type: "binary"
    operator: BinaryOperator
    left: ExpressionNode
    right: ExpressionNode
    dataType?: NSReturnType
}

export interface UnaryExpression {
    type: "unary"
    operator: UnaryOperator
    value: ExpressionNode
    dataType?: NSReturnType
}

export interface TypeCastExpression {
    type: "cast"
    value: ExpressionNode
    castType: NSReturnType
    dataType?: NSReturnType
}

export type ExpressionNode = BinaryExpression | UnaryExpression | Value | TypeCastExpression

export interface Expression {
    type: "expression"
    value: ExpressionNode
    dataType?: NSReturnType
}
