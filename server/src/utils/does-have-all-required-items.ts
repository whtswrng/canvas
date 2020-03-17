import {Item} from "../game";

export function doesHaveAllRequiredItems(itemId: number, playerItems: Array<Item>, items: Array<Item>): boolean {
    const item = items.find((i) => i.id === itemId);

    if(item) {
        let count = 0;

        item.requirements.forEach((r) => {
            const itemOnPlayer = playerItems.find((i) => i.name === r.itemName);

            if(itemOnPlayer && itemOnPlayer.amount >= r.amount) {
                count++;
            }
        });

        return count === item.requirements.length;
    }

    return false;
}
