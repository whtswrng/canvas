const { map } = require("../globals");
const { Interactable } = require("../interactable");
const { createItem } = require("../item");
const { getRandomInt, generateUniqueString, calculatePercentage } = require("../utils");

const MAP_REFRESH_RATE_IN_MS = 120;
const REGEN_INTERVAL = 2000;
const HEALING_SPELL_COOLDOWN = 500;
const HEALING_SPELL_MANA_COST = 20;
const MAGE_SPELL_MANA_COST = 5;
const TANK_SPELL_MANA_COST = 0;

const STATE = {
  ATTACKING: "ATTACKING",
  IDLE: "IDLE",
  GATHERING: "GATHERING",
  MOVING: "MOVING",
  DEATH: "DEATH",
  INTERACTING: "INTERACTING",
};

class Entity {
  constructor({
    id,
    name,
    speed,
    kind,
    experience,
    type = "player",
    inventory,
    attackRange = 1,
    attackSpeed = 1200,
    map,
    connection,
    autoDefend = false,
  }) {
    this.user = undefined; // will be filled later
    this.changeStateCb = null;
    this.id = id;
    this.name = name;
    this.type = type;
    this.kind = kind; // rat, light-mage, ...
    this.connection = connection;
    this.autoDefend = autoDefend;
    this.experience = experience;
    this.experience = 33;
    this.interactableObject = null;
    this.secondaryClass = this.generateSecondaryClass();
    this.equiped = {
      weapon: null,
      secondary: null,
      head: null,
      armor: null,
      hands: null,
      boots: null,
    };
    this.effects = [];
    this.inventory = inventory;
    this.speed = speed;
    this.moving = false;
    this.movingTimeout = null;
    this.harvestingInterval = null;
    this.attacking = false;
    this.attackingInterval = null;
    this.targetLocation = null;
    this.target = null;
    this.attackRange = attackRange;
    this.attackSpeed = attackSpeed;
    this.updateMovementCb = null;
    this.state = "IDLE";
    // map
    this.map = map;
    this.x = 0;
    this.y = 0;

    this.movementSpeed = 700;
    this.movingIsBlocked = false;

    this.healingTimeout = null;
    this.startEmitMap();
    this.equipItemsInInventory();
  }

  generateSecondaryClass() {
    if (this.kind === "healer")
      return {
        name: "alchemy",
        level: 0,
        maxLevel: 350,
      };
    if (this.kind === "mage")
      return {
        name: "enchanting",
        level: 0,
        maxLevel: 350,
      };
    if (this.kind === "tank")
      return {
        name: "armorsmith",
        level: 0,
        maxLevel: 350,
      };
  }

  generateBaseAttrs() {
    if (this.kind === "healer")
      return {
        hp: 200,
        hpRegeneration: 5,
        mana: 200,
        manaRegeneration: 10,
        defense: 6,
        power: 20,
        critChance: 5,
      };
    if (this.kind === "mage")
      return {
        hp: 200,
        hpRegeneration: 5,
        mana: 200,
        manaRegeneration: 5,
        defense: 25,
        power: 50,
        critChance: 5,
      };
    if (this.kind === "tank")
      return {
        hp: 400,
        hpRegeneration: 10,
        mana: 0,
        manaRegeneration: 5,
        defense: 100,
        power: 25,
        critChance: 5,
      };
  }

  init() {
    // base attrs
    this.baseAttrs = this.generateBaseAttrs();

    const attrs = this.getAttrs();
    this.hp = attrs.hp;
    this.mana = attrs.mana;

    this.initRegenInterval();
    if (this.kind === "healer") {
      this.initHealing();
    }
    this.connection.entityInit(this);
  }

  initHealing() {
    const heal = () => {
      if (!this.isDead()) {
        const players = this.user.getPlayers();
        for (const p of players) {
          const attrs = p.getAttrs();
          if (calculatePercentage(p.hp, attrs.hp) <= 80) {
            if (this.calculateDistance(this.x, this.y, p.x, p.y) < 7) {
              this.heal(p);
              break;
            }
          }
        }
      }
      this.healingTimeout = setTimeout(() => heal(), this.attackSpeed + HEALING_SPELL_COOLDOWN);
    };
    heal();
  }

