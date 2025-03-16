import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export function stepLCG(a: number, c: number, m: number, x: number) {
    return (a * x + c) % m
}

async function populateServerValuesIfEmpty(type: ModelType) {
    const lastAddedIndex_search = `${type}_LastAddedIndex`
    const lastId_search = `${type}_LastId`
    const a_search = `${type}_lcg_a`
    const m_search = `${type}_lcg_m`
    const c_search = `${type}_lcg_c`
    const x0_search = `${type}_lcg_x0`

    if (await prisma.serverValues.findUnique({
        where: {
            key: lastAddedIndex_search,
        },
    })) {
        // Early return if index exists
        return
    }

    const good_m_value = 380204023
    const good_a_value = 69069
    const good_c_value = 1
    const starting_x_value = Math.floor(Math.random() * good_m_value)

    const set_1 = prisma.serverValues.create({
        data: {
            key: lastAddedIndex_search,
            value: "0",
        },
    })
    const set_2 = prisma.serverValues.create({
        data: {
            key: lastId_search,
            value: "",
        },
    })
    const set_3 = prisma.serverValues.create({
        data: {
            key: a_search,
            value: good_a_value.toString(),
        },
    })
    const set_4 = prisma.serverValues.create({
        data: {
            key: m_search,
            value: good_m_value.toString(),
        },
    })
    const set_5 = prisma.serverValues.create({
        data: {
            key: c_search,
            value: good_c_value.toString(),
        },
    })
    const set_6 = prisma.serverValues.create({
        data: {
            key: x0_search,
            value: starting_x_value.toString(),
        },
    })

    console.log(`Populated server value for ${type}`)
    await Promise.all([set_1, set_2, set_3, set_4, set_5, set_6])
}

populateServerValuesIfEmpty("Message")

export type ModelType = "Message" | "ServerValue" | "User"
export async function getModelRelatedServerValues(type: ModelType) {
    // Find the following: (a value, m value, c value, x0 value, lastAddedIndex, lastId as string)
    // lastAddedIndex approximates the # of model values
    const lastAddedIndex_search = `${type}_LastAddedIndex`
    const lastId_search = `${type}_LastId`
    const a_search = `${type}_lcg_a`
    const m_search = `${type}_lcg_m`
    const c_search = `${type}_lcg_c`
    const x0_search = `${type}_lcg_x0`
    
    const lastAddedIndex = prisma.serverValues.findUnique({
        where: {
            key: lastAddedIndex_search,
        },
    })
    const lastId = prisma.serverValues.findUnique({
        where: {
            key: lastId_search,
        },
    })
    const a = prisma.serverValues.findUnique({
        where: {
            key: a_search,
        },
    })
    const m = prisma.serverValues.findUnique({
        where: {
            key: m_search,
        },
    })
    const c = prisma.serverValues.findUnique({
        where: {
            key: c_search,
        },
    })
    const x0 = prisma.serverValues.findUnique({
        where: {
            key: x0_search,
        },
    })

    const serverValues = await Promise.all([lastAddedIndex, lastId, a, m, c, x0])

    if (serverValues.length != 6) {
        throw new Error(`Expected 6 server values for ${type}, got ${serverValues.length}`)
    }

    return {
        lastAddedIndex: parseInt(serverValues[0]!.value),
        lastId: serverValues[1]!.value,
        a: parseInt(serverValues[2]!.value),
        m: parseInt(serverValues[3]!.value),
        c: parseInt(serverValues[4]!.value),
        x0: parseInt(serverValues[5]!.value),
    }
}

export async function getNextIdForModel(type: ModelType) {
    const serverValues = await getModelRelatedServerValues(type)
    const nextId = stepLCG(serverValues.a, serverValues.c, serverValues.m, serverValues.x0)
    const nextIndex = serverValues.lastAddedIndex + 1
    const update1 = prisma.serverValues.update({
        where: {
            key: `${type}_LastAddedIndex`,
        },
        data: {
            value: nextIndex.toString(),
        },
    })
    const nextIdString = numToString(nextId)
    const update2 = prisma.serverValues.update({
        where: {
            key: `${type}_LastId`,
        },
        data: {
            value: nextIdString,
        },
    })
    const update3 = prisma.serverValues.update({
        where: {
            key: `${type}_lcg_x0`,
        },
        data: {
            value: nextId.toString(),
        },
    })
    await Promise.all([update1, update2, update3])
    return nextIdString
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
