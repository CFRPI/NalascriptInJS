import { readFileSync } from "fs";
import { argv } from "process";

const wasmFilePath = argv[2]

const wasmBuffer = readFileSync(wasmFilePath)

const importObject = {
    console: {
        log(arg: number) {
            console.log(arg)
        } 
    }
}

WebAssembly.instantiate(wasmBuffer, importObject).then((result) => {})