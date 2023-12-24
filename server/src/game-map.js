class GameMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.map = this.generateMap();
  }

  generateMap() {
    return Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => ({
        type: 'ground',
        bg: '#964B00',
        occupiedBy: '',
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
    if (
      this.isValidPosition(oldX, oldY) &&
      this.isValidPosition(newX, newY) &&
      this.map[oldY][oldX].occupiedBy !== '' &&
      this.map[newY][newX].occupiedBy === ''
    ) {
      this.map[newY][newX].occupiedBy = this.map[oldY][oldX].occupiedBy;
      this.map[oldY][oldX].occupiedBy = '';
      return true;
    }
    return false;
  }

  removeEntity(x, y) {
    if (this.isValidPosition(x, y) && this.map[y][x].occupiedBy !== '') {
      this.map[y][x].occupiedBy = '';
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
}