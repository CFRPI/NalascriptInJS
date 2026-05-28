export function createIndent(level: number): string {
    let res = ""

    for (let i = 0; i < level; i++)
        res += "\t"

    return res
}