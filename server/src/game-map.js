const { mapConfiguration } = require("./config/map");
const { app } = require("./globals");
const { Interactable } = require("./interactable");
const { AlchemyInteraction } = require("./interactions/alchemy-interaction");
const { EnchantingInteraction } = require("./interactions/enchanting-interaction");
const { ShopInteraction } = require("./interactions/shop-interaction");
const { SmithingInteraction } = require("./interactions/smithing-interaction");
const { StorageInteraction } = require("./interactions/storage-interaction");
const { getRandomInt } = require("./utils");
const { writeFileSync, appendFileSync, readFileSync } = require("fs");

const buildingTypeToInteractable = {
  smithing: SmithingInteraction,
  alchemy: AlchemyInteraction,
  enchanting: EnchantingInteraction,
  storage: StorageInteraction,
  "magic-shop": ShopInteraction,
};

function saveToJsonFile(data) {
  try {
    const jsonData = JSON.stringify(data, null, 2); // The third argument (2) specifies the number of spaces to use for indentation.
    writeFileSync("./map", jsonData, "utf8");
    console.log("JSON data saved to file successfully.");
  } catch (err) {
    console.error("Error saving JSON data to file:", err.message);
  }
}

class GameMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.map = this.generateMap();
    this.applyPersistedMap();
    this.applyConfiguration();
    // saveToJsonFile(this.map);
    this.cachedMap = {};
    this.cachedPos = {};
  }

  applyPersistedMap() {
    const lines = readFileSync("./new-map", "utf8").split("\n");

    for (const line of lines) {
      try {
        const r = JSON.parse(line);
        console.log(r);
        const o = createObject(r.x, r.y, r.type, r.bg, r.static);
        this.placeObject(r.x, r.y, o);
      } catch (error) {
        console.error(`Error parsing JSON on line: ${line}`, error);
      }
    }

    this.cachedMap = {};
  }

  applyConfig({
    type,
    interactableType,
    name,
    description,
    x,
    y,
    width,
    height,
    thickness,
    objectType,
    _static,
    bgColor,
    scale = 1,
  }) {
    switch (type) {
      case "interactable":
        this.createInteractable(x, y, interactableType, name, description, scale);
        this.applyScale(x, y);
        break;
      case "static":
        this.placeObject(x, y, createObject(x, y, name, bgColor, true, null, scale));
        if (scale > 1) {
          this.applyScale(x, y);
        }
        break;
      case "H":
        this.placeHollowRectangle(x, y, objectType, bgColor, width, height, thickness, _static);
        break;
      case "F":
        this.placeRectangle(x, y, objectType, bgColor, width, height, _static);
        break;
      default:
        // Handle unsupported types or errors
        console.error(`Unsupported type: ${type}`);
    }
  }

  applyConfiguration() {
    mapConfiguration.forEach((c) => {
      this.applyConfig(c);
    });
  }

  painCell({ x, y, name, color, isStatic }) {
    const o = createObject(x, y, name, color, isStatic);
    this.placeObject(x, y, o);
    appendFileSync("./new-map", JSON.stringify(o) + "\n");
    this.cachedMap = {};
  }

  applyScale(x, y) {
    this.makePositionStatic(x - 1, y); // left
    this.makePositionStatic(x + 1, y); // right

    this.makePositionStatic(x, y + 1); // up
    this.makePositionStatic(x, y - 1); // down

    this.makePositionStatic(x - 1, y + 1); // up diag
    this.makePositionStatic(x + 1, y + 1); // up diag

    this.makePositionStatic(x - 1, y - 1); // down diag
    this.makePositionStatic(x + 1, y - 1); // down diag
  }

  placeHollowRectangle(x, y, objectType, bgColor, width, height, thickness, _static) {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (i < thickness || i >= height - thickness || j < thickness || j >= width - thickness) {
          this.placeObject(x + j, y + i, createObject(x + j, y + i, objectType, bgColor, _static, null));
        }
      }
    }
  }

  // No need to use parseInt for x, y, width, height here
  placeRectangle(x, y, objectType, bgColor, width, height, _static) {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        this.placeObject(x + j, y + i, createObject(x + j, y + i, objectType, bgColor, _static, null));
      }
    }
  }

  generateMap() {
    return Array.from({ length: this.height }, (_, h) =>
      Array.from({ length: this.width }, (_, w) => createRandomObject(w, h))
    );
  }

  placeObject(x, y, obj) {
    if (this.isValidPosition(x, y)) {
      this.map[y][x] = obj;
      return true;
    }
    return false;
  }

  placeMaterial(x, y, mat) {
    if (this.isValidPosition(x, y)) {
      this.map[y][x].material = mat;
      return true;
    }
    return false;
  }

  placeInteractable(x, y, obj) {
    if (this.isValidPosition(x, y)) {
      this.map[y][x].interactable = obj;
      return true;
    }
    return false;
  }

  makeStatic(x, y) {
    if (this.isValidPosition(x, y)) {
      this.map[y][x].static = true;
      return true;
    }
    return false;
  }

  getObject(x, y) {
    const o = this.map[y][x];
    return o;
  }

  placeEntity(x, y, entity) {
    if (this.isValidPosition(x, y)) {
      this.map[y][x].occupiedBy = entity;
      return true;
    }
    return false;
  }

  moveEntity(oldX, oldY, newX, newY) {
    if (this.map[newY][newX].static) return false;
    if (
      this.isValidPosition(oldX, oldY) &&
      this.isValidPosition(newX, newY) &&
      !!this.map[oldY][oldX].occupiedBy &&
      !this.map[newY][newX].occupiedBy
    ) {
      this.map[newY][newX].occupiedBy = this.map[oldY][oldX].occupiedBy;
      this.map[oldY][oldX].occupiedBy = "";
      return true;
    }
    return false;
  }

  getEntityMap(player, radius = 6) {
    const playerX = player.x;
    const playerY = player.y;

    const minX = Math.max(0, playerX - radius);
    const maxX = Math.min(this.width - 1, playerX + radius);
    const minY = Math.max(0, playerY - radius);
    const maxY = Math.min(this.height - 1, playerY + radius);

    const playerMap = [];

    for (let y = minY; y <= maxY; y++) {
      const row = [];
      for (let x = minX; x <= maxX; x++) {
        row.push(this.map[y][x]);
      }
      playerMap.push(row);
    }

    return playerMap;
  }

  getEntityMap(player, radius = 6) {
    const playerX = player.x;
    const playerY = player.y;

    const minX = Math.max(0, playerX - radius);
    const maxX = Math.min(this.width - 1, playerX + radius);
    const minY = Math.max(0, playerY - radius);
    const maxY = Math.min(this.height - 1, playerY + radius);

    const playerMap = [];

    for (let y = minY; y <= maxY; y++) {
      const row = [];
      for (let x = minX; x <= maxX; x++) {
        row.push(this.map[y][x]);
      }
      playerMap.push(row);
    }

    return playerMap;
  }

  getEntityStaticMap(player, radius = 6) {
    if (!this.cachedMap[player.id]) {
      this.cachedMap[player.id] = this.getEntityMap(player, radius);
      this.cachedPos[player.id] = [player.x, player.y];
    }

    if (
      Math.abs(this.cachedPos[player.id][0] - player.x) >= 5 ||
      Math.abs(this.cachedPos[player.id][1] - player.y) >= 5
    ) {
      this.cachedMap[player.id] = this.getEntityMap(player, radius);
      this.cachedPos[player.id] = [player.x, player.y];
    }

    return this.cachedMap[player.id];
  }

  makePositionStatic(x, y) {
    this.map[y][x].static = true;
  }

  print(rawMap) {
    for (const row of rawMap) {
      let rowString = "";
      for (const cell of row) {
        rowString += `[${getCell(cell)}] `;
      }
      console.log(rowString);
    }

    function getCell(cell) {
      if (cell.occupiedBy) return "😊";
      if (cell.material) return "🌷";
      return cell.type[0] + " ";
    }
  }

  canMove(x, y) {
    return (
      this.isValidPosition(x, y) &&
      !this.map[y][x].occupiedBy &&
      !this.map[y][x].static &&
      !this.map[y][x].material &&
      !this.map[y][x].interactable
    );
  }

  removeEntity(x, y) {
    if (this.isValidPosition(x, y) && !!this.map[y][x].occupiedBy) {
      this.map[y][x].occupiedBy = null;
      return true;
    }
    return false;
  }

  removeMaterial(x, y) {
    if (this.isValidPosition(x, y) && !!this.map[y][x].material) {
      this.map[y][x].material = null;
      return true;
    }
    return false;
  }

  removeObject(x, y, defaultObj = createObject(x, y)) {
    if (this.isValidPosition(x, y)) {
      this.map[y][x] = defaultObj;
      return true;
    }
    return false;
  }

  isValidPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  createInteractable(x, y, interactableType, name, description = "Foo", scale = 3) {
    this.map[y][x].scale = scale;
    const InteractableConstructor = buildingTypeToInteractable[interactableType];
    const interactable = new Interactable({
      name,
      description,
      x,
      y,
      map: this,
      interaction: new InteractableConstructor(),
    });
    interactable.place();
  }
}

function createRandomObject(x, y) {
  if (getRandomInt(0, 100) <= 70) {
    return createObject(x, y, "grass", "green");
  } else {
    // return createObject(x, y, 'grass', 'green');
    return createObject(x, y);
  }
}

function createObject(x, y, type = "dirt", bg = "#4B5320", _static = false, material = undefined, scale = 1) {
  return {
    x,
    y,
    type,
    scale,
    bg,
    occupiedBy: undefined,
    interactable: undefined,
    static: _static,
    material,
  };
}

module.exports = {
  GameMap,
  createObject,
};
