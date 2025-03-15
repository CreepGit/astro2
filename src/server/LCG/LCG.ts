
export function nthLCGValue(a: number, c: number, m: number, x0: number, n: number): number {
    // For n = 0, return the initial seed
    if (n <= 0) return x0;
    
    // For small n, just iterate to ensure accuracy
    if (n < 20) {
        let x = x0;
        for (let i = 0; i < n; i++) {
            x = (a * x + c) % m;
        }
        return x;
    }
    
    // For larger n, use matrix exponentiation for efficiency
    // This is the mathematical approach that should work for all LCGs
    // [x_{n+1}] = [a c] [x_n]
    // [1     ]   [0 1] [1  ]
    
    // Initialize the matrix
    let matrix = [[a, c], [0, 1]];
    let result = [[1, 0], [0, 1]]; // Identity matrix
    let exponent = n;
    
    // Fast matrix exponentiation
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = multiplyMatrix(result, matrix, m);
        }
        matrix = multiplyMatrix(matrix, matrix, m);
        exponent = Math.floor(exponent / 2);
    }
    
    // Apply the transformation to the initial state [x0, 1]
    return (result[0][0] * x0 + result[0][1]) % m;
}

// Helper function for matrix multiplication with modulo
export function multiplyMatrix(a: number[][], b: number[][], m: number): number[][] {
    const result = [[0, 0], [0, 0]];
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            for (let k = 0; k < 2; k++) {
                result[i][j] = (result[i][j] + a[i][k] * b[k][j]) % m;
            }
        }
    }
    return result;
}

export function* LCG(a: number, c: number, m: number, x0: number) {
    let x = x0
    while (true) {
        x = (a * x + c) % m
        yield x
    }
}

export function simplifiedNthLCG(n: number) {
    const a = 69069
    const m = 380204023
    const c = 1
    const x = 0
    return nthLCGValue(a, c, m, x, n)
}

export function* simplifiedLCG() {
    const a = 69069
    const m = 380204023
    const c = 1
    yield* LCG(a, c, m, 0)
}
