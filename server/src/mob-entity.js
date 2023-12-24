const { Entity } = require("./entity");
const { map } = require("./globals");

class MobEntity extends Entity {
  constructor(name, hp, mana, speed, experience) {
    super(name, hp, mana, speed, experience, 'mob')
    this.guardInterval = null;
  }

  guardArea(range) {
    this.originalPosition = { x: this.x, y: this.y };

    this.guardInterval = setInterval(() => {
      if (this.attacking) {
        if(this.calculateDistance(this.x, this.y, this.originalPosition.x, this.originalPosition.y) > 14) {
          this.stop();
          this.goToPosition(this.originalPosition.x, this.originalPosition.y)
        }
      } else {
        if(this.moving) return;
        const target = this.getClosestTarget('player', range)
        if (target) {
          this.attackEnemy(target)
        } else {
          if(this.calculateDistance(this.x, this.y, this.originalPosition.x, this.originalPosition.y) > 8) {
            this.goToPosition(this.originalPosition.x, this.originalPosition.y)
          }
        }
      }
    }, 400);
  }

}

module.exports = {
  MobEntity
};