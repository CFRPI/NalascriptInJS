import { VariableClass, type FloatValue, type IntegerValue, type Value } from "staticAnalysis/ast/expression"

export function handleValue(value: Value): string {
    let dataType = value.dataType
    if (!dataType)
        return "<Error Compiling Value>"

    switch (value.valueType) {
        case "integer":
            return handleNumber(value)
        case "float":
            return handleNumber(value)
        case "boolean":
            break
        case "literal":
            break
        case "functionCall":
            break
        case "string":
            break
    }

    return ""
}

function handleNumber(value: IntegerValue | FloatValue): string {
    if (value.dataType?.varClass == VariableClass.Function)
        return "<Function types not implemented>";
    let numberValue = value.value
    switch (value.dataType?.type) {
        case "i32":
            return `i32.const ${numberValue}`
        case "i64":
            return `i64.const ${numberValue}`
        case "u32":
            let thirtyTwoBitString = unsignedToSigned(32, value.value)
            return `u32.const ${thirtyTwoBitString}`
        case "u64":
            let sixtyFourBitString = unsignedToSigned(64, value.value)
            return `u64.const ${sixtyFourBitString}`
        case "f32":
            return `f32.const ${numberValue}`
        case "f64":
            return `f64.const ${numberValue}`
        default:
            break;
    }

    return ""
}

function unsignedToSigned(number: number, bits: number): string {
    const bigInt = BigInt(number)
    return BigInt.asIntN(bits, bigInt).toString()
}