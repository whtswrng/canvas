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

    this.connection.addItem({name, amount});
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

    // update db
  }

  _removeItem({ name, amount }) {
    let amountLeft = amount;

    for (const i of this.items) {
      if (i.name === name) {
        if (amountLeft - i.amount > 0) {
          amountLeft -= i.amount;
          this._removeItemById(id);
        } else {
          i.amount -= amountLeft;
        }
      }
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
}

module.exports = {
  Inventory,
};
