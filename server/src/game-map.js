const { getRandomInt } = require("./utils");

class GameMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.map = this.generateMap();
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
}

function createRandomObject(x, y) {
  if (getRandomInt(0, 100) <= 70) {
    return createObject(x, y, "grass", "green");
  } else {
    // return createObject(x, y, 'grass', 'green');
    return createObject(x, y);
  }
}

function createObject(
  x,
  y,
  type = "dirt",
  bg = "#4B5320",
  _static = false,
  material = null
) {
  return {
    x,
    y,
    type,
    bg,
    occupiedBy: null,
    interactable: null,
    static: _static,
    material,
    items: [],
  };
}

module.exports = {
  GameMap,
  createObject,
};
