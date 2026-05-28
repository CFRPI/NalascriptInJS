import { VarType } from "../../ast/expression"
import { NSReturnType, Parameter } from "../../ast/declaration"
import { Scope } from "./scope"
import { createFunctionType } from "../handleExpressionTypes"
import { NSReferenceError } from "../calculateDefinitionScopes"

export enum DefinitionType {
    variable="variable", function="function"
}
export class Definition {
    definitionType: string
    name: string
    line: number
    // used to point datatype to other definition
    reference: string | null

    constructor(name: string, line: number, definitionType: DefinitionType) {
        this.name = name
        this.line = line
        this.reference = null
        this.definitionType = definitionType
    }

    addReference(name: string) {
        this.reference = name
    }

    applyReference() {}
}

export class VariableDefinition extends Definition {
    type: VarType
    scope: Scope

    constructor(name: string, line: number, type: VarType, scope: Scope) {
        super(name, line, DefinitionType.variable)
        this.type = type
        this.scope = scope
    }

    applyReference(): void {
        if (!this.reference)
            return


        const reference = this.scope.lookupDefinition(this.reference, this.line)
        if (!reference)
            throw new NSReferenceError(`Referencing undefined variable ${this.reference}`)

        if (reference.definitionType == "variable") {
            reference.applyReference()
            this.type = (reference as VariableDefinition).type
        } else if (reference.definitionType == "function") {
            this.type = createFunctionType(reference.name)
        }
    }
}

export class FunctionDefinition extends Definition {
    parameters: Parameter[]
    returnType: NSReturnType

    constructor(name: string, line: number, parameters: Parameter[], returnType:NSReturnType) {
        super(name, line, DefinitionType.function)

        this.parameters = parameters
        this.returnType = returnType
    }
}