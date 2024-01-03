const { generateUniqueString } = require("./utils");

const items = {
  Silver: {
    name: "Silver",
    rarity: "common",
    stackable: true,
    maxStack: 999999,
    description: "Ancient coin from the moon",
    type: "coin",
  },
  Varnish: {
    name: "Varnish",
    rarity: "common",
    stackable: true,
    maxStack: 4,
    description: "Ancient material from the sun",
    type: "material",
  },
  "Common defense potion": {
    name: "Common defense potion",
    rarity: "common",
    stackable: true,
    maxStack: 10,
    description: "Just a basic potion",
    type: "material",
    usable: true,
    effect: {
      expireInMinutes: 1,
      attrs: {
        defense: 10
      }
    }
  },
  "Oak Log": {
    name: "Oak Log",
    rarity: "common",
    stackable: true,
    maxStack: 10,
    description: "Just a basic wood",
    type: "material",
  },
  "Hands of Aros": {
    name: "Hands of Aros",
    rarity: "common",
    stackable: true,
    maxStack: 20,
    description: "Just a basic wood",
    type: "material",
    attrs: { hp: 10, mana: 10, power: 2, defense: 10 },
  },
  "Simple axe": {
    name: "Simple axe",
    type: "secondary",
    rarity: "common",
    secondaryClass: "lumberjack",
    stackable: true,
    maxStack: 20,
    description: "Just a basic wood",
  },
};

function createItem(name, amount = 1) {
  const defaultItem = items[name];
  if (!defaultItem) throw new Error(`Item ${name} does not exist!`);
  const id = generateUniqueString();
  return {
    ...defaultItem,
    amount,
    id,
  };
}

module.exports = {
  createItem,
};
