import {Item} from "../game";
import {createSmallEnergyDrink} from "./items";


export const shopItems: Array<Item> = [
    createSmallEnergyDrink(1, {id: 1, requirements: [{amount: 20, itemName: 'Coins'}]}),
];

