import { readFileSync } from "fs"
import { resolve } from "path"
import peggy from "peggy"


const grammar = readFileSync(resolve("./packages/parse/src/nala.peggy")).toString()

export const parser = peggy.generate(grammar)