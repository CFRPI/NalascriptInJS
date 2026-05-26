import { VarType } from "../ast/expression"
import { NSReturnType, Parameter } from "../ast/declaration"
import { NSReferenceError, Scope } from "./calculateDefinitionScopes"
import { createFunctionType } from "./handleExpressionTypes"

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
    lineInBlock: number

    constructor(name: string, line: number, type: VarType, scope: Scope, lineInBlock: number) {
        super(name, line, DefinitionType.variable)
        this.type = type
        this.scope = scope
        this.lineInBlock = lineInBlock
    }

    applyReference(): void {
        if (!this.reference)
            return


        const reference = this.scope.lookupDefinition(this.reference, this.lineInBlock)
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