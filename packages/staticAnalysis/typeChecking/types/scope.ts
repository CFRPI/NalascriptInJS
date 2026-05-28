import { type NSReturnType } from "../../ast/declaration.ts"
import { type BlockStatement } from "../../ast/statements.ts"
import { Definition } from "./defintion.ts"

export class Scope {
    definitions: Definition[]
    block: BlockStatement | null
    parent: Scope | null
    lineInParent: number | null
    blockReturnType: NSReturnType | null
    childScopes: Scope[]

    constructor(block: BlockStatement | null, parent: Scope | null, lineInParent: number | null) {
        this.definitions = []
        this.block = block
        this.parent = parent
        this.lineInParent = lineInParent
        this.blockReturnType = null
        this.childScopes = []

        if (this.parent)
            this.parent.addChild(this)
        
        if (this.parent?.blockReturnType) {
            this.setReturnType(this.parent.blockReturnType)
        }
    }

    addChild(scope: Scope) {
        this.childScopes.push(scope)
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

    // same as lookup definition but ignores the line it was defined on
    lookupDefinitionGlobal(name: string) {
        for (let definition of this.definitions)
            if (definition.name == name)
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