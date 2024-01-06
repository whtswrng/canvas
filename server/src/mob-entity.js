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

const mockConnection = new MockedConnection("", mockedSocket);

class MobEntity extends Entity {
  constructor({
    name,
    kind,
    speed,
    experience,
    autoDefend = true,
    respawnInS,
    drops = [],
    map,
    dropExperience,
    attrs = {
      hp: 10,
      mana: 0,
      defense: 10,
      power: 10,
      hpRegeneration: 20,
      manaRegeneration: 50,
    },
  }) {
    super({
      id: generateUniqueString(),
      name,
      kind,
      speed,
      experience,
      inventory: new Inventory(mockConnection),
      map,
      type: "mob",
      connection: mockConnection,
      attackRange: 1,
      attackSpeed: 1200,
    });
    this.originalHp = attrs.hp;
    this.originalMana = attrs.mana;
    this.guardInterval = null;
    this.respawnInS = respawnInS;
    this.originalX = -1;
    this.originalY = -1;
    this.drops = drops; // {type: 'Varnish', chance: 30, min: 4, max: 8}
    this.autoDefend = autoDefend;
    this.dropExperience = dropExperience;
    this.baseAttrs = attrs;
  }

  generateBaseAttrs() {
    return this.baseAttrs;
  }

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
    console.log("==========+RESPAWN=========");
    this.hp = this.originalHp;
    this.mana = this.originalMana;
    this.x = this.originalX;
    this.y = this.originalY;

    const o = this.map.getObject(this.x, this.y);
    if (o.occupiedBy || o.material) return setTimeout(() => this.spawn(), 4000);

    this.initRegenInterval();
    this.map.placeEntity(this.x, this.y, this);
    this.changeState(STATE.IDLE);
  }
}

module.exports = {
  MobEntity,
};
