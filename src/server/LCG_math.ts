export function checkFullPeriod(m: number, a: number, c: number) {
    // Hull-Dobell theorem for composite modulus
    // 1. c and m are relatively prime (already checked above)
    // 2. a-1 is divisible by all prime factors of m
    // 3. If m is divisible by 4, then a-1 must also be divisible by 4
    if (gcd(c, m) !== 1) {
        return {
            success: false,
            message: "gcd(c, m) !== 1",
        };
    }

    if (isPrime(m)) {
        const mMinusOne = m - 1;
        const primeFactorsOfMMinusOne = getAllPrimeFactors(mMinusOne);

        for (const factor of primeFactorsOfMMinusOne) {
            const power = mMinusOne / factor;
            const result = modPow(a, power, m);

            if (result === 1) {
                return {
                    success: false,
                    message: `Not a primitive root (a^((m-1)/${factor}) = 1 mod m)`,
                };
            }
        }

        return {
            success: true,
            message: "Good (primitive root for prime modulus)",
        };
    }

    const primeFactors = getAllPrimeFactors(m);
    for (const factor of primeFactors) {
        if ((a - 1) % factor !== 0) {
            return {
                success: false,
                message: `(a-1) % ${factor} !== 0`,
            };
        }
    }

    if (m % 4 === 0) {
        if ((a - 1) % 4 !== 0) {
            return {
                success: false,
                message: "(a-1) % 4 !== 0",
            };
        }
    }

    return {
        success: true,
        message: "Good (Hull-Dobell theorem)",
    };
}

function gcd(a: number, b: number) {
    // Greatest Common Divisor
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function getAllPrimeFactors(n: number) {
    const factors = new Set<number>();
    let num = n;
    for (let i = 2; i * i <= n; i++) {
        while (num % i === 0) {
            factors.add(i);
            num /= i;
        }
    }
    if (num > 1) {
        factors.add(num);
    }
    return [...factors];
}

function isPrime(n: number) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}

function findPrimeUnder(n: number, howManyPrimesDown?: number) {
    howManyPrimesDown = howManyPrimesDown ?? 1
    n = n - 1;
    while (howManyPrimesDown > 0) {
        n--;
        if (isPrime(n)) {
            howManyPrimesDown--;
        }
        if (n < 0) {
            throw new Error("findPrimeUnder: n < 0")
        }
    }
    return n;
}

// Fast modular exponentiation for large numbers
function modPow(base: number, exponent: number, modulus: number): number {
    if (modulus === 1) return 0;
    let result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        exponent = Math.floor(exponent / 2);
        base = (base * base) % modulus;
    }
    return result;
}


function runLCGToCompletion(m: number, a: number, c: number, x: number) {
    const visitedSet = new Set<number>();
    while (true) {
        x = (a * x + c) % m;
        if (visitedSet.has(x)) {
            return visitedSet.size + 1;
        }
        visitedSet.add(x);
    }
}

function testThis() {
    const summary = {
        success: 0,
        goodSuccess: 0,
        badSuccess: 0,
        goodFail: 0,
        badFail: 0,
    }
    const ITERATIONS = 10_000
    const ANNOUNCE_AT_PERCENT = [
        1,
        2,
        5,
        10,
        20,
        50,
    ]
    let lastAnnouncedPercent = 0
    
    for (let i = 0; i < ITERATIONS; i++) {
        const a = findPrimeUnder(Math.floor(1000 + Math.random() * 100000));
        const c = 1 // Math.floor(Math.random() * 1000000);
        const m = findPrimeUnder(Math.floor(1000 + Math.random() * 1000000));
        const prediction = checkFullPeriod(m, a, c);
        const resultCount = runLCGToCompletion(m, a, c, 0);
        const resultStatus = resultCount == m
        const agree = prediction.success == resultStatus

        const percentIterated = 100 * i / ITERATIONS
        for (const percent of ANNOUNCE_AT_PERCENT) {
            if (percent > lastAnnouncedPercent && percentIterated > lastAnnouncedPercent) {
                console.log(`⏭️ ${percent.toString().padStart(3)}% complete`)
                lastAnnouncedPercent = percent
            }
        }

        if (agree) {
            // const predictedFull = prediction.success ? '✅' : '❌'
            // console.log(`✅ Predicted Correctly (${predictedFull}): m: ${m.toString().padEnd(10)}, a: ${a.toString().padEnd(10)}, c: ${c.toString().padEnd(10)}`)
            summary.success++
            if (prediction.success) {
                summary.goodSuccess++
            } else {
                summary.badSuccess++
            }
        } else {
            const percentage = (resultCount / m * 100).toFixed(1).toString() + '%'
            console.log("")
            console.log(`⚠️ Predicted Incorrectly: m: ${m.toString().padEnd(10)}, a: ${a.toString().padEnd(10)}, c: ${c.toString().padEnd(10)}`)
            console.log(`Prediction: ${prediction.success}, ${prediction.message}`)
            console.log(`Result: ${resultStatus}, ${percentage}`)
            console.log("")
            if (prediction.success) {
                summary.goodFail++
            } else {
                summary.badFail++
            }
        }
    }
    const all = (summary.success == ITERATIONS) ? '✅' : '⚠️'
    const successRate = (summary.success / ITERATIONS * 100).toFixed(1).toString() + '%'
    console.log('--------------------------------')
    console.log(`Success rate: ${all} ${successRate}`)
    const goodRate = (summary.goodSuccess / (summary.goodSuccess + summary.goodFail) * 100).toFixed(1).toString() + '%'
    const badRate = (summary.badSuccess / (summary.badSuccess + summary.badFail) * 100).toFixed(1).toString() + '%'
    console.log(`Good Success: ${summary.goodSuccess}/${summary.goodSuccess + summary.goodFail} (${goodRate})`)
    console.log(`Bad Success: ${summary.badSuccess}/${summary.badSuccess + summary.badFail} (${badRate})`)
}

