import { VariableClass, type BinaryExpression, type RawVarType, type RawVarTypes, type VarType } from "staticAnalysis/ast/expression.ts";
import { compileExpression } from "./compileExpression.ts";
import type { Scope } from "staticAnalysis/typeChecking/types/scope.ts";
import { createIndent } from "../createIndent.ts";
import { isFloat, isSigned } from "staticAnalysis/typeChecking/handleExpressionTypes.ts";

export function handleBinary(expression: BinaryExpression, scopes: Map<string, Scope>, level: number): string {
    let res = ""
            res += compileExpression(expression.left, scopes, level) + "\n"
            res += compileExpression(expression.right, scopes, level) + "\n"
    
    let signed = isSigned(expression.left.dataType!) || isSigned(expression.right.dataType!);
    // we want to know the type of the arguments, at this point they should be the same in the ast so we just check the left
    let datatype = expression.left.dataType
    if (!datatype) return "<Error: no data type>"
    if (datatype.varClass != VariableClass.Raw) return "<Error: not a raw data type>"
    let datatypePrefix = getDatatypePrefix(datatype as RawVarType)

    switch (expression.operator) {
        case "+":
            res += createIndent(level) + `${datatypePrefix}.add`
            return res
        case "-":
            res += createIndent(level) + `${datatypePrefix}.sub`
            return res
        case "*":
            res += createIndent(level) + `${datatypePrefix}.mul`
            return res
        case "/":
            let divisionCommand = signed ? "div_s" : "div_u"
            if (isFloat(datatype))
                divisionCommand = "div"
            res += createIndent(level) + (signed ? `${datatypePrefix}.${divisionCommand}` : `${datatypePrefix}.${divisionCommand}`)
            return res
        case "%":
            let remainderCommand = signed ? "rem_s" : "rem_u"
            if (isFloat(datatype))
                remainderCommand = "rem"
            res += createIndent(level) + (signed ? `${datatypePrefix}.${remainderCommand}` : `${datatypePrefix}.${remainderCommand}`)
            return res
        case ">":
            let gtCommand = signed ? "gt_s" : "gt_u"
            if (isFloat(datatype))
                gtCommand = "gt"
            res += createIndent(level) + (signed ? `${datatypePrefix}.${gtCommand}` : `${datatypePrefix}.${gtCommand}`)
            return res
        case ">=":
            let geCommand = signed ? "ge_s" : "ge_u"
            if (isFloat(datatype))
                geCommand = "ge"
            res += createIndent(level) + (signed ? `${datatypePrefix}.${geCommand}` : `${datatypePrefix}.${geCommand}`)
            return res
        case "<":
            let ltCommand = signed ? "lt_s" : "lt_u"
            if (isFloat(datatype))
                gtCommand = "lt"
            res += createIndent(level) + (signed ? `${datatypePrefix}.${ltCommand}` : `${datatypePrefix}.${ltCommand}`)
            return res
        case "<=":
            let leCommand = signed ? "le_s" : "le_u"
            if (isFloat(datatype))
                geCommand = "le"
            res += createIndent(level) + (signed ? `${datatypePrefix}.${leCommand}` : `${datatypePrefix}.${leCommand}`)
            return res
        case "==":
            
        default:
            break;
    }

    return `<Unimplemented Operator ${expression.operator}>`
}

function getDatatypePrefix(datatype: RawVarType) {
    if (datatype.type == "i32" || datatype.type == "u32") return "i32"
    if (datatype.type == "i64" || datatype.type == "u64") return "i64"
    if (datatype.type == "f32") return "f32"
    if (datatype.type == "f64") return "f64"
    if (datatype.type == "bool") return "i32"
    return "<Invalid Type>"
}