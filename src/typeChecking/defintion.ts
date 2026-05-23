import { VarType } from "../ast/expression"

export class Definition {
    name: string
    type: VarType
    line: number

    constructor(name: string, type: VarType, line: number) {
        this.name = name
        this.type = type
        this.line = line
    }
}