type StandardResult<T> = {
    success: true,
    value: T,
}|{
    success: false,
    error: string
}

export function findValuesForNearM(mTarget: number): StandardResult<{m: number, a: number, c: number}> {
    if (mTarget < 1000) {
        return {
            success: false,
            error: "You can only find values for larger values"
        }
    }

    let CHECK_VALUES = 10

    // Allow more tries under 1M
    if (mTarget < 1_000_000) {
        CHECK_VALUES = 250
    } else if (mTarget < 1_000_000_000) {
        CHECK_VALUES = 20
    }

    const GOOD_A_VALUES = [
        // Park-Miller (Minimal Standard)
        16807,       // 7^5, used in MINSTD_RAND
        48271,       // Used in MINSTD_RAND0
        // Numerical Recipes recommended values
        1664525,     // Used in Microsoft C/C++ rand()
        1103515245,  // Used in glibc rand()
        // Other well-tested values
        69069,       // Used in Super-Duper
        214013,      // Used in Microsoft Visual C/C++
        22695477,    // From Numerical Recipes
        // Values from L'Ecuyer's tables
        630360016,
        1366,
        30345,
        741103597,
    ] as const

    function getGoodCValue(m: number) {
        // For optimal results, c should be:
        // - Odd (if m is a power of 2)
        // - Relatively prime to m (for any m)
        // - Approximately m/2 or m/φ (where φ is golden ratio) for better distribution
        
        const TRIES = 100
        for (let i = 0; i < TRIES; i++) {
            // From 0.7 to 1.2 of M then halved
            const randomValue = Math.random() * 0.5 + 0.7

            const STRATEGIES = [
                "divier2",
                "divier1.618",
                "low",
                "random"
            ]
            const strategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)]
            
            let c = -1;
            switch (strategy) {
                case "divier2":
                    c = Math.floor(randomValue * m / 2)
                    break;
                case "divier1.618":
                    c = Math.floor(randomValue * m / 1.618)
                    break;
                case "low":
                    c = Math.ceil(randomValue * Math.sqrt(m) / 10)
                    break;
                case "random":
                    c = Math.floor(randomValue * m)
                    break;
            }

            if (c <= 3) {
                c = 1
            } else {
                c = findPrimeUnder(c)
            }
            if (gcd(c, m) === 1) {
                return c
            }
        }

        return 1
    }

    for (let i = 0; i < CHECK_VALUES; i++) {
        const nOfPrimesUnder = Math.ceil(Math.random() * 10)
        const m = findPrimeUnder(mTarget, nOfPrimesUnder)
        const a = GOOD_A_VALUES[Math.floor(Math.random() * GOOD_A_VALUES.length)]
        const c = getGoodCValue(m)

        const result = checkFullPeriod(m, a, c)

        if (result.success) {
            return {
                success: true,
                value: {
                    m,
                    a,
                    c,
                }
            }
        }
    }

    return {
        success: false,
        error: "No values found, try again with different target value"
    }
}
