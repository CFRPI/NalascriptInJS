import { BinaryOperator, UnaryOperator, VarType } from "../ast/expression";

export class NSTypeError extends Error {
    constructor(message: string) {
        super(message); // Sets the error message
        this.name = "Nalscript Type Error"; // Customizes the error name
    }
}

export function handleBinary(
    leftType: VarType,
    rightType: VarType,
    operator: BinaryOperator,
): VarType {
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

    if (leftType == "null" || rightType == "null")
        return "null"

    if (arithmeticOperators.includes(operator)) {
        if (isUnigned(leftType) && isUnigned(rightType)) {
            return unsignedForBitSize(maxBitSize(leftType, rightType));
        } else if (isSigned(leftType) && isSigned(rightType)) {
            return signedForBitSize(maxBitSize(leftType, rightType));
        } else if (isFloat(leftType) && isFloat(rightType)) {
            return signedForBitSize(maxBitSize(leftType, rightType));
        }

        if (
            (isUnigned(leftType) && isSigned(rightType)) ||
            (isSigned(leftType) && isUnigned(rightType))
        ) {
            return signedForBitSize(maxBitSize(leftType, rightType));
        } else if (isFloat(leftType) || isFloat(rightType)) {
            // if this case is checked they are not both floats otherwise a previous
            // case will be run so if either is a float we have a float and signed/unsigned
            // in either case we want to return a float of the max bit size
            return floatForBitSize(maxBitSize(leftType, rightType));
        }

        if (operator == "+" && isString(leftType) && isString(rightType)) {
            return "str";
        } else if (isString(leftType) || isString(rightType)) {
            throw new NSTypeError(`Cannot use operator '${operator} with a string'`);
        }

        if (isBoolean(leftType) || isBoolean(rightType)) {
            throw new NSTypeError(`Cannot use operator '${operator} with a boolean'`)
        }
    }

    if (comparisonOperators.includes(operator)) {
        if (isUnigned(leftType) && isUnigned(rightType)) {
            return "bool"
        } else if (isSigned(leftType) && isSigned(rightType)) {
            return "bool"
        } else if (isFloat(leftType) && isFloat(rightType)) {
            return "bool"
        } else if (
            (isUnigned(leftType) && isSigned(rightType)) ||
            (isSigned(leftType) && isUnigned(rightType))
        ) {
            return "bool"
        } else if ((isFloat(leftType) || isFloat(rightType)) && 
                isNumeric(leftType) && isNumeric(rightType)) {
            // if this case is checked they are not both floats otherwise a previous
            // case will be run so if either is a float we have a float and signed/unsigned
            return "bool"
        } else if (isString(leftType) && isString(rightType)) {
            return "bool"
        } else {
            throw new NSTypeError(`Cannot use operator '${operator}' between data types '${leftType}' and '${rightType}'`)
        }
    }

    if (logicalOperators.includes(operator)) {
        if (!isBoolean(leftType) || !isBoolean(rightType)) {
            throw new NSTypeError(`Cannot use operator '${operator}' between '${leftType}' and '${rightType}'`)
        } else {
            return "bool"
        }
    }

    return "null"
}

export function handleUnary(type: VarType, operator: UnaryOperator): VarType {
    if (type == "null")
        return "null"

    if (operator == "-" && isNumeric(type)) {
        if (isUnigned(type)) {
            throw new NSTypeError(`Cannot negate type '${type}'`)
        }

        return type;
    } else if (operator == "!" && isBoolean(type)) {
        return "bool"
    }

    throw new NSTypeError(`Cannot use operator '${operator} with type '${type}''`);
}

export function isNumeric(type: VarType): boolean {
    return isUnigned(type) || isSigned(type) || isFloat(type);
}

export function isUnigned(type: VarType): boolean {
    return type.charAt(0) == "u";
}

export function isSigned(type: VarType): boolean {
    return type.charAt(0) == "i";
}

export function isFloat(type: VarType): boolean {
    return type.charAt(0) == "f";
}

export function isString(type: VarType): boolean {
    return type == "str";
}

export function isBoolean(type: VarType): boolean {
    return type == "bool";
}

export function bitSizeForType(type: VarType) {
    let sizeString = type.substring(1);
    return parseInt(sizeString);
}

export function maxBitSize(leftType: VarType, rightType: VarType): number {
    return Math.max(bitSizeForType(leftType), bitSizeForType(rightType));
}

export function unsignedForBitSize(size: number): VarType {
    return ("u" + size) as VarType;
}

export function signedForBitSize(size: number): VarType {
    return ("i" + size) as VarType;
}

export function floatForBitSize(size: number): VarType {
    return ("f" + size) as VarType;
}
