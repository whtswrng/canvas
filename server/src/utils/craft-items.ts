import {Item} from "../game";
import {createStick} from "./items";

export const craftItems: Array<Item> = [
    createStick(1, {id: 1, requirements: [{amount: 3, itemName: 'Wood'}]}),
];