  increaseSecondaryClassLvl() {
    this.secondaryClass.level += 1;
    this.emitAttributes();
    this.connection.emitInfo(`Your ${this.secondaryClass.name} lvl was increased by 1`);
  }

  registerMovementCb(cb) {
    this.updateMovementCb = cb;
  }

  handOverItems(player, items) {
    if (this.calculateDistance(this.x, this.y, player.x, player.y) > 2) return;
    for (const id of items) {
      const item = this.inventory.getItemById(id);
      if (item) {
        player.addItem(item);
      }
    }
    this.inventory.removeItemsById(items);
  }

  applyItemEffect(item) {
    const i = this.effects.findIndex((e) => e.name === item.name);
    if (i !== -1) return false; // not going to apply same effect

    this.effects.push({
      type: "item",
      name: item.name,
      attrs: item.effect.attrs,
      expireInMinutes: item.effect.expireInMinutes,
    });

    setTimeout(() => {
      const i = this.effects.findIndex((e) => e.name === item.name);
      if (i !== -1) {
        this.effects.splice(i);
      }
      this.connection.updateEffects(this.effects);
      this.emitAttributes();
    }, item.effect.expireInMinutes * 60000);

    this.connection.updateEffects(this.effects);
    this.emitAttributes();

    return true;
  }

  emitAttributes() {
    this.connection.attributesUpdated(this.getAttrs());
  }

  useItem(itemId) {
    const item = this.inventory.getItemById(itemId);
    if (!item || !item.usable) return;

    if (this.applyItemEffect(item)) {
      this.removeItems([{ name: item.name, amount: 1 }]);
    }
  }

  useItemByName(itemName) {
    const item = this.inventory.getItemByName(itemName);
    this.useItem(item.id);
  }

  initRegenInterval() {
    this.regenInterval = setInterval(() => {
      if ([STATE.IDLE, STATE.MOVING].includes(this.state)) this.regenerate();
    }, REGEN_INTERVAL);
  }

  regenerate() {
    const attrs = this.getAttrs();

    const hpRegen = Math.round(attrs.hpRegeneration / 4);
    const manaRegen = Math.round(attrs.manaRegeneration / 4);

    this.hp += hpRegen;
    this.mana += manaRegen;

    if (this.hp > attrs.hp) {
      this.hp = attrs.hp;
    }

    if (this.mana > attrs.mana) {
      this.mana = attrs.mana;
    }

    // Update the client or perform any other necessary actions
    this.emitBasicAttrsUpdated();
  }

  startEmitMap() {
    setInterval(() => {
      this.connection.updateMap(this.map.getEntityMap(this));
    }, MAP_REFRESH_RATE_IN_MS);
  }

  // equipItemsInInventory() {
  //   console.log("hehe");
  //   for (const o of this.inventory) {
  //     if (o.equiped) {
  //       this.equip(o);
  //     }
  //   }
  //   this.connection.updateInventory(this.id, this.inventory);
  // }

  followPlayer(name) {
    const p = this.user.getPlayerByName(name);
    if (p) this.goToPosition(p.x, p.y);
  }

  attackFriendlyTarget(name) {
    const p = this.user.getPlayerByName(name);
    const target = p?.target;
    if (!target) return;
    this.attackEnemy(target);
  }

  getAttrs() {
    const attrs = {
      ...this.baseAttrs,
      level: this.getLevel(),
      levelPercentage: this.getLevelPercentage(),
      secondaryClass: this.secondaryClass,
    };
    // items
    for (const item of this.inventory.getItems()) {
      if (item.attrs && item.equiped) {
        for (const attr in item.attrs) {
          attrs[attr] = attrs[attr] === undefined ? item.attrs[attr] : attrs[attr] + item.attrs[attr];
        }
      }
    }
    for (const effect of this.effects) {
      if (effect.attrs) {
        for (const key in effect.attrs) {
          attrs[key] += effect.attrs[key];
        }
      }
    }
    // effects
    return attrs;
  }

