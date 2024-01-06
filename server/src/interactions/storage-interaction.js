const { STATE } = require("../entity/entity");
const { createItem } = require("../item");

class StorageInteraction {
  constructor(storedItems = []) {
    this.storedItems = [];
  }

  generateData(entity) {
    this.data = {
      inventory: entity.inventory.getItems().filter((it) => !it.equiped),
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
    const itemsToStore = response?.data?.itemsToStore ?? [];
    const itemsToWithdraw = response?.data?.itemsToWithdraw ?? [];

    const items = [...entity.inventory.getItems()];
    for (const i of items) {
      if (itemsToStore.includes(i.id)) {
        console.log("storing an item", i.id);
        this.storeItem(entity, i);
        entity.inventory.removeItemsById([i.id]);
      } else {
        console.log(`No item ${i.id}`);
      }
    }

    const storedItems = [...this.storedItems];
    for (const i of storedItems) {
      if (itemsToWithdraw.includes(i.id)) {
        console.log("removing item????????????????????????????????????", i.id);
        this.removeItem(i);
        entity.addItem(i);
      }
    }
  }

  storeItem(entity, item) {
    entity.connection.emitInfo(`Item ${item.name} was put into storage.`);
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
