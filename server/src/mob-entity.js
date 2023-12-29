const { Connection } = require("./connection");
const { Entity } = require("./entity");
const { map } = require("./globals");
const { getRandomInt, generateUniqueString } = require("./utils");

const mockedSocket = {
  emit: () => null,
};

class MockedConnection extends Connection {
  updateMap() {}
}

const mockConnection = new MockedConnection(mockedSocket);

class MobEntity extends Entity {
  constructor({
    name,
    hp,
    mana,
    kind,
    speed,
    experience,
    defensive = true,
    respawnInS,
    drops = [],
    map,
  }) {
    super({
      id: generateUniqueString(),
      name,
      hp,
      mana,
      kind,
      speed,
      experience,
      map,
      type: "mob",
      connection: mockConnection,
      attackRange: 2,
      castingSpeed: 1000,
    });
    this.originalHp = hp;
    this.originalMana = mana;
    this.guardInterval = null;
    this.respawnInS = respawnInS;
    this.originalX = -1;
    this.originalY = -1;
    this.drops = drops; // {type: 'Varnish', chance: 30, min: 4, max: 8}
    this.defensive = defensive;
  }

  guardArea(range) {
    this.guardInterval = setInterval(() => {
      if (this.isDead()) return;
      if (this.attacking) {
        if (
          this.calculateDistance(
            this.x,
            this.y,
            this.originalX,
            this.originalY
          ) > 14
        ) {
          this.stop();
          this.goToPosition(this.originalX, this.originalY);
        }
      } else {
        if (this.moving) return;
        const target = this.getClosestTarget("player", range);
        if (target) {
          this.attackEnemy(target);
        } else {
          if (
            this.calculateDistance(
              this.x,
              this.y,
              this.originalX,
              this.originalY
            ) > 8
          ) {
            this.goToPosition(this.originalX, this.originalY);
          }
        }
      }
    }, 400);
  }

  die() {
    let drops = super.die();
    for (const o of this.drops) {
      if (getRandomInt(0, 1000) <= o.chance * 10) {
        drops.push({
          type: o.type,
          amount: o.min ? getRandomInt(o.min, o.max) : 1,
        });
      }
    }
    this.respawn();
    return drops;
  }

  respawn() {
    setTimeout(() => {
      console.log("spawning...");
      this.spawn();
    }, this.respawnInS * 1000);
  }

  placeEntity(x, y) {
    this.originalX = x;
    this.originalY = y;
    super.placeEntity(x, y);
  }

  takeDamage(dmg, fromEnemy) {
    super.takeDamage(dmg, fromEnemy);
    if (this.defensive) this.attackEnemy(fromEnemy);
  }

  spawn() {
    this.hp = this.originalHp;
    this.mana = this.originalMana;
    this.x = this.originalX;
    this.y = this.originalY;
    this.map.placeEntity(this.x, this.y, this);
  }
}

module.exports = {
  MobEntity,
};
