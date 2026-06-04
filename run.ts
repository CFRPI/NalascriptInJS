import { readFileSync } from "fs";
import { argv } from "process";

const wasmFilePath = argv[2]

const wasmBuffer = readFileSync(wasmFilePath)

const importObject = {
    console: {
        log(arg: number) {
            console.log(arg)
        },
        logBool(arg: number) {
            console.log(arg == 1)
        }
    }
}

WebAssembly.instantiate(wasmBuffer, importObject).then((result) => {})