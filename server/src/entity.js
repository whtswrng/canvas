const { map } = require("./globals");
const { getRandomInt } = require("./utils");

class Entity {
  constructor(name, hp, mana, speed, experience, type) {
    this.name = name;
    this.hp = hp;
    this.type = type;
    this.mana = mana;
    this.experience = experience;
    this.inventory = [];
    this.speed = speed;
    this.level = 1;
    this.moving = false;
    this.movingInterval = null;
    this.harvestingInterval = null;
    this.calculateLevel();
    this.attacking = false;
    this.targetLocation = null;
    // map
    this.x = 0;
    this.y = 0;
  }

  getDirectionsToTarget(targetX, targetY) {
    let directionX = targetX > this.x ? 1 : targetX < this.x ? -1 : 0;
    let directionY = targetY > this.y ? 1 : targetY < this.y ? -1 : 0;

    const nextPosition = [this.x + directionX, this.y + directionY]

    if (!map.canMove(nextPosition[0], nextPosition[1])) {
      if (this.calculateDistance(this.x, this.y, targetX, targetY) <= 1) return [0, 0];
      if (map.canMove(this.x + directionX, this.y + directionX)) {
        directionY = directionX;
        directionX = directionX;
      }
      if (map.canMove(this.x + directionY, this.y + directionY)) {
        directionY = directionY;
        directionX = directionY;
      }
    }

    return [directionX, directionY]
  }

  goToPosition(targetX, targetY) {
    return new Promise((res) => {
      this.targetLocation = [targetX, targetY];
      if (!this.moving) {
        this.move(res);
      }
    });
  }

  async harvest(x, y, cb) {
    console.log('---=============THERE BAYBE');
    await this.goToPosition(x, y);
    return new Promise((res) => {
      if (this.harvestingInterval) clearInterval(this.harvestingInterval);

      this.harvestingInterval = setInterval(() => {
        const o = map.getObject(x, y)
        if (o.material) {
          const drop = o.material.harvest()
          if (drop) {
            this.addItem(drop)
          }
          if (o.material.harvested) {
            clearInterval(this.harvestingInterval);
            res()
          }
        }
      }, 800)
    });
  }

  attackEnemy(enemy) {
    this.attacking = true;
    const { x, y } = enemy;
    this.goToPosition(x, y)

    setTimeout(() => {
      if (!this.attacking) return;
      if(this.hp === 0) return
      this.handleAttack(enemy)
      if (enemy.hp == 0) {
        console.log('stopping')
        this.stop();
        return
      }

      this.attackEnemy(enemy)
    }, 700);
  }

  isInFrontOf(otherEntity) {
    return this.calculateDistance(this.x, this.y, otherEntity.x, otherEntity.y) < 1.5;
  }


  // Methods to interact with the entity
  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      return this.die();
    }
  }

  getClosestTarget(type, range) {
    const playerMap = map.getEntityMap(this, range);
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
    this.calculateLevel();
  }

  calculateLevel() {
    this.level = Math.floor(Math.sqrt(this.experience) / 2);
  }

  addItem(item) {
    console.log('Adding an item to inventory', item);
    this.inventory.push(item);
  }

  removeItem(item) {
    const index = this.inventory.indexOf(item);
    if (index !== -1) {
      this.inventory.splice(index, 1);
    }
  }

  move(cb) {
    if(this.hp == 0) return;
    console.log('Start to move!', this.name)
    // Adjust the entity's position based on the vector and speed
    if (this.movingInterval) clearInterval(this.movingInterval);
    if (!this.targetLocation) return;

    this.moving = true;

    this.movingInterval = setInterval(() => {
      if (!this.moving) return clearInterval(this.movingInterval);
      const [dx, dy] = this.getDirectionsToTarget(this.targetLocation[0], this.targetLocation[1])
      const x = this.x + dx;
      const y = this.y + dy;

      console.log('target', this.name, this.x, this.y)
      // console.log(this.name, x, y, dx, dy)
      if (map.canMove(x, y)) {
        if (map.moveEntity(this.x, this.y, x, y)) {
          this.x = x;
          this.y = y
          if (this.targetLocation && this.targetLocation[0] === x && this.targetLocation[1] === y) {
            this.stop()
            this.targetLocation = null;
            cb?.();
          }
        }
      } else {
        if (this.calculateDistance(this.x, this.y, this.targetLocation[0], this.targetLocation[1]) === 1) {
          this.stop()
          this.targetLocation = null;
          cb?.()
        }
      }
    }, 700);
  }

  isDead() {
    return this.hp === 0;
  }

  handleAttack(enemy) {
    if (!this.attacking) return;
    if (!this.isInFrontOf(enemy)) return;
    console.log('dealing dmg -> ', this.name, enemy.name);
    const drops = enemy.takeDamage(10);
    if(drops) {
      for (const d of drops) {
        this.addItem(d)
      }
    }
  }

  removeInventory() {
    this.inventory = [];
  }

  placeEntity(x, y) {
    map.placeEntity(x, y, this);
    this.x = x;
    this.y = y;
  }

  die() {
    console.log('dying...')
    this.stop();
    console.log('removing eneity', this.name)
    map.removeEntity(this.x, this.y);
    const drops = [];
    for (const i of this.inventory) {
      if (getRandomInt(0, 100) <= 30) {
        drops.push({...i})
      }
    }
    return drops;
  }

  getMap() {
    return map.getEntityMap(this, 7);
  }

  stop() {
    clearInterval(this.movingInterval);
    clearInterval(this.harvestingInterval);
    this.attacking = false;
    this.moving = false
  }
}

module.exports = {
  Entity
};