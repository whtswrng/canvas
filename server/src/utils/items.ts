import {Item} from "../game";
import {generateNumberBetween} from "./between";


export function createCoins(amount: number): Item {
    return {
        amount,
        id: generateNumberBetween(0, 99999999),
        canEquip: false,
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
        name: 'Gold Ore',
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
        name: 'Wood',
        quality: 'COMMON',
        stackable: true,
        type: 'MATERIAL'
    }
}

export function createStick(): Item {
    return {
        amount: 1,
        id: generateNumberBetween(0, 99999999),
        canEquip: true,
        name: 'Stick',
        quality: 'COMMON',
        stackable: false,
        type: 'WEAPON'
    }
}
