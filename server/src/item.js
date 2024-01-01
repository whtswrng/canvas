const { generateUniqueString } = require("./utils");

const items = {
  Varnish: {
    name: "Varnish",
    rarity: "common",
    stackable: true,
    maxStack: 4,
    description: "Ancient material from the sun",
    type: "material",
  },
  "Oak Log": {
    name: "Oak Log",
    rarity: "common",
    stackable: true,
    maxStack: 20,
    description: "Just a basic wood",
    type: "material",
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
