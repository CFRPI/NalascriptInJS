import { readFileSync } from "fs"
import { resolve } from "path"
import peggy from "peggy"


const grammar = readFileSync(resolve("./packages/parse/src/nala.peggy")).toString()

export default peggy.generate(grammar);