  equip(item) {
    if (!item?.equipable) return;
    if (this.state !== STATE.IDLE) return;

    const previouslyEquiped = item.equiped;

    const equipedItem = this.equiped[item.type];
    if (equipedItem) {
      equipedItem.equiped = false;
      this.equiped[item.type] = null;
    }

    item.equiped = previouslyEquiped !== undefined ? !previouslyEquiped : true;

    if (item.equiped) this.equiped[item.type] = item;

    const attrs = this.getAttrs();

    this.connection.equipedItemsUpdated(this.equiped);
    this.connection.updateInventory(this.inventory.getItems());
    this.connection.attributesUpdated(attrs);
  }

  equipItemsInInventory() {
    for (const item of this.inventory.getItems()) {
      if (item.equiped) {
        this.equip(item);
      }
    }
    this.connection.updateInventory(this.inventory.getItems());
  }

  addItem(item) {
    this.inventory.addItem(item);
  }

  equipByName(itemName) {
    const i = this.inventory.getItemByName(itemName);
    if (i) this.equip(i);
  }

  equipById(itemId) {
    const i = this.inventory.getItemById(itemId);
    if (i) this.equip(i);
  }

  hasItems(items) {
    return this.inventory.hasItems(items);
  }

  removeItems(items) {
    console.log("removing items", items);
    this.inventory.removeItems(items);
  }

  getDirectionsToTarget(targetX, targetY) {
    const directionX = targetX > this.x ? 1 : targetX < this.x ? -1 : 0;
    const directionY = targetY > this.y ? 1 : targetY < this.y ? -1 : 0;

    const nextPosition = [this.x + directionX, this.y + directionY];

    // Check if the next position is blocked
    if (!this.map.canMove(nextPosition[0], nextPosition[1])) {
      // Check if the target is within 1 unit distance
      if (this.calculateDistance(this.x, this.y, targetX, targetY) <= 1) {
        console.log("Already close to the target");
        return [0, 0];
      }

      if (this.map.canMove(this.x + directionX, this.y + directionX)) {
        return [directionX, directionX];
      }

      if (this.map.canMove(this.x + directionY, this.y + directionY)) {
        return [directionY, directionY];
      }

      // Try moving along the X-axis
      if (this.map.canMove(this.x + directionX, this.y)) {
        return [directionX, 0];
      }

      // Try moving along the Y-axis
      if (this.map.canMove(this.x, this.y + directionY)) {
        return [0, directionY];
      }

      // If both X and Y are blocked, try diagonal movement
      if (this.map.canMove(this.x + directionX, this.y + directionY)) {
        return [directionX, directionY];
      }

      console.log("Cannot move in any direction");
    }

    return [directionX, directionY];
  }

  goToPosition(targetX, targetY, movedCb) {
    return new Promise((res) => {
      this.targetLocation = [targetX, targetY];
      this.stopMovement();
      this.move(res, movedCb);
    });
  }

  emitError(message) {
    this.connection.emitError(message);
  }

  async gather(x, y) {
    const handleAttack = () => {
      clearInterval(this.harvestingInterval);
      this.harvestingInterval = setInterval(() => {
        const material = this.map.getObject(x, y)?.material;
        if (!material || material.harvested || this.isDead()) {
          return stop();
        }
        if (this.isInRange(material)) {
          try {
            const drop = material.harvest(this.equiped.secondary);
            if (drop) {
              this.addItem(drop);
              return stop();
            }
          } catch (e) {
            this.connection.emitError(e.message);
            return stop();
          }
        } else {
          const { x, y } = material;
          this.goToPosition(x, y);
        }
      }, 1000);
    };

    const stop = () => {
      this.target = null;
      clearInterval(this.harvestingInterval);
      this.stopAll();
    };

    this.changeState(STATE.GATHERING);

    handleAttack();
  }

  async interact(x, y) {
    const obj = this.map.getObject(x, y)?.interactable;
    if (!obj || this.isDead()) {
      return stop();
    }
    if (this.isInRange(obj)) {
      this.interactableObject = obj;
      obj.interact(this);
    } else {
      const { x, y } = obj;
      this.goToPosition(x, y);
    }

    const stop = () => {
      this.target = null;
      this.stopAll();
    };

    this.changeState(STATE.INTERACTING);
  }

