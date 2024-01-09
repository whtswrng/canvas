// Define your map configuration

const citySize = 25;

const city = [
  // map
  { type: "F", objectType: "dirt", bgColor: "#a0b099", x: 500, y: 500, width: citySize, height: citySize },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 500, y: 513, width: citySize, height: 4 },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 513, y: 500, width: 4, height: citySize },
  { type: "H", objectType: "rock", _static: true, bgColor: "gray", x: 500, y: 500, width: citySize, height: citySize, thickness: 2 },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 500, y: 513, width: 2, height: 4 },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 523, y: 513, width: 2, height: 4 },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 513, y: 500, width: 4, height: 2 },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 513, y: 523, width: 4, height: 2 },
  { type: "F", objectType: "dirt-road", bgColor: "#a5692a", x: 513, y: 525, width: 4, height: 200 },
  { type: "F", objectType: "dirt-road", bgColor: "#a5692a", x: 200, y: 513, width: 300, height: 4 },
  { type: "F", objectType: "dirt-road", bgColor: "#a5692a", x: 525, y: 513, width: 200, height: 4 },
  { type: "F", objectType: "dirt-road", bgColor: "#a5692a", x: 513, y: 200, width: 4, height: 300 },
  // Additional Buildings
  { type: "static", name: "house", bgColor: "#8B4513", x: 504, y: 504, scale: 3 },
  { type: "static", name: "house", bgColor: "#8B4513", x: 507, y: 511, scale: 3 },
  { type: "static", name: "house", bgColor: "#8B4513", x: 507, y: 518, scale: 3 },
  { type: "static", name: "house", bgColor: "#8B4513", x: 511, y: 504, scale: 3 },
  { type: "static", name: "house", bgColor: "#8B4513", x: 518, y: 504, scale: 3 },
  { type: "static", name: "house", bgColor: "#8B4513", x: 504, y: 511, scale: 3 },
  { type: "static", name: "house", bgColor: "#8B4513", x: 504, y: 518, scale: 3 },
  // interactables
  {
    type: "interactable",
    interactableType: "magic-shop",
    name: "Magic shop",
    description: "Best magic shop in town!",
    x: 510,
    y: 507,
  },
  { type: "interactable", interactableType: "storage", name: "Storage", x: 511, y: 511 },
  { type: "interactable", interactableType: "enchanting", name: "Enchanting", x: 518, y: 511 },
  { type: "interactable", interactableType: "alchemy", name: "Alchemy", x: 511, y: 518 },
  { type: "interactable", interactableType: "smithing", name: "Smithing", x: 518, y: 518 },
];

const mapConfiguration = [...city];

module.exports = {
  mapConfiguration,
};
