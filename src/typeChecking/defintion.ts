import { VarType } from "../ast/expression"

export class Definition {
    name: string
    type: VarType
    
    constructor(name: string, type: VarType) {
        this.name = name
        this.type = type
    }
}