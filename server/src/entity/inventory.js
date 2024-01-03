const { createItem } = require("../item");

class Inventory {
  constructor(connection) {
    this.items = [];
    this.connection = connection;
  }

  addItem({ name, amount = 1 }) {
    const item = createItem(name, amount);
    const existingItem = this.items.find(
      (i) => i.name === item.name && i.amount < item.maxStack
    );

    if (existingItem) {
      existingItem.amount += item.amount;

      if (existingItem.amount > item.maxStack) {
        const overflowAmount = existingItem.amount - item.maxStack;
        existingItem.amount = item.maxStack;
        this.addItem({ ...item, amount: overflowAmount });
      }
    } else {
      this.items.push({ ...item });
    }

    this.connection.addItem({ name, amount });
    this.connection.updateInventory(this.getItems());
  }

  hasItems(items) {
    for (const i of items) {
      if (!this.hasItem(i)) return false;
    }
    return true;
  }

  hasItem({ name, amount }) {
    let acum = 0;
    for (const i of this.items) {
      if (i.name === name) acum += i.amount;
    }
    return acum >= amount;
  }

  removeItems(items) {
    for (const i of items) {
      this._removeItem(i);
    }

    this.connection.updateInventory(this.getItems());
  }

  _removeItem({ name, amount }) {
    let amountLeft = amount;
    const itemsToRemove = [];

    for (const i of this.items) {
      if (i.name === name) {
        if (amountLeft - i.amount >= 0) {
          amountLeft -= i.amount;
          itemsToRemove.push(i.id);
        } else {
          i.amount -= amountLeft;
        }
      }
    }
    for (const id of itemsToRemove) {
      this._removeItemById(id);
    }
  }

  _removeItemById(id) {
    const index = this.items.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  getItems() {
    return this.items;
  }

  getItemById(id) {
    return this.items.find((i) => i.id === id);
  }

  getItemByName(name) {
    return this.items.find((i) => i.name === name);
  }
}

module.exports = {
  Inventory,
};
