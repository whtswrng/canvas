const { createItem } = require("../item");
const { getRandomInt } = require("../utils");

class Inventory {
  constructor(connection) {
    this.items = [];
    this.connection = connection;
  }

  addItem(_item) {
    const { name, amount } = _item;
    const item = createItem(name, amount);
    if (_item.enchant) {
      item.attrs = { ...item.attrs, ..._item.attrs };
      item.enchant = _item.enchant;
    }
    const existingItem = this.items.find((i) => i.name === item.name && i.amount < item.maxStack);

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

  enchantItem(enchant, item) {
    if (!item.enchant) item.enchant = 0;
    let chance = 55;
    if (enchant.type === "rare") chance = 65;
    if (enchant.type === "epic") chance = 75;

    if (getRandomInt(1, 100) <= chance) {
      item.enchant += 1;
      for (const attr in item.attrs) {
        item.attrs[attr] = Math.round(item.attrs[attr] * 1.05);
      }
      return true;
    } else {
      this.removeItemsById([item.id]);
      return false;
    }
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

  removeItemsById(items) {
    for (const i of items) {
      this._removeItemById(i);
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
