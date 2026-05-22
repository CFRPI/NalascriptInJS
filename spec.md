# Variables

## types

### integers
i8
i16
i32
i64
i128

u8
u16
u32
u64
u128

### floats
f8
f16
f32
f64
f128

### string
str - a dynamic length string

### boolean
bool - true | false
true & false are u8's 1 & 0 respectively

## syntax

```
let name: type = value
```

# Blocks 

```
for outer = 0; outer < 10; outer++ @outer{
    for inner = -5; inner < 5; inner ++ @inner{
        if inner + outer == 0 {
            continue @outer
        }
    }
}
```

## scope

A variable is by default limited to the block it was introduced in, it can be set manually

```
let withFlag = @outer {
    let i: u8 = 100
    if i < 50 {
        let @outer{false} flag: bool = true
    }
}
```

the line
```
let @outer{false} flag: bool = true
```

this line assigns the variable flag to the "@outer" scope and assigns it to false if this code is never runs as a default value

# Structs

## Block type

```
type Dog = ${
    name: str
    age: u8
    hungry: bool
}
```

```
let nala: Dog = Dog("Nala", 4, true) 
```