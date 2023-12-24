class GameMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.map = this.generateMap();
  }

  generateMap() {
    return Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => ({
        type: "ground",
        bg: "#964B00",
        occupiedBy: "",
        items: [],
      }))
    );
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

  getEntityMap(player, radius = 7) {
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
      let rowString = '';
      for (const cell of row) {
        rowString += `[${cell.type[0]}] `;
      }
      console.log(rowString);
    }
  }

  canMove(x, y) {
    return this.isValidPosition(x, y) && !this.map[y][x].occupiedBy && !this.map[y][x].static;
  }

  removeEntity(x, y) {
    if (this.isValidPosition(x, y) && !!this.map[y][x].occupiedBy) {
      this.map[y][x].occupiedBy = null;
      return true;
    }
    return false;
  }

  isValidPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
}

module.exports = {
  GameMap,
};
