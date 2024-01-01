const { createObject } = require("./game-map");
const { map } = require("./globals");

class Material {
  constructor({
    name,
    hp,
    x,
    y,
    respawnInS = 5,
    bg,
    _static,
    dropItem,
    level = 1,
    secondaryClass,
    map,
  }) {
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.x = x;
    this.y = y;
    (this.level = level), (this.respawnInS = respawnInS);
    this.harvested = false;
    this.dropItem = dropItem;
    this.secondaryClass = secondaryClass;
    this.map = map;
  }

  placeMaterial() {
    this.map.placeMaterial(this.x, this.y, this);
  }

  harvest(weapon) {
    console.log('=======================')
    console.log(weapon)
    if (this.secondaryClass && weapon?.secondaryClass !== this.secondaryClass)
      throw new Error(
        `Cannot harvest object without ${this.secondaryClass} weapon.`
      );
    if (this.hp <= 0) {
      this.map.removeMaterial(this.x, this.y);
      this.respawn();
      this.harvested = true;
      return { name: this.dropItem, amount: 1 };
    }

    this.hp -= 10;
  }

  respawn() {
    setTimeout(() => {
      this.placeMaterial();
      this.harvested = false;
      this.hp = this.maxHp;
    }, this.respawnInS * 1000);
  }
}

module.exports = {
  Material,
};
