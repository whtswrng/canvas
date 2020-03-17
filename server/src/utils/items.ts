import {Item} from "../game";
import {generateNumberBetween} from "./between";

export function createCoins(amount: number): Item {
    return {
        amount,
        id: generateNumberBetween(0, 99999999),
        canEquip: false,
        level: 1,
        name: 'Coins',
        quality: 'COMMON',
        stackable: true,
        type: 'OTHER'
    }
}

export function createGoldOre(amount: number): Item {
    return {
        amount,
        id: generateNumberBetween(0, 99999999),
        canEquip: false,
        level: 1,
        name: 'Gold Ore',
        quality: 'COMMON',
        stackable: true,
        type: 'MATERIAL'
    }
}

export function createSilverOre(amount: number): Item {
    return {
        amount,
        id: generateNumberBetween(0, 99999999),
        canEquip: false,
        name: 'Silver Ore',
        level: 1,
        quality: 'COMMON',
        stackable: true,
        type: 'MATERIAL'
    }
}

export function createBronzeOre(amount: number): Item {
    return {
        amount,
        id: generateNumberBetween(0, 99999999),
        canEquip: false,
        level: 1,
        name: 'Bronze Ore',
        quality: 'COMMON',
        stackable: true,
        type: 'MATERIAL'
    }
}

export function createStone(amount: number): Item {
    return {
        amount,
        id: generateNumberBetween(0, 99999999),
        canEquip: false,
        name: 'Silver Ore',
        level: 1,
        quality: 'COMMON',
        stackable: true,
        type: 'MATERIAL'
    }
}


export function createWood(amount: number): Item {
    return {
        amount,
        id: generateNumberBetween(0, 99999999),
        canEquip: false,
        level: 1,
        name: 'Wood',
        quality: 'COMMON',
        stackable: true,
        type: 'MATERIAL'
    }
}

export function createSmallEnergyDrink(amount: number, data: Partial<Item> = {}): Item {
    return {
        amount,
        id: generateNumberBetween(0, 99999999),
        attributes: {
            energy: 30
        },
        canEquip: false,
        level: 1,
        canUse: true,
        name: 'Small Energy Potion',
        quality: 'COMMON',
        stackable: true,
        type: 'POTION',
        ...data
    }
}

export function createStick(amount: number = 1, data: Partial<Item> = {}): Item {
    return {
        amount,
        level: 1,
        id: generateNumberBetween(0, 99999999),
        attributes: {
            power: 6
        },
        canEquip: true,
        name: 'Stick',
        quality: 'COMMON',
        stackable: false,
        type: 'WEAPON',
        ...data
    }
}
