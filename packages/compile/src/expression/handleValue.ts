import { VariableClass, type IntegerValue, type Value } from "staticAnalysis/ast/expression"

export function handleValue(value: Value): string {
    let dataType = value.dataType
    if (!dataType)
        return "<Error Compiling Value>"

    switch (value.valueType) {
        case "integer":
            return handleInteger(value)
        case "float":
            break
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

function handleInteger(value: IntegerValue): string {
    if (value.dataType?.varClass == VariableClass.Function)
        return "<Function types not implemented>";
    switch (value.dataType?.type) {
        case "i32":
            let numberValue = value.value
            return `i32.const ${numberValue}`
    
        default:
            break;
    }

    return ""
}

function unsignedToSigned(number: number, bits: number) {
    const bigInt = BigInt(number)
    return BigInt.asIntN(bits, bigInt).toString()
}