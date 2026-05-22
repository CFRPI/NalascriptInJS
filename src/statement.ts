import { Expression } from "./expression";

export interface StmtExpr{
    type: "statement",
    statementType: "expression",
    value: Expression
}