const { map } = require("../globals");
const { Interactable } = require("../interactable");
const { createItem } = require("../item");
const { getRandomInt, generateUniqueString } = require("../utils");

const MAP_REFRESH_RATE_IN_MS = 120;

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
    hp,
    mana,
    speed,
    kind,
    experience,
    type = "player",
    inventory,
    attackRange = 1,
    attackSpeed = 900,
    map,
    connection,
    autoDefend = false,
  }) {
    this.user = undefined; // will be filled later
    this.changeStateCb = null;
    this.id = id;
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.type = type;
    this.kind = kind; // rat, light-mage, ...
    this.connection = connection;
    this.autoDefend = autoDefend;
    this.mana = mana;
    this.maxMana = hp;
    this.experience = experience;
    this.interactableObject = null;
    this.equiped = {
      head: null,
      armor: null,
      weapon: null,
      hands: null,
      boots: null,
      secondary: null,
    };
    this.inventory = inventory;
    this.speed = speed;
    this.level = 1;
    this.moving = false;
    this.movingTimeout = null;
    this.harvestingInterval = null;
    this.attacking = false;
    this.attackingInterval = null;
    this.targetLocation = null;
    this.target = null;
    this.attackRange = attackRange;
    this.attackSpeed = attackSpeed;
    this.state = "IDLE";
    // map
    this.map = map;
    this.x = 0;
    this.y = 0;

    this.movementSpeed = 700;
    this.movingIsBlocked = false;

    this.startEmitMap();
    this.calculateLevel();
    this.equipItemsInInventory();
    this.connection.entityInit(this);
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
      hp: 120,
      mana: 100,
      defense: 6,
      power: 30,
      critChance: 5,
    };
    // items
    for (const item of this.inventory.getItems()) {
      if (item.attrs) {
        for (const attr in item.attrs) {
          attrs[attr] =
            attrs[attr] === undefined
              ? item.attrs[attr]
              : attrs[attr] + item.attrs[attr];
        }
      }
    }
    return attrs;
  }

  // equip(item) {
  //   item.equiped = true;
  //   const equipedItem = this.equiped[item.type];
  //   if (equipedItem) equipedItem.equiped = false;
  //   this.equiped[item.type] = item;

  //   console.log("Item equipped", this.equipped);
  //   const attrs = this.getAttrs();
  //   this.maxHp = attrs.hp;
  //   this.maxMana = attrs.hp;
  //   this.connection.equipedItemsUpdated(this.id, this.equiped);
  //   this.connection.attributesUpdated(this.id, attrs);
  // }

  equip(item) {
    item.equiped = true;
    const equippedItem = this.equiped[item.type];
    if (equippedItem) equippedItem.equiped = false;
    this.equiped[item.type] = item;

    console.log("Item equipped", this.equipped);
    const attrs = this.getAttrs();
    this.maxHp = attrs.hp;
    this.maxMana = attrs.hp;
    this.connection.equippedItemsUpdated(this.equiped);
    this.connection.attributesUpdated(attrs);
  }

  equipItemsInInventory() {
    console.log("hehe");
    for (const item of this.inventory.getItems()) {
      if (item.equiped) {
        this.equip(item);
      }
    }
    this.connection.updateInventory(this.inventory.getItems());
  }

  addItem(item) {
    console.log("item", item);
    this.inventory.addItem(item);
    this.connection.addItem(item);
    this.connection.updateInventory(this.inventory.getItems());
  }

  hasItems(items) {
    return this.inventory.hasItems(items);
  }

  removeItem(item) {
    this.inventory.removeItem(item);
    this.connection.updateInventory(this.inventory.getItems());
  }

  // getDirectionsToTarget(targetX, targetY) {
  //   let directionX = targetX > this.x ? 1 : targetX < this.x ? -1 : 0;
  //   let directionY = targetY > this.y ? 1 : targetY < this.y ? -1 : 0;

  //   const nextPosition = [this.x + directionX, this.y + directionY];

  //   if (!this.map.canMove(nextPosition[0], nextPosition[1])) {
  //     console.log("here boy ------");
  //     if (this.calculateDistance(this.x, this.y, targetX, targetY) <= 1) {
  //       console.log("1");
  //       return [0, 0];
  //     }
  //     console.log('finished')
  //   }

  //   return [directionX, directionY];
  // }

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
    console.log("target: ", enemy.name);
    enemy.attackInitiated(this);

    handleAttack();
  }

  attackInitiated(from) {
    // emit some event
  }

  isEnemyInRange(enemy, addition = 0) {
    return (
      Math.floor(this.calculateDistance(this.x, this.y, enemy.x, enemy.y)) <=
      this.attackRange + addition
    );
  }

  isInRange(enemy) {
    if (enemy instanceof Interactable) {
      return (
        Math.floor(this.calculateDistance(this.x, this.y, enemy.x, enemy.y)) <=
        2
      );
    }
    return (
      Math.floor(this.calculateDistance(this.x, this.y, enemy.x, enemy.y)) <= 1
    );
  }

  hitEnemy(enemy) {
    if (enemy.isDead() || this.isDead()) return;
    console.log("dealing dmg -> ", this.name, enemy.name);
    this.stopMovement();
    // Calculate damage considering crit chance, power, and defense
    const attrs = this.getAttrs();
    const critRoll = Math.random() * 100; // Roll for critical chance
    const isCrit = critRoll <= attrs.critChance / 2.5;

    // Calculate damage
    let damage = getRandomInt(
      Math.floor(attrs.power / 1.05),
      Math.floor(attrs.power * 1.05)
    );

    if (isCrit) {
      // Apply critical damage multiplier (you can adjust this multiplier)
      damage = damage * 1.5;
    }

    // Apply defense reduction
    damage -= enemy.getAttrs().defense;
    // Ensure damage is non-negative
    damage = Math.max(3, damage);

    const drops = enemy.takeDamage(damage, this);
    this.connection.enemyHit(damage, this, enemy);
    if (enemy.isDead()) {
      this.gainExperience(100); // TODO exp
      this.connection.enemyDied(enemy);
    }
    if (drops) {
      for (const d of drops) {
        this.addItem(d);
      }
    }
  }

  isInFrontOf(otherEntity) {
    return (
      this.calculateDistance(this.x, this.y, otherEntity.x, otherEntity.y) < 1.5
    );
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
      const myPlayer = this.user
        .getPlayers()
        .find((p) => p.id === occupiedBy.id);

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
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    this.connection.takeDamage(damage, from, this);
    this.connection.basicAttrsUpdated({
      hp: this.hp,
      mana: this.mana,
    });

    if (this.hp <= 0) {
      return this.die();
    }

    console.log("taking damage", this.autoDefend, this.attacking);
    if (this.autoDefend && !this.attacking && !this.isDead())
      this.attackEnemy(from);
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
          const distance = this.calculateDistance(this.x, this.y, x, y);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestTarget = cell.occupiedBy;
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

  heal(healing) {
    this.hp += healing;
    // You can add logic to limit the maximum HP if needed
  }

  useMana(manaCost) {
    if (this.mana >= manaCost) {
      this.mana -= manaCost;
      return true;
    }
    return false;
  }

  gainExperience(experience) {
    this.experience += experience;
    const oldLevel = this.level;
    this.calculateLevel();
    const newLevel = this.level;
    this.connection.gainExperience(experience);
    if (oldLevel < newLevel) this.connection.levelUp(newLevel);
  }

  calculateLevel() {
    this.level = Math.floor(Math.sqrt(this.experience) / 2) + 1;
  }

  // addItem({ name, amount = 1 }) {
  //   const item = createItem(name, amount);
  //   item.equiped = false;

  //   const existingItemIndex = this.inventory.findIndex(
  //     (i) => i.name === item.name && i.amount < item.maxStack
  //   );

  //   if (existingItemIndex !== -1) {
  //     this.inventory[existingItemIndex].amount += amount;

  //     // Check if the stack exceeds the maximum
  //     if (this.inventory[existingItemIndex].amount > item.maxStack) {
  //       const overflowAmount =
  //         this.inventory[existingItemIndex].amount - item.maxStack;
  //       this.inventory[existingItemIndex].amount = item.maxStack;

  //       // Create a new item for the overflow
  //       const overflowItem = { ...item, amount: overflowAmount };
  //       this.inventory.push(overflowItem);
  //     }
  //   } else {
  //     this.inventory.push(item);
  //   }

  //   console.log("Adding an item to inventory", item);

  //   this.connection.addItem(this.id, item);
  //   this.connection.updateInventory(this.id, this.inventory);
  // }

  // removeItem(item) {
  //   const index = this.inventory.indexOf(item);
  //   if (index !== -1) {
  //     this.inventory.splice(index, 1);
  //   }
  // }

  move(doneCb, movedCb) {
    const finish = () => {
      this.stopMovement();
      this.targetLocation = null;
      doneCb?.();
    };

    const doMove = () => {
      if (this.movingIsBlocked) return;
      if (!this.moving || !this.targetLocation) return this.stopMovement();
      const [dx, dy] = this.getDirectionsToTarget(
        this.targetLocation[0],
        this.targetLocation[1]
      );
      const x = this.x + dx;
      const y = this.y + dy;

      if (this.x == this.targetLocation[0] && this.y === this.targetLocation[1])
        return this.stopMovement();

      if (this.map.canMove(x, y)) {
        if (this.map.moveEntity(this.x, this.y, x, y)) {
          this.x = x;
          this.y = y;
          movedCb?.();
          if (
            this.targetLocation &&
            this.targetLocation[0] === x &&
            this.targetLocation[1] === y
          ) {
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
    if (
      this.calculateDistance(
        this.x,
        this.y,
        this.targetLocation[0],
        this.targetLocation[1]
      ) < 1
    )
      return finish();

    this.moving = true;

    if (this.state === STATE.IDLE) this.changeState(STATE.MOVING);

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
    for (const i of this.inventory) {
      if (getRandomInt(0, 100) <= 30) {
        drops.push({ ...i });
      }
    }
    this.connection.die();
    this.changeState(STATE.DEATH);
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
    this.movingTimeout = setTimeout(
      () => (this.movingIsBlocked = false),
      this.movementSpeed
    );
    this.moving = false;
    if (this.state === STATE.MOVING) this.changeState(STATE.IDLE);
  }

  disconnect() {
    this.stopAll();
    map.removeEntity(this.x, this.y);
  }
}

module.exports = {
  Entity,
  STATE,
};
