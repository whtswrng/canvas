const { Entity } = require("./entity");
const { map } = require("./globals");
const { getRandomInt } = require("./utils");

class MobEntity extends Entity {
  constructor(name, hp, mana, speed, experience, respawnInS, drops = []) {
    super(name, hp, mana, speed, experience, 'mob')
    this.originalHp = hp;
    this.originalMana = mana;
    this.guardInterval = null;
    this.respawnInS = respawnInS;
    this.originalX = -1
    this.originalY = -1;
    this.drops = drops // {type: 'Varnish', chance: 30, min: 4, max: 8}
  }

  guardArea(range) {
    this.guardInterval = setInterval(() => {
      if (this.isDead()) return;
      if (this.attacking) {
        if (this.calculateDistance(this.x, this.y, this.originalX, this.originalY) > 14) {
          this.stop();
          this.goToPosition(this.originalX, this.originalY)
        }
      } else {
        if (this.moving) return;
        const target = this.getClosestTarget('player', range)
        if (target) {
          this.attackEnemy(target)
        } else {
          if (this.calculateDistance(this.x, this.y, this.originalX, this.originalY) > 8) {
            this.goToPosition(this.originalX, this.originalY)
          }
        }
      }
    }, 400);
  }

  die() {
    let drops = super.die()
    for (const o of this.drops) {
      if (getRandomInt(0, 1000) <= (o.chance * 10)) {
        drops.push({
          type: o.type,
          amount: o.min ? getRandomInt(o.min, o.max) : 1
        })
      }
    }
    this.respawn()
    return drops;
  }

  respawn() {
    setTimeout(() => {
      console.log('spawning...')
      this.spawn()
    }, this.respawnInS * 1000)
  }

  placeEntity(x, y) {
    this.originalX = x;
    this.originalY = y;
    super.placeEntity(x, y)
  }

  spawn() {
    this.hp = this.originalHp;
    this.mana = this.originalMana;
    this.x = this.originalX;
    this.y = this.originalY;
    map.placeEntity(this.x, this.y, this);
  }

}

module.exports = {
  MobEntity
};