  changeState(state) {
    console.log("calling change state", state);
    if (this.state === STATE.INTERACTING) {
      this.interactableObject?.stopInteracting?.(this);
      this.interactableObject = null;
    }
    this.state = state;
    this.connection.changeState(state);
    this.changeStateCb?.(state);
  }

  registerStateCb(cb) {
    this.changeStateCb = cb;
  }

  calculateAttackSpeed() {
    return this.attackSpeed;
  }

  async attackEnemy(enemy) {
    const handleAttack = () => {
      clearInterval(this.attackingInterval);
      this.attackingInterval = setInterval(() => {
        if (enemy.isDead() || this.isDead()) {
          return stop();
        }
        if (!this.attacking) {
          return stop();
        }
        console.log(this.name, this.isEnemyInRange(enemy));
        if (this.isEnemyInRange(enemy)) {
          this.hitEnemy(enemy);
        } else {
          const { x, y } = enemy;
          this.goToPosition(x, y);
        }
      }, this.calculateAttackSpeed());
    };

    const stop = () => {
      this.target = null;
      clearInterval(this.attackingInterval);
      this.stopAll();
    };

    this.attacking = true;
    const { x, y } = enemy;

    this.target = enemy;
    this.changeState(STATE.ATTACKING);
    this.connection.attackEnemy(enemy);
    enemy.attackInitiated(this);

    handleAttack();
  }

  attackInitiated(from) {
    // emit some event
  }

  isEnemyInRange(enemy, addition = 0) {
    return Math.floor(this.calculateDistance(this.x, this.y, enemy.x, enemy.y)) <= this.attackRange + addition;
  }

  isInRange(enemy) {
    if (enemy instanceof Interactable) {
      return Math.floor(this.calculateDistance(this.x, this.y, enemy.x, enemy.y)) <= 2;
    }
    return Math.floor(this.calculateDistance(this.x, this.y, enemy.x, enemy.y)) <= 1;
  }

  hitEnemy(enemy) {
    if (enemy.isDead() || this.isDead()) return;

    let manaCost = this.kind === "mage" ? MAGE_SPELL_MANA_COST : TANK_SPELL_MANA_COST;
    if (this.type === "mob") manaCost = 0;

    if (this.mana - manaCost < 0) return;

    console.log("dealing dmg -> ", this.name, enemy.name);
    this.stopMovement();
    // Calculate damage considering crit chance, power, and defense
    const attrs = this.getAttrs();
    const critRoll = Math.random() * 100; // Roll for critical chance
    const isCrit = critRoll <= attrs.critChance / 2.5;

    // Calculate damage
    let damage = getRandomInt(Math.floor(attrs.power / 1.05), Math.floor(attrs.power * 1.05));

    if (isCrit) {
      // Apply critical damage multiplier (you can adjust this multiplier)
      damage = damage * 1.5;
    }

    this.mana -= manaCost;

    if (this.mana < 0) this.mana = 0;
    this.emitBasicAttrsUpdated();

    // Apply defense reduction
    damage -= enemy.getAttrs().defense;
    // Ensure damage is non-negative
    damage = Math.max(3, damage);

    const drops = enemy.takeDamage(damage, this);
    this.connection.enemyHit(damage, this, enemy);
    if (enemy.isDead()) {
      this.gainExperience(enemy.dropExperience || 1); // TODO exp
      this.connection.enemyDied(enemy);
    }
    if (drops) {
      for (const d of drops) {
        this.addItem(d);
      }
    }
  }

  isInFrontOf(otherEntity) {
    return this.calculateDistance(this.x, this.y, otherEntity.x, otherEntity.y) < 1.5;
  }

