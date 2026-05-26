import { NSReturnType } from "../ast/declaration";
import { bitSizeForType, isBoolean, isFloat, isNumeric, isString, isVoid, NSTypeError } from "./handleExpressionTypes";

export function validateTypeCast(preCastType: NSReturnType, postCastType: NSReturnType) {
    if (isVoid(preCastType) && !isVoid(postCastType)) 
        throw new NSTypeError(`Cannot cast type 'void' to type ${postCastType}`)
    
    if (isNumeric(preCastType) && !isNumeric(postCastType))
        throw new NSTypeError(`Cannot cast '${preCastType}' to non numeric type '${postCastType}'`);

    if (isString(preCastType) && !isString(postCastType))
        throw new NSTypeError(`Cannot cast type 'str' to type '${postCastType}'. Strings cannot be cast to non string types'`)

    if (isBoolean(preCastType) && !isBoolean(postCastType))
        throw new NSTypeError(`Cannot cast type 'bool' to type '${postCastType}'. Bools cannot be cast to non bool types'`)

    if (isFloat(preCastType) && !isFloat(postCastType))
        throw new NSTypeError(`Cannot cast float type '${preCastType}' to non float type '${postCastType}'`)

    // you cannot cast a number to another number with a lower bit depth
    if (bitSizeForType(postCastType) < bitSizeForType(preCastType)) {
        let preBitDepth = bitSizeForType(preCastType)
        let postBitDepth = bitSizeForType(postCastType)
        throw new NSTypeError(`Cannot cast type '${preCastType}' with bit depth ${preBitDepth} to type '${postCastType}' with lower bit depth of ${postBitDepth}'`)
    }
}