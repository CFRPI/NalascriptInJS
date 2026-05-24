start = line*

line = __* statement: statement __* newline? {
    return statement
}

statement = forStmt / ifStmt / variableDeclarationStmt / assignmentStatements / stmtExpr / blockStmt

blockStmt = _ scopeName: blockScopeName? _ '{' _ statements: line*  _ '}' {
    return {
        type: "statement",
        statementType: "block",
        blockScopeName: scopeName ?? {
            type: "blockName",
            blockName: {
                type: "value",
                valueType: "literal",
                value: Math.random().toString().substring(2) + "-Anonymous"
            }
        },
        blockStatements: statements,
    }
}

blockScopeName = "@" _ name: literal {
    return {
        type: "blockName",
        blockName: name,
    }
}

assignmentStatements = assignmentStatement / additionAssignmentStatement /
    subtractionAssignmentStatement / multiplicationAssignmentStatememnt /
    divisionAssignmentStatement / moduloAssignmentStatement /
    incrementStatement / decrementStatement


assignmentStatement = variable: literal _ "=" _ value: expression {
    return {
        type: "statement",
        statementType: "assignment",
        variableName: variable,
        value: value
    }
}

additionAssignmentStatement = variable: literal _ "+=" _ value: expression {
    return {
        type: "statement",
        statementType: "additionAssignment",
        variableName: variable,
        value: value
    }
}

subtractionAssignmentStatement = variable: literal _ "-=" _ value: expression {
    return {
        type: "statement",
        statementType: "subtractionAssignment",
        variableName: variable,
        value: value
    }
}

multiplicationAssignmentStatememnt = variable: literal _ "*=" _ value: expression {
    return {
        type: "statement",
        statementType: "multiplicationAssignment",
        variableName: variable,
        value: value
    }
}

divisionAssignmentStatement = variable: literal _ "/=" _ value: expression {
    return {
        type: "statement",
        statementType: "divisionAssignment",
        variableName: variable,
        value: value
    }
}

moduloAssignmentStatement = variable: literal _ "%=" _ value: expression {
    return {
        type: "statement",
        statementType: "moduloAssignment",
        variableName: variable,
        value: value
    }
}

incrementStatement = variable: literal _ "++" {
    return {
        type: "statement",
        statementType: "increment",
        variableName: variable,
    }
}

decrementStatement = variable: literal _ "--" {
    return {
        type: "statement",
        statementType: "decrement",
        variableName: variable,
    }
}

variableDeclarationStmt = "let" _ scope: scopingDefinition? _ name: literal _ type:typeDefinition? _ "=" _ value: expression {
    return {
        type: "statement",
        statementType: "variableDeclaration",
        variableName: name,
        variableType: type,
        variableScopeDefinition: scope,
        value: value
    }
}

scopingDefinition = "@" _ scopeName: literal "{" value: constValue? "}" {
    return {
        type: "scopeDefinition",
        scopeDefinitionName: scopeName,
        scopeDefinitionDefault: value ?? {
            type: "value",
            valueType: "null",
            value: "null"
        }
    }
}

forStmt = forWithDeclaration / forWithAssignment

ifStmt = "if" _ ifCondition: expression _ ifBlock: blockStmt _ elseIf: elseIfStmt* _ elseStmt: elseStmt? {
    return {
        type: "statement",
        statementType: "if",
        ifBranch: {
            type: "statement",
            statementType: "branchWithCondition",
            condition: ifCondition,
            block: ifBlock,
        }, 
        elseIfBranches: elseIf,
        elseBranch: elseStmt
    }
}

elseIfStmt = "else" _ "if" _ condition: expression _ block: blockStmt _ {
    return {
        type: "statement",
        statementType: "branchWithCondition",
        condition: condition,
        block: block
    }
}

elseStmt = "else" _ block: blockStmt {
    return {
        type: "statement",
        statementType: "branchWithoutCondition",
        block: block
    }
}

forWithDeclaration = "for" _ declaration: variableDeclarationStmt _ ";" _ condition: expression _ ";" _ assignment: assignmentStatements _ block: blockStmt {
    return {
        type: "statement",
        statementType: "for",
        definition: declaration,
        condition: condition,
        assignment: assignment,
        block: block
    }
}

