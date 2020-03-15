import {Drop, Item} from "../game";
import {generateNumberBetween} from "./between";

export function generateItemsFromDropList(dropList: Array<Drop>): Array<Item> {
    const items: Array<Item> = [];

    dropList.forEach((d) => {
        const number = generateNumberBetween(0, 1000);
        if(number <= d.dropChance) {
            items.push({...d.item});
        }
       d.dropChance
    });

    return items;
}