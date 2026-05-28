import { NSReturnType } from "../../ast/declaration"
import { BlockStatement } from "../../ast/statements"
import { Definition } from "./defintion"

export class Scope {
    definitions: Definition[]
    block: BlockStatement | null
    parent: Scope | null
    lineInParent: number | null
    blockReturnType: NSReturnType | null

    constructor(block: BlockStatement | null, parent: Scope | null, lineInParent: number | null) {
        this.definitions = []
        this.block = block
        this.parent = parent
        this.lineInParent = lineInParent
        this.blockReturnType = null

        if (this.parent?.blockReturnType) {
            this.setReturnType(this.parent.blockReturnType)
        }
    }

    lookupDefinition(name: string, line: number): Definition | null {
        for (let definition of this.definitions)
            if (definition.name == name && line >= definition.line)
                return definition

        let parentLookup = null
        if (this.parent)
            parentLookup = this.parent.lookupDefinition(name, this.lineInParent!)
        return parentLookup;
    }

    applyReferences() {
        this.definitions.forEach(definition => definition.applyReference())
    }

    setReturnType(returnType: NSReturnType) {
        this.blockReturnType = returnType
    }
}