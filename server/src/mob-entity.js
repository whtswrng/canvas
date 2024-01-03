const { Connection } = require("./connection");
const { Entity, STATE } = require("./entity/entity");
const { Inventory } = require("./entity/inventory");
const { getRandomInt, generateUniqueString } = require("./utils");

const mockedSocket = {
  emit: () => null,
};

class MockedConnection extends Connection {
  updateMap() {}
}

const mockConnection = new MockedConnection('', mockedSocket);

class MobEntity extends Entity {
  constructor({
    name,
    hp,
    mana,
    kind,
    speed,
    experience,
    autoDefend = true,
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
      inventory: new Inventory(),
      map,
      type: "mob",
      connection: mockConnection,
      attackRange: 1,
      attackSpeed: 1200,
    });
    this.originalHp = hp;
    this.originalMana = mana;
    this.guardInterval = null;
    this.respawnInS = respawnInS;
    this.originalX = -1;
    this.originalY = -1;
    this.drops = drops; // {type: 'Varnish', chance: 30, min: 4, max: 8}
    this.autoDefend = autoDefend;
  }

  // guardArea(range) {
  //   this.guardInterval = setInterval(() => {
  //     if (this.isDead()) return;
  //     if (this.attacking) {
  //       if (
  //         this.calculateDistance(
  //           this.x,
  //           this.y,
  //           this.originalX,
  //           this.originalY
  //         ) > 14
  //       ) {
  //         this.stop();
  //         this.goToPosition(this.originalX, this.originalY);
  //       }
  //     } else {
  //       if (this.moving) return;
  //       const target = this.getClosestTarget("player", range);
  //       if (target) {
  //         this.attackEnemy(target);
  //       } else {
  //         if (
  //           this.calculateDistance(
  //             this.x,
  //             this.y,
  //             this.originalX,
  //             this.originalY
  //           ) > 8
  //         ) {
  //           this.goToPosition(this.originalX, this.originalY);
  //         }
  //       }
  //     }
  //   }, 400);
  // }

  die() {
    let drops = super.die();
    for (const o of this.drops) {
      if (getRandomInt(0, 1000) <= o.chance * 10) {
        drops.push({
          name: o.name,
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

  spawn() {
    console.log('==========+RESPAWN=========');
    this.hp = this.originalHp;
    this.mana = this.originalMana;
    this.x = this.originalX;
    this.y = this.originalY;

    const o = this.map.getObject(this.x, this.y);
    if(o.occupiedBy || o.material) return setTimeout(() => this.spawn(), 4000);

    this.map.placeEntity(this.x, this.y, this);
    this.changeState(STATE.IDLE);
  }
}

module.exports = {
  MobEntity,
};
