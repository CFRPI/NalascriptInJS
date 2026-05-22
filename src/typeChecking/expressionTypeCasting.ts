import { VarType } from "../expression";
import { bitSizeForType, isBoolean, isFloat, isNumeric, isSigned, isString, isUnigned, NSTypeError } from "./expressionTypeHandling";

export function validateTypeCast(preCastType: VarType, postCastType: VarType) {
    if (isNumeric(preCastType) && !isNumeric(postCastType))
        throw new NSTypeError(`Cannot cast '${preCastType}' to non numeric type '${postCastType}'`);

    if (isString(preCastType) && !isString(postCastType))
        throw new NSTypeError(`Cannot cast type 'str' to type '${postCastType}. String cannot be cast to non string type'`)

    if (isBoolean(preCastType) && !isBoolean(postCastType))
        throw new NSTypeError(`Cannot cast type 'bool' to type '${postCastType}. Bool cannot be cast to non bool type'`)

    if (isFloat(preCastType) && !isFloat(postCastType))
        throw new NSTypeError(`Cannot cast float type '${preCastType}' to non float type '${postCastType}'`)

    // you cannot cast a number to another number with a lower bit depth
    if (bitSizeForType(postCastType) < bitSizeForType(preCastType)) {
        let preBitDepth = bitSizeForType(preCastType)
        let postBitDepth = bitSizeForType(postCastType)
        throw new NSTypeError(`Cannot cast type '${preCastType}' with bit depth ${preBitDepth} to type '${postCastType}' with lower bit depth of ${postBitDepth}'`)
    }
}