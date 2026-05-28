import { type NSReturnType } from "../ast/declaration";
import { bitSizeForType, isBoolean, isFloat, isNumeric, isSigned, isString, isVoid, NSTypeError } from "./handleExpressionTypes";

export function validateTypeCast(preCastType: NSReturnType, postCastType: NSReturnType) {
    if (preCastType.varClass != "Raw" || postCastType.varClass != "Raw")
        throw new NSTypeError("Cannot type cast non raw data type")
    
    if (isVoid(preCastType) && !isVoid(postCastType)) 
        throw new NSTypeError(`Cannot cast type 'void' to type ${postCastType.type}`)
    
    if (isNumeric(preCastType) && !isNumeric(postCastType))
        throw new NSTypeError(`Cannot cast '${preCastType.type}' to non numeric type '${postCastType.type}'`);

    if (isString(preCastType) && !isString(postCastType))
        throw new NSTypeError(`Cannot cast type 'str' to type '${postCastType.type}'. Strings cannot be cast to non string types`)

    if (isBoolean(preCastType) && !isBoolean(postCastType))
        throw new NSTypeError(`Cannot cast type 'bool' to type '${postCastType.type}'. Bools cannot be cast to non bool types`)

    if (isFloat(preCastType) && !isFloat(postCastType))
        throw new NSTypeError(`Cannot cast float type '${preCastType.type}' to non float type '${postCastType.type}'`)

    if (isSigned(preCastType) && !isSigned(postCastType))
        throw new NSTypeError(`Cannot cast signed type '${preCastType.type}' to unsigned type '${postCastType.type}'`)

    // you cannot cast a number to another number with a lower bit depth
    if (bitSizeForType(postCastType) < bitSizeForType(preCastType)) {
        let preBitDepth = bitSizeForType(preCastType)
        let postBitDepth = bitSizeForType(postCastType)
        throw new NSTypeError(`Cannot cast type '${preCastType.type}' with bit depth ${preBitDepth} to type '${postCastType.type}' with lower bit depth of ${postBitDepth}`)
    }
}