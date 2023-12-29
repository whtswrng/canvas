const { map } = require("./globals");
const { getRandomInt } = require("./utils");

const MAP_REFRESH_RATE_IN_MS = 220;

class Entity {
  constructor({
    id,
    name,
    hp,
    mana,
    speed,
    kind,
    experience,
    type,
    inventory = [],
    attackRange = 1,
    castingSpeed = 600,
    map,
    connection,
  }) {
    this.id = id;
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.type = type;
    this.kind = kind; // rat, light-mage, ...
    this.connection = connection;
    this.mana = mana;
    this.maxMana = hp;
    this.experience = experience;
    this.equiped = {
      head: null,
      armor: null,
      weapon: null,
      hands: null,
      boots: null,
    };
    this.inventory = inventory;
    this.speed = speed;
    this.level = 1;
    this.moving = false;
    this.movingInterval = null;
    this.harvestingInterval = null;
    this.attacking = false;
    this.targetLocation = null;
    this.attackRange = attackRange;
    this.castingSpeed = castingSpeed;
    // map
    this.map = map;
    this.x = 0;
    this.y = 0;

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
    for (const o of this.inventory) {
      if (o.equip) {
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
    const equipedItem = this.equip[item.type];
    if (equipedItem) equipedItem.equiped = false;
    this.equiped[item.type] = item;

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
      if (!this.moving) {
        this.move(res, movedCb);
      }
    });
  }

  async gather(x, y, cb) {
    console.log("---=============THERE BAYBE");
    await this.goToPosition(x, y);
    return new Promise((res) => {
      if (this.harvestingInterval) clearInterval(this.harvestingInterval);

      this.harvestingInterval = setInterval(() => {
        this.changeState("GATHERING");
        const o = this.map.getObject(x, y);
        if (o.material) {
          const drop = o.material.harvest();
          if (drop) {
            this.addItem(drop);
          }
          if (!o.material) {
            clearInterval(this.harvestingInterval);
            res();
          }
        }
      }, 800);
    });
  }

  changeState(state) {
    this.state = state;
    this.connection.changeState(this.id, state);
  }

  attackEnemy(enemy) {
    this.attacking = true;
    const { x, y } = enemy;

    this.connection.attackEnemy(this.id, enemy);
    enemy.attackInitiated(this);
    this.goToPosition(x, y, () => {
      // called when moved
      if (this.isEnemyInRange(enemy)) {
        this.doAttack(enemy);
        let interval = setInterval(() => {
          if (enemy.isDead() || this.isDead()) {
            clearInterval(interval);
            this.stopAll();
            return;
          }
          if (!this.attacking) {
            clearInterval(interval);
            return;
          }
          if ((this.isEnemyInRange(enemy), 1)) {
            this.doAttack(enemy);
          } else {
            clearInterval(interval);
            this.attackEnemy(enemy);
          }
        }, this.castingSpeed);
      }
    });
  }

  attackInitiated(from) {
    // emit some event
  }

  isEnemyInRange(enemy, addition = 0) {
    return (
      this.calculateDistance(this.x, this.y, enemy.x, enemy.y) <=
      this.attackRange + addition
    );
  }

  doAttack(enemy) {
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
      damage *= 2;
    }

    // Apply defense reduction
    damage -= enemy.getAttrs().defense;
    // Ensure damage is non-negative
    damage = Math.max(3, damage);

    this.changeState("ATTACKING");
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

  addItem(item) {
    console.log("Adding an item to inventory", item);
    this.inventory.push(item);
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
    if (this.hp == 0) return;
    console.log("Start to move!", this.name);
    // Adjust the entity's position based on the vector and speed
    if (this.movingInterval) clearInterval(this.movingInterval);
    if (!this.targetLocation) return;

    this.moving = true;
    this.changeState("MOVING");

    this.movingInterval = setInterval(() => {
      if (!this.moving) return clearInterval(this.movingInterval);
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
            this.stopAll();
            this.targetLocation = null;
            doneCb?.();
          }
        }
      } else {
        if (
          this.calculateDistance(
            this.x,
            this.y,
            this.targetLocation[0],
            this.targetLocation[1]
          ) === 1
        ) {
          this.stopAll();
          this.targetLocation = null;
          doneCb?.();
        }
      }
    }, 700);
  }

  isDead() {
    return this.hp === 0;
  }

  removeInventory() {
    this.inventory = [];
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
    this.changeState("IDLE");
  }

  stopMovement() {
    clearInterval(this.movingInterval);
    this.moving = false;
    this.changeState("IDLE");
  }
}

module.exports = {
  Entity,
};
