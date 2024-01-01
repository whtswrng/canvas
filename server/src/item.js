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
};

function createItem(name, amount = 1) {
  const defaultItem = items[name];
  if (!defaultItem) return null;
  const id = generateUniqueString();
  return {
    ...defaultItem,
    amount,
    id
  };
}

module.exports = {
  createItem,
};
