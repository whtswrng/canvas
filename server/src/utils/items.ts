import {Item} from "../game";


export function createCoins(amount: number): Item {
    return {
        amount,
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
        canEquip: false,
        name: 'Wood',
        quality: 'COMMON',
        stackable: true,
        type: 'MATERIAL'
    }
}
