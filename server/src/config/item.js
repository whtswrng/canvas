const { generateUniqueString } = require("../utils");

const itemsTo10 = {
  "Worn Mittens": {
    name: "Worn Mittens",
    rarity: "common",
    maxStack: 1,
    equipable: true,
    level: 3,
    description: "Just a pair of tattered mittens",
    type: "hands",
    attrs: { hp: 10, mana: 10, power: 2, defense: 10 },
  },
  "Rusty Tin Can Hat": {
    name: "Rusty Tin Can Hat",
    rarity: "common",
    maxStack: 1,
    equipable: true,
    level: 5,
    description: "A hat made from a rusty tin can with questionable healing properties",
    type: "head",
    attrs: { hp: 15, mana: 20, power: 1, defense: 5 },
  },
  "Threadbare Blanket Robe": {
    name: "Threadbare Blanket Robe",
    rarity: "common",
    maxStack: 1,
    equipable: true,
    level: 4,
    description: "A robe that's seen better days, but it's soothing in its own way",
    type: "armor",
    attrs: { hp: 20, mana: 15, power: 1, defense: 8 },
  },
  "Squeaky Sneakers": {
    name: "Squeaky Sneakers",
    rarity: "common",
    maxStack: 1,
    equipable: true,
    level: 3,
    description: "Lightweight sneakers that emit a suspicious squeak with every step",
    type: "boots",
    attrs: { hp: 5, mana: 10, power: 1, defense: 5 },
  },
  "Slimy Fingerless Gloves": {
    name: "Slimy Fingerless Gloves",
    rarity: "common",
    maxStack: 1,
    equipable: true,
    level: 5,
    description: "Gloves with an oddly slimy texture and a hint of a healing touch",
    type: "hands",
    attrs: { hp: 5, mana: 25, power: 1, defense: 7 },
  },
  "Helm of Mild Discomfort": {
    name: "Helm of Mild Discomfort",
    rarity: "common",
    maxStack: 1,
    equipable: true,
    level: 5,
    description: "A helmet that causes mild discomfort but offers some protection",
    type: "head",
    attrs: { hp: 25, power: 4, defense: 4 },
  },
  "Flimsy Foil Plate": {
    name: "Flimsy Foil Plate",
    rarity: "common",
    maxStack: 1,
    equipable: true,
    level: 8,
    description: "A plate made of flimsy foil, surprisingly formidable in appearance",
    type: "armor",
    attrs: { hp: 30, mana: 0, power: 9, defense: 15 },
  },
  "Clunky Combat Boots": {
    name: "Clunky Combat Boots",
    rarity: "common",
    maxStack: 1,
    equipable: true,
    level: 6,
    description: "Boots that enhance attacking capabilities but feel clunky",
    type: "boots",
    attrs: { hp: 10, power: 6, defense: 8 },
  },
};


const items = {
  ...itemsTo10,
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
  "Common enchant scroll": {
    name: "Common enchant scroll",
    rarity: "common",
    maxStack: 5,
    description: "Just a basic enchant scroll with a 65% chance of success",
    type: "enchant",
    usable: true
  },
  "Common defense potion": {
    name: "Common defense potion",
    rarity: "common",
    maxStack: 20,
    description: "Just a basic potion",
    type: "potion",
    usable: true,
    effect: {
      expireInMinutes: 1,
      attrs: {
        defense: 10
      }
    }
  },
  "Common hp potion": {
    name: "Common hp potion",
    rarity: "common",
    maxStack: 20,
    description: "Just a basic potion",
    type: "potion",
    usable: true,
    effect: {
      expireInMinutes: 0.5,
      attrs: {}
    }
  },
  "Common mana potion": {
    name: "Common mana potion",
    rarity: "common",
    maxStack: 20,
    description: "Just a basic potion",
    type: "potion",
    usable: true,
    effect: {
      expireInMinutes: 1,
      attrs: {}
    }
  },
  "Common power potion": {
    name: "Common power potion",
    rarity: "common",
    maxStack: 20,
    description: "Just a basic potion",
    type: "potion",
    usable: true,
    effect: {
      expireInMinutes: 1,
      attrs: {
        power: 10
      }
    }
  },
  "Oak Log": {
    name: "Oak Log",
    rarity: "common",
    maxStack: 10,
    description: "Just a basic wood",
    type: "material",
  },
  "Hands of Aros": {
    name: "Hands of Aros",
    rarity: "common",
    maxStack: 1,
    equipable: true,
    level: 3,
    description: "Just a basic wood",
    type: "hands",
    attrs: { hp: 10, mana: 10, power: 2, defense: 10 },
  },
  "Simple axe": {
    name: "Simple axe",
    type: "secondary",
    level: 1,
    rarity: "common",
    secondaryClass: "lumberjack",
    equipable: true,
    maxStack: 1,
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
