const { STATE } = require("../entity/entity");
const { createItem } = require("../item");

function createItemOption(entity, item, requirementItems) {
  return {
    type: "item",
    item: item,
    requirements: requirementItems.map((i) => ({
      type: "item",
      fulfilled: entity.hasItems([i]),
      item: i,
    })),
  };
}

class StorageInteraction {
  constructor(storedItems = []) {
    this.storedItems = [];
  }

  generateData(entity) {
    this.data = {
      inventory: entity.inventory.getItems(),
      storedItems: this.storedItems,
      description: "You can store your loot here and we'll keep it safe!",
      action: "storing",
      title: "Storage",
      actionButton: "Proceed",
    };
    return this.data;
  }

  handle(entity, response) {
    console.log("HANDLING____", response);
    const itemsToStore = response.data.itemsToStore;
    const itemsToWithdraw = response.data.itemsToWithdraw;

    const items = entity.inventory.getItems();
    for (const i of items) {
      if (itemsToStore.includes(i.id)) {
        this.storeItem(i);
        entity.inventory.removeItemsById([i.id]);
      }
    }

    for (const i of this.storedItems) {
      if (itemsToWithdraw.includes(i.id)) {
        this.removeItem(i);
        entity.addItem(i);
      }
    }
  }

  storeItem(item) {
    this.storedItems.push(item);
  }

  removeItem(item) {
    const index = this.storedItems.findIndex((i) => i === item);
    this.storedItems.splice(index, 1);
  }
}

module.exports = {
  StorageInteraction,
};
