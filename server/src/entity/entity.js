const { map } = require("../globals");
const { createItem } = require("../item");
const { getRandomInt, generateUniqueString } = require("../utils");

const MAP_REFRESH_RATE_IN_MS = 220;

const STATE = {
  ATTACKING: "ATTACKING",
  IDLE: "IDLE",
  GATHERING: "GATHERING",
  MOVING: "MOVING",
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
    inventory = [],
    attackRange = 1,
    attackSpeed = 900,
    map,
    connection,
    autoDefend = false,
  }) {
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
    this.movingInterval = null;
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

    console.log(this.inventory);
    this.startEmitMap();
    this.calculateLevel();
    this.equipItemsInInventory();
    this.connection.entityInit(this);
  }

  startEmitMap() {
    setInterval(() => {
      this.connection.updateMap(this.id, this.map.getEntityMap(this));
    }, MAP_REFRESH_RATE_IN_MS);
  }

  equipItemsInInventory() {
    console.log("hehe");
    for (const o of this.inventory) {
      console.log("iterating", o);
      if (o.equiped) {
        this.equip(o);
      }
    }
    this.connection.updateInventory(this.id, this.inventory);
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
    for (const item of this.inventory) {
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

  equip(item) {
    item.equiped = true;
    const equipedItem = this.equiped[item.type];
    if (equipedItem) equipedItem.equiped = false;
    this.equiped[item.type] = item;

    console.log("Item equipped", this.equipped);
    const attrs = this.getAttrs();
    this.maxHp = attrs.hp;
    this.maxMana = attrs.hp;
    this.connection.equipedItemsUpdated(this.id, this.equiped);
    this.connection.attributesUpdated(this.id, attrs);
  }

  getDirectionsToTarget(targetX, targetY) {
    let directionX = targetX > this.x ? 1 : targetX < this.x ? -1 : 0;
    let directionY = targetY > this.y ? 1 : targetY < this.y ? -1 : 0;

    const nextPosition = [this.x + directionX, this.y + directionY];

    if (!this.map.canMove(nextPosition[0], nextPosition[1])) {
      if (this.calculateDistance(this.x, this.y, targetX, targetY) <= 1)
        return [0, 0];
      if (this.map.canMove(this.x + directionX, this.y + directionX)) {
        directionY = directionX;
        directionX = directionX;
      }
      if (this.map.canMove(this.x + directionY, this.y + directionY)) {
        directionY = directionY;
        directionX = directionY;
      }
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
    console.log("START GATHERING BOYS", x, y);
    console.trace();
    const handleAttack = () => {
      clearInterval(this.harvestingInterval);
      this.harvestingInterval = setInterval(() => {
        const material = this.map.getObject(x, y)?.material;
        if (!material || material.harvested || this.isDead()) {
          return stop();
        }
        if (this.isMaterialInRange(material)) {
          try {
            const drop = material.harvest(this.equiped.secondary);
            if (drop) {
              this.addItem(drop);
              return stop();
            }
          } catch (e) {
            this.connection.emitError(this.id, e.message);
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

  changeState(state) {
    this.state = state;
    this.connection.changeState(this.id, state);
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
    this.connection.attackEnemy(this.id, enemy);
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

  isMaterialInRange(enemy) {
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
    this.connection.enemyHit(this.id, damage, this, enemy);
    if (enemy.isDead()) {
      this.gainExperience(100); // TODO exp
      this.connection.enemyDied(this.id, enemy);
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

  // Methods to interact with the entity
  takeDamage(damage, from) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    this.connection.takeDamage(this.id, damage, from, this);
    this.connection.basicAttrsUpdated(this.id, {
      hp: this.hp,
      mana: this.mana,
    });

    if (this.hp <= 0) {
      return this.die();
    }

    console.log("taking damage", this.autoDefend, this.attacking);
    if (this.autoDefend && !this.attacking) this.attackEnemy(from);
  }

  getClosestTarget(type, range) {
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
    this.connection.gainExperience(this.id, experience);
    if (oldLevel < newLevel) this.connection.levelUp(this.id, newLevel);
  }

  calculateLevel() {
    this.level = Math.floor(Math.sqrt(this.experience) / 2) + 1;
  }

  addItem({ name, amount = 1 }) {
    const item = createItem(name, amount);
    item.equiped = false;

    const existingItemIndex = this.inventory.findIndex(
      (i) => i.name === item.name && i.amount < item.maxStack
    );

    if (existingItemIndex !== -1) {
      this.inventory[existingItemIndex].amount += amount;

      // Check if the stack exceeds the maximum
      if (this.inventory[existingItemIndex].amount > item.maxStack) {
        const overflowAmount =
          this.inventory[existingItemIndex].amount - item.maxStack;
        this.inventory[existingItemIndex].amount = item.maxStack;

        // Create a new item for the overflow
        const overflowItem = { ...item, amount: overflowAmount };
        this.inventory.push(overflowItem);
      }
    } else {
      this.inventory.push(item);
    }

    console.log("Adding an item to inventory", item);

    this.connection.addItem(this.id, item);
    this.connection.updateInventory(this.id, this.inventory);
  }

  removeItem(item) {
    const index = this.inventory.indexOf(item);
    if (index !== -1) {
      this.inventory.splice(index, 1);
    }
  }

  move(doneCb, movedCb) {
    const finish = () => {
      this.stopMovement();
      this.targetLocation = null;
      doneCb?.();
    };

    if (this.hp == 0) return;
    // console.log(
    //   "Start to move!",
    //   this.name,
    //   [this.x, this.y],
    //   this.targetLocation
    // );
    // Adjust the entity's position based on the vector and speed
    if (this.movingInterval) clearInterval(this.movingInterval);
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

    this.movingInterval = setInterval(() => {
      if (!this.moving || !this.targetLocation) return this.stopMovement();
      const [dx, dy] = this.getDirectionsToTarget(
        this.targetLocation[0],
        this.targetLocation[1]
      );
      const x = this.x + dx;
      const y = this.y + dy;

      console.log("target", this.name, this.x, this.y, this.targetLocation);
      if (this.x == this.targetLocation[0] && this.y === this.targetLocation[1])
        return this.stopMovement();
      // console.log(this.name, x, y, dx, dy)
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
        // if (
        //   this.calculateDistance(
        //     this.x,
        //     this.y,
        //     this.targetLocation[0],
        //     this.targetLocation[1]
        //   ) === 1
        // ) {
        // }
      }
    }, 700);
  }

  isDead() {
    return this.hp === 0;
  }

  removeInventory() {
    this.inventory = [];
  }

  emitInventory() {
    this.connection.updateInventory(this.id, this.inventory);
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
    this.connection.die(this.id);
    return drops;
  }

  getMap() {
    return this.map.getEntityMap(this, 7);
  }

  stopAll() {
    clearInterval(this.harvestingInterval);
    this.attacking = false;
    this.stopMovement();
    this.changeState(STATE.IDLE);
  }

  stopMovement() {
    clearInterval(this.movingInterval);
    this.moving = false;
    if (this.state === STATE.MOVING) this.changeState(STATE.IDLE);
  }
}

module.exports = {
  Entity,
  STATE,
};