  clickOnCell(cell) {
    this.stopAll();

    const occupiedBy = cell?.occupiedBy;
    const material = cell?.material;
    const interactable = cell?.interactable;
    const x = cell?.x;
    const y = cell?.y;

    if (occupiedBy && occupiedBy.id !== this.id) {
      const e = this.findNearbyEntityById(occupiedBy.id);
      const myPlayer = this.user.getPlayers().find((p) => p.id === occupiedBy.id);

      if (myPlayer) {
        this.goToPosition(x, y);
      } else if (e) {
        this.attackEnemy(e);
      }
    }
    if (material) {
      this.gather(x, y);
    }
    if (interactable) {
      this.interact(x, y);
    }
    if (!occupiedBy && !material) {
      this.goToPosition(x, y);
    }
  }

  // Methods to interact with the entity
  takeDamage(damage, from) {
    console.log(this.name, "is taking damage from: ", from.name);
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    this.connection.takeDamage(damage, from, this);
    this.emitBasicAttrsUpdated();

    if (this.hp <= 0) {
      return this.die();
    }

    if (this.autoDefend && !this.attacking && !this.isDead()) this.attackEnemy(from);
  }

  getClosestTarget(type, range = 6) {
    const playerMap = this.map.getEntityMap(this, range);
    let closestTarget = null;
    let closestDistance = Infinity;

    // Iterate through the player's map
    for (let y = 0; y < playerMap.length; y++) {
      for (let x = 0; x < playerMap[y].length; x++) {
        const cell = playerMap[y][x];
        if (cell.occupiedBy && cell.occupiedBy !== this) {
          if (type && cell.occupiedBy.type !== type) continue;
          const distance = this.calculateDistance(this.x, this.y, cell.occupiedBy.x, cell.occupiedBy.y);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestTarget = cell.occupiedBy;
          }
        }
      }
    }
    return closestTarget;
  }

  getClosestInteractable(range = 6) {
    const playerMap = this.map.getEntityMap(this, range);
    let closestTarget = null;
    let closestDistance = Infinity;

    // Iterate through the player's map
    for (let y = 0; y < playerMap.length; y++) {
      for (let x = 0; x < playerMap[y].length; x++) {
        const cell = playerMap[y][x];
        if (cell.interactable) {
          const distance = this.calculateDistance(this.x, this.y, cell.x, cell.y);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestTarget = cell.interactable;
          }
        }
      }
    }
    return closestTarget;
  }

  findNearbyEntityById(id) {
    for (const e of this.getNearbyEntities()) {
      if (e.id === id) return e;
    }
  }

  getNearbyEntities(range = 7) {
    const playerMap = this.map.getEntityMap(this, range);
    const entities = [];

    // Iterate through the player's map
    for (let y = 0; y < playerMap.length; y++) {
      for (let x = 0; x < playerMap[y].length; x++) {
        const cell = playerMap[y][x];
        if (cell.occupiedBy) {
          entities.push(cell.occupiedBy);
        }
      }
    }
    return entities;
  }

  getNearbyMaterials(range = 7) {
    const playerMap = this.map.getEntityMap(this, range);
    const materials = [];

    // Iterate through the player's map
    for (let y = 0; y < playerMap.length; y++) {
      for (let x = 0; x < playerMap[y].length; x++) {
        const cell = playerMap[y][x];
        if (cell.material) {
          materials.push(cell.material);
        }
      }
    }
    return materials;
  }

  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  heal(player) {
    if (this.mana < HEALING_SPELL_MANA_COST) return;
    const attrs = this.getAttrs();
    const maxHp = player.getAttrs().ho;

    player.hp += attrs.power;
    if (player.hp > maxHp) player.hp = maxHp;

    this.mana -= HEALING_SPELL_MANA_COST;
    this.connection.healPlayer(player);
    this.emitBasicAttrsUpdated();
  }

  emitBasicAttrsUpdated() {
    this.connection.basicAttrsUpdated({ hp: this.hp, mana: this.mana });
  }

  receiveHeal(power) {}

  useMana(manaCost) {
    if (this.mana >= manaCost) {
      this.mana -= manaCost;
      return true;
    }
    return false;
  }

  gainExperience(experience) {
    const myPlayers = this.user.getPlayers().map((p) => p.id);
    const entities = this.getNearbyEntities().filter((p) => myPlayers.includes(p.id));
    const finalExp = experience / (entities.length ?? 1);

    for (const e of entities) {
      e.doGainExperience(finalExp);
    }
  }

  doGainExperience(finalExp) {
    this.experience += finalExp;
    // this.connection.gainExperience(experience);
    this.emitAttributes();
    this.connection.emitInfo(`${this.name} gained ${finalExp} experience.`);
  }

  getLevel() {
    return Math.floor(Math.sqrt(this.experience / 20)) + 1;
  }

  getLevelPercentage() {
    let number = Math.sqrt(this.experience / 20) + 1;
    let numberString = number.toString();
    let decimalIndex = numberString.indexOf(".");
    if (decimalIndex === -1) return 0;
    const result = parseInt(numberString.substring(decimalIndex + 1, decimalIndex + 3));
    if (numberString[decimalIndex + 2] === undefined) return result * 10;
    return result;
  }

  move(doneCb, movedCb) {
    const finish = () => {
      this.stopMovement();
      this.targetLocation = null;
      console.log("calling finish promise");
      doneCb?.();
    };

    const doMove = () => {
      if (this.movingIsBlocked) return;
      if (!this.moving || !this.targetLocation) return this.stopMovement();
      const [dx, dy] = this.getDirectionsToTarget(this.targetLocation[0], this.targetLocation[1]);
      const x = this.x + dx;
      const y = this.y + dy;

      if (this.x == this.targetLocation[0] && this.y === this.targetLocation[1]) return this.stopMovement();

      if (this.map.canMove(x, y)) {
        if (this.map.moveEntity(this.x, this.y, x, y)) {
          this.x = x;
          this.y = y;
          this.updateMovementCb?.();
          console.log("moved to", this.x, this.y);
          movedCb?.();
          if (this.targetLocation && this.targetLocation[0] === x && this.targetLocation[1] === y) {
            finish();
          }
        }
      } else {
        finish();
      }
    };

    if (this.hp == 0) return;
    if (this.movingTimeout) clearTimeout(this.movingTimeout);
    if (!this.targetLocation) return finish();

    this.moving = true;

    if (this.state === STATE.IDLE) this.changeState(STATE.MOVING);

    if (this.calculateDistance(this.x, this.y, this.targetLocation[0], this.targetLocation[1]) < 1) return finish();

    this.movingTimeout = setTimeout(() => {
      this.movingIsBlocked = false;
      this.move(doneCb, movedCb);
    }, this.movementSpeed);

    doMove();
    this.movingIsBlocked = true;
  }

  isDead() {
    return this.hp === 0;
  }

  removeInventory() {
    this.inventory = [];
  }

  emitInventory() {
    this.connection.updateInventory(this.inventory.getItems());
  }

  placeEntity(x, y) {
    this.map.placeEntity(x, y, this);
    this.x = x;
    this.y = y;
  }

  die() {
    console.log("dying...");
    this.stopAll();
    console.log("removing eneity", this.name);
    this.map.removeEntity(this.x, this.y);
    const drops = [];
    for (const i of this.inventory.getItems()) {
      if (getRandomInt(0, 100) <= 30) {
        drops.push({ ...i });
      }
    }
    this.connection.die();
    this.changeState(STATE.DEATH);
    clearInterval(this.regenInterval);
    return drops;
  }

  getMap() {
    return this.map.getEntityMap(this, 7);
  }

  stopAll() {
    clearInterval(this.harvestingInterval);
    this.attacking = false;
    this.stopMovement();
    if (this.state !== STATE.DEATH) this.changeState(STATE.IDLE);
  }

  stopMovement() {
    clearTimeout(this.movingTimeout);
    this.movingTimeout = setTimeout(() => (this.movingIsBlocked = false), this.movementSpeed);
    this.moving = false;
    if (this.state === STATE.MOVING) this.changeState(STATE.IDLE);
  }

  disconnect() {
    this.hp = 0;
    clearTimeout(this.healingTimeout);
    this.stopAll();
    map.removeEntity(this.x, this.y);
    console.log("removing from map");
  }
}

module.exports = {
  Entity,
  STATE,
};
