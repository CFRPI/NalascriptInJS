import { type NSReturnType } from "../ast/declaration";
import { type BinaryOperator, type RawVarTypes, type UnaryOperator, VariableClass, type VarType } from "../ast/expression";

export class NSTypeError extends Error {
    constructor(message: string) {
        super(message); // Sets the error message
        this.name = "Nalscript Type Error"; // Customizes the error name
    }
}

export function handleBinary(
    leftType: NSReturnType,
    rightType: NSReturnType,
    operator: BinaryOperator,
): NSReturnType {
    if (isVoid(leftType) || isVoid(rightType))
        throw new NSTypeError(`Cannot use operator '${operator}' on type void`)

    const logicalOperators: BinaryOperator[] = ["&&", "||"];

    const comparisonOperators: BinaryOperator[] = [
        "==",
        "!=",
        ">=",
        "<=",
        ">",
        "<",
    ];

    const arithmeticOperators: BinaryOperator[] = ["+", "-", "*", "/", "%"];

    // used for errors
    let leftTypeString = "[Function]"
    let rightTypeString = "[Function]"
    if (leftType.varClass == "Raw")
        leftTypeString = leftType.type
    if (rightType.varClass == "Raw")
        rightTypeString = rightType.type

    if (isNull(leftType) || isNull(rightType))
        return createRawType("null")

    if (arithmeticOperators.includes(operator)) {
        if (isUnigned(leftType) && isUnigned(rightType)) {
            return unsignedForBitSize(maxBitSize(leftType, rightType));
        } else if (isSigned(leftType) && isSigned(rightType)) {
            return signedForBitSize(maxBitSize(leftType, rightType));
        } else if (isFloat(leftType) || isFloat(rightType)) {
            // if this case is checked they are not both floats otherwise a previous
            // case will be run so if either is a float we have a float and signed/unsigned
            // in either case we want to return a float of the max bit size
            return floatForBitSize(maxBitSize(leftType, rightType));
        }

        if (
            (isUnigned(leftType) && isSigned(rightType)) ||
            (isSigned(leftType) && isUnigned(rightType))
        ) {
            return signedForBitSize(maxBitSize(leftType, rightType));
        } 

        if (operator == "+" && isString(leftType) && isString(rightType)) {
            return createRawType("str");
        } else if (isString(leftType) || isString(rightType)) {
            throw new NSTypeError(`Cannot use operator '${operator} with a string and non string type'`);
        }

        if (isBoolean(leftType) || isBoolean(rightType)) {
            throw new NSTypeError(`Cannot use operator '${operator} with a boolean'`)
        }
    }

    if (comparisonOperators.includes(operator)) {
        if (isUnigned(leftType) && isUnigned(rightType)) {
            return createRawType("bool")
        } else if (isSigned(leftType) && isSigned(rightType)) {
            return createRawType("bool")
        } else if (isFloat(leftType) && isFloat(rightType)) {
            return createRawType("bool")
        } else if (
            (isUnigned(leftType) && isSigned(rightType)) ||
            (isSigned(leftType) && isUnigned(rightType))
        ) {
            return createRawType("bool")
        } else if (isFloat(leftType) && isNumeric(rightType)) {
            throw new NSTypeError(`Cannot compare type '${leftTypeString}' with non float type '${rightTypeString}'`)
        } else if (isFloat(rightType) && isNumeric(leftType)) {
            throw new NSTypeError(`Cannot compare type '${rightTypeString}' with non float type '${leftTypeString}'`)
        } else if (isString(leftType) && isString(rightType)) {
            return createRawType("bool")
        } else {
            throw new NSTypeError(`Cannot use operator '${operator}' between data types '${leftTypeString}' and '${rightTypeString}'`)
        }
    }

    if (logicalOperators.includes(operator)) {
        if (!isBoolean(leftType) || !isBoolean(rightType)) {
            throw new NSTypeError(`Cannot use operator '${operator}' between '${leftTypeString}' and '${rightTypeString}'`)
        } else {
            return createRawType("bool")
        }
    }

    return createRawType("null")
}

export function createRawType(rawType: RawVarTypes): VarType {
    return {
        varClass: VariableClass.Raw,
        type: rawType
    }
}

export function createFunctionType(name: string): VarType {
    return {
        varClass: VariableClass.Function,
        name: name,
    }
}

export function handleUnary(type: NSReturnType, operator: UnaryOperator): NSReturnType {
    if (isVoid(type))
        throw new NSTypeError(`Cannot use operator '${operator}' on type void`)

    if (isNull(type))
        return createRawType("null")

    let typeString = "[Function]"
    if (type.varClass == "Raw")
        typeString = type.type

    if (operator == "-" && isNumeric(type)) {
        if (isUnigned(type)) {
            throw new NSTypeError(`Cannot negate type '${typeString}'`)
        }

        return type;
    } else if (operator == "!" && isBoolean(type)) {
        return createRawType("bool")
    }

    throw new NSTypeError(`Cannot use operator '${operator} with type '${typeString}''`);
}

export function isVoid(type: NSReturnType) {
    if (type.varClass != VariableClass.Raw) return false
    return type.type == "void"
}

export function isNull(type: NSReturnType) {
    if (type.varClass != VariableClass.Raw) return false
    return type.type == "null"
}

export function isNumeric(type: NSReturnType): boolean {
    return isUnigned(type) || isSigned(type) || isFloat(type);
}

export function isUnigned(type: NSReturnType): boolean {
    if (type.varClass != VariableClass.Raw) return false
    return type.type.charAt(0) == "u";
}

export function isSigned(type: NSReturnType): boolean {
    if (type.varClass != VariableClass.Raw) return false
    return type.type.charAt(0) == "i";
}

export function isFloat(type: NSReturnType): boolean {
    if (type.varClass != VariableClass.Raw) return false
    return type.type.charAt(0) == "f";
}

export function isString(type: NSReturnType): boolean {
    if (type.varClass != VariableClass.Raw) return false
    return type.type == "str";
}

export function isBoolean(type: NSReturnType): boolean {
    if (type.varClass != VariableClass.Raw) return false
    return type.type == "bool";
}

export function bitSizeForType(type: NSReturnType): number {
    if (type.varClass != VariableClass.Raw) return -1
    let sizeString = type.type.substring(1);
    return parseInt(sizeString);
}

export function maxBitSize(leftType: NSReturnType, rightType: NSReturnType): number {
    if (leftType.varClass != VariableClass.Raw) return -1
    if (rightType.varClass != VariableClass.Raw) return -1
    return Math.max(bitSizeForType(leftType), bitSizeForType(rightType));
}

export function unsignedForBitSize(size: number): NSReturnType {
    return {
        varClass: VariableClass.Raw,
        type: ("u" + size) as RawVarTypes
    }
}

export function signedForBitSize(size: number): NSReturnType {
    return {
        varClass: VariableClass.Raw,
        type: ("i" + size) as RawVarTypes
    }
}

export function floatForBitSize(size: number): NSReturnType {
    return {
        varClass: VariableClass.Raw,
        type: ("f" + size) as RawVarTypes
    }
}