forWithAssignment = "for" _ declaration: assignmentStatements _ ";" _ condition: expression _ ";" _ assignment: assignmentStatements _ block: blockStmt {
    return {
        type: "statement",
        statementType: "for",
        definition: declaration,
        condition: condition,
        assignment: assignment,
        block: block
    }
}

// Simplified for-loop specific rules
forVarDeclaration = "let" _ name: literal _ type: typeDefinition? _ "=" _ value: expression {
    return {
        type: "statement",
        statementType: "variableDeclaration",
        variableName: name,
        variableType: type,
        variableScopeDefinition: null,
        value: value
    }
}

forAssignment = variable: literal _ "=" _ value: expression {
    return {
        type: "statement",
        statementType: "assignment",
        variableName: variable,
        value: value
    }
}

typeDefinition = ":" _ type: varType {
    return type
}

varType = "u8" / "u16" / "u32" / "u64" / "u128" / 
        "i8" / "i16" / "i32" / "i64" / "i128" /
        "f8" / "f16" / "f32" / "f64" / "f128" /
        "str" / "bool" / "null"

stmtExpr = expr: expression {
    return {
        type: "statement",
        statementType: "expression",
        value: expr
    }
}

expression = value: logical {
    return {
        type: "expression",
        value: value
    }
}

logical = left: comparison _ operator: ('&&' / '||') _ right: logical {
    return {
        type: "binary",
        operator: operator,
        left: left,
        right: right,
    }
} / comparison

comparison = left: term _ operator: ('==' / '!=' / '<=' / '>=' / '>' / '<' ) _ right: comparison {
    return {
        type: "binary",
        operator: operator,
        left: left,
        right: right,
    }
} / term

term = left: factor _ operator: ("+" / "-") _  right: term {
    return {
        type: "binary",
        operator: operator,
        left: left,
        right: right,
    }
} / factor

factor = left: modulus _ operator: ("*" / "/") _  right: factor {
    return {
        type: "binary",
        operator: operator,
        left: left,
        right: right,
    }
} / modulus

modulus = left: typeCast _ operator: ("%") _  right: modulus {
    return {
        type: "binary",
        operator: operator,
        left: left,
        right: right,
    }
} / typeCast

typeCast = value: unary _ "as" _ type: varType {
    return {
        type: "cast",
        value: value,
        castType: type
    }
} / unary

unary = operator: ("!" / "-") _ value: unary {
    return {
        type: "unary",
        operator: operator,
        value: value
    }
} / value


value = constValue / literal / grouping
constValue = operator: ("!" / "-") _ value: constValue {
    return {
        type: "unary",
        operator: operator,
        value: value
    }
} / constantLiteral
constantLiteral = boolean / string / number / null

grouping =  '(' _ content: logical _ ')'  {
    return content
}

literal = first: [a-zA-Z$] rest:[a-zA-Z0-9$]* {
    return {
        type: "value",
        valueType: "literal",
        value: first + rest.join("")
    }
}

number = float / integer

integer = value: [0-9]+ {
    return {
        type: "value",
        valueType: "integer",
        value: parseInt(value)
    }
}

float = integerPortion: [0-9]+ decimalPortion: decimal {
    let valueStr = integerPortion
    if (decimalPortion) {
        valueStr += decimalPortion
    }
    return {
        type: "value",
        valueType: "float",
        value: parseFloat(valueStr)
    }
}

decimal = '.' value: [0-9]* {
    return `.${value.join("")}`
}

boolean = value: ('true' / 'false') {
    return {
        type: "value",
        valueType: "boolean",
        value: value == "true"
    }
}

null = 'null' {
    return {
        type: "value",
        valueType: "null",
        value: "null"
    }
}

string =  singleQuoteString / doubleQuoteString

singleQuoteString = '\'' str: singleQuoteStringChar* '\'' {
    return {
        type: "value",
        valueType: "string",
        value: str.join("")
    }
}

doubleQuoteString = '"' str: doubleQuoteStringChar* '"' {
    return {
        type: "value",
        valueType: "string",
        value: str.join("")
    }
}

doubleQuoteStringChar = !'"' c:. { return c }
singleQuoteStringChar = !'\'' c:. { return c }

_ = [ \t\n\r]*
__ = [ \t\n\r]
newline = __* ('\n'/!.)