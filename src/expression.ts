export type VarType =
    | "u8"
    | "u16"
    | "u32"
    | "u64"
    | "u128"
    | "i8"
    | "i16"
    | "i32"
    | "i64"
    | "i128"
    | "f8"
    | "f16"
    | "f32"
    | "f64"
    | "f128"
    | "str"
    | "bool"
    | "null"

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
    dataType?: VarType
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

export type Value =
    | LiteralValue
    | IntegerValue
    | FloatValue
    | BooleanValue
    | StringValue

// Expression nodes
export interface BinaryExpression {
    type: "binary"
    operator: BinaryOperator
    left: ExpressionNode
    right: ExpressionNode
    dataType?: VarType
}

export interface UnaryExpression {
    type: "unary"
    operator: UnaryOperator
    value: ExpressionNode
    dataType?: VarType
}

export interface TypeCastExpression {
    type: "cast"
    value: ExpressionNode
    castType: VarType
    dataType?: VarType
}

export type ExpressionNode = BinaryExpression | UnaryExpression | Value | TypeCastExpression

export interface Expression {
    type: "expression"
    value: ExpressionNode
    dataType?: VarType
}
