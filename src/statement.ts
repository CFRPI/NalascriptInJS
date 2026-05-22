import { Expression } from "./ast/expression";

export interface StmtExpr{
    type: "statement",
    statementType: "expression",
    value: Expression
}