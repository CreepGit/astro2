import { PrismaClient } from "@prisma/client"
import { simplifiedLCG, simplifiedNthLCG } from "./LCG/LCG"
const prisma = new PrismaClient()

export async function getNextMessageId() {
    const serverValues = await prisma.serverValues.findUnique({
        where: {
            key: "LastMessageID",
        }
    })
    if (!serverValues) {
        throw new Error("'LastMessageID' not found in database")
    }
    const currentMessageId = parseInt(serverValues.value) + 1
    await prisma.serverValues.update({
        where: {
            key: "LastMessageID",
        },
        data: {
            value: (currentMessageId).toString(),
        },
    })

    // Gives random ish number that is then turned into a string
    const hashyMessageId = simplifiedNthLCG(currentMessageId)
    return numToString(hashyMessageId)
}

export function numToString(num: number) {
    const CHARSET = "UK6yLActuMXQDeszV5aYkEiw4pfZJmgPbWN2Gh9qj3nR7vTdFCxH"
    if (CHARSET.length != 52) {
        const length = CHARSET.length
        throw new Error(`CHARSET length is not 52: ${length}`)
    }
    // Length of 5 comes from: LCGs value 52^5 = 380204023
    const charNs = [
        num % CHARSET.length,
        Math.floor(num / CHARSET.length) % CHARSET.length,
        Math.floor(num / CHARSET.length / CHARSET.length) % CHARSET.length,
        Math.floor(num / CHARSET.length / CHARSET.length / CHARSET.length) % CHARSET.length,
        Math.floor(num / CHARSET.length / CHARSET.length / CHARSET.length / CHARSET.length) % CHARSET.length,
    ]
    let str = ""
    for (const charN of charNs) {
        str = CHARSET[charN] + str
    }
    return str
}

export default {
    getNextMessageId,
    simplifiedNthLCG,
    simplifiedLCG,
}


