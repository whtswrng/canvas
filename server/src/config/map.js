// Define your map configuration

const citySize = 25;

const border = [
  {
    type: "H",
    objectType: "rock",
    _static: true,
    bgColor: "gray",
    x: 90,
    y: 90,
    width: 890,
    height: 890,
    thickness: 8,
  },
];

const city = [
  // map
  { type: "F", objectType: "dirt", bgColor: "#a0b099", x: 500, y: 500, width: citySize, height: citySize },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 500, y: 513, width: citySize, height: 4 },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 513, y: 500, width: 4, height: citySize },
  {
    type: "H",
    objectType: "rock",
    _static: true,
    bgColor: "gray",
    x: 500,
    y: 500,
    width: citySize,
    height: citySize,
    thickness: 2,
  },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 500, y: 513, width: 2, height: 4 },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 523, y: 513, width: 2, height: 4 },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 513, y: 500, width: 4, height: 2 },
  { type: "F", objectType: "cobblestone", bgColor: "#a0b099", x: 513, y: 523, width: 4, height: 2 },
  // road
  { type: "F", objectType: "dirt-road", bgColor: "#a5692a", x: 513, y: 525, width: 4, height: 200 },
  { type: "F", objectType: "dirt-road", bgColor: "#a5692a", x: 200, y: 513, width: 300, height: 4 },
  // { type: "F", objectType: "dirt-road", bgColor: "#a5692a", x: 525, y: 513, width: 200, height: 4 },
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

const grassLand = [
  // rocks
  { type: "F", objectType: "rock", _static: true, bgColor: "gray", x: 534, y: 514, width: 390, height: 3 },
];

const forest = [];

const swamp = [
  { type: "F", objectType: "foggy-gray", bgColor: "#999999", x: 300, y: 550, width: 160, height: 380 },
  { type: "F", objectType: "muddy-brown", bgColor: "#8B4513", x: 350, y: 600, width: 100, height: 290 },
  { type: "F", objectType: "mossy-green", bgColor: "#8A9A5B", x: 400, y: 650, width: 50, height: 180 },
];

const mountainRange = [
  { type: "F", objectType: "rocky-peaks", bgColor: "#A9A9A9", x: 110, y: 530, width: 190, height: 90 },
  { type: "F", objectType: "sloping-terrain", bgColor: "#8B8B83", x: 110, y: 620, width: 190, height: 150 },
  { type: "F", objectType: "mossy-terraces", bgColor: "#556B2F", x: 110, y: 770, width: 190, height: 70 },
  { type: "F", objectType: "heather-fields", bgColor: "#9966CC", x: 110, y: 840, width: 190, height: 50 },
  { type: "F", objectType: "rocky-slopes", bgColor: "#A09E8A", x: 110, y: 890, width: 190, height: 90 },
];

const desert = [
  { type: "F", objectType: "sand-dunes", bgColor: "#F4E3CB", x: 98, y: 98, width: 450, height: 450 },
  { type: "F", objectType: "rocky-outcrops", bgColor: "#D2B48C", x: 98, y: 98, width: 150, height: 150 },
  { type: "F", objectType: "barren-lands", bgColor: "#C0C0C0", x: 98, y: 248, width: 150, height: 150 },
  { type: "F", objectType: "rolling-dunes", bgColor: "#E0CDA3", x: 248, y: 98, width: 150, height: 150 },
  { type: "F", objectType: "arid-plains", bgColor: "#DEB887", x: 248, y: 248, width: 200, height: 200 },
];

const beachCoast = [
  { type: "F", objectType: "sandy-beach", bgColor: "#FDDCA5", x: 98, y: 98, width: 100, height: 50 },
  { type: "F", objectType: "gentle-waves", bgColor: "#87CEEB", x: 98, y: 148, width: 100, height: 50 },
  { type: "F", objectType: "shallow-waters", bgColor: "#ADD8E6", x: 98, y: 198, width: 100, height: 50 },
];

const snow = [
  { type: "F", objectType: "snow", bgColor: "#FFFAFA", x: 533, y: 90, width: 370, height: 414 },
  { type: "F", objectType: "snow", bgColor: "#FFFAFA", x: 533, y: 504, width: 370, height: 10 },
  { type: "F", objectType: "dirty-snow", bgColor: "#e6e6e6", x: 517, y: 90, width: 20, height: 400 },
  { type: "F", objectType: "snowy-terrain", bgColor: "#F0F8FF", x: 600, y: 130, width: 200, height: 200 },
  { type: "F", objectType: "snowfall", bgColor: "#FFFFFF", x: 600, y: 130, width: 200, height: 200 },
  { type: "F", objectType: "snowy-rocks", bgColor: "#D3D3D3", x: 600, y: 280, width: 100, height: 50 },
  { type: "F", objectType: "snowy-rocks", bgColor: "#D3D3D3", x: 700, y: 280, width: 100, height: 50 },
];

const ancientForest = [
    { type: "F", objectType: "ancient-grass", bgColor: "#2E8B57", x: 460, y: 99, width: 200, height: 400 },
    // Ancient Stones
    { type: "F", objectType: "ancient-stones", bgColor: "#A9A9A9", x: 480, y: 140, width: 30, height: 30 },
    { type: "F", objectType: "ancient-stones", bgColor: "#A9A9A9", x: 510, y: 160, width: 20, height: 20 },
    { type: "F", objectType: "ancient-stones", bgColor: "#A9A9A9", x: 480, y: 190, width: 25, height: 25 },
  
    // Enchanted Clearing
    { type: "F", objectType: "enchanted-clearing", bgColor: "#87CEEB", x: 470, y: 250, width: 40, height: 40 },
  
    // Hidden Path
    { type: "F", objectType: "hidden-path", bgColor: "#DEB887", x: 490, y: 280, width: 150, height: 10 },
    { type: "F", objectType: "hidden-path", bgColor: "#DEB887", x: 490, y: 290, width: 150, height: 10 },
    { type: "F", objectType: "hidden-path", bgColor: "#DEB887", x: 490, y: 300, width: 150, height: 10 },
  
    // Mystic Glade
    { type: "F", objectType: "mystic-glade", bgColor: "#228B22", x: 520, y: 200, width: 30, height: 40 },
    { type: "F", objectType: "mystic-glade", bgColor: "#228B22", x: 480, y: 220, width: 30, height: 40 },
    { type: "F", objectType: "mystic-glade", bgColor: "#228B22", x: 510, y: 240, width: 30, height: 40 },
];

const mapConfiguration = [
  ...city,
  ...grassLand,
  ...forest,
  ...swamp,
  ...mountainRange,
  ...desert,
  ...beachCoast,
  ...snow,
  ...ancientForest,
  ...border,
];

module.exports = {
  mapConfiguration,
};
