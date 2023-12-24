const { map } = require("./globals");

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
    this.calculateLevel();
    this.attacking = false;
    this.target = null;
    this.targetLocation = null;
    // map
    this.x = 0;
    this.y = 0;
  }

  getDirectionsToTarget(targetX, targetY) {
    const directionX = targetX > this.x ? 1 : targetX < this.x ? -1 : 0;
    const directionY = targetY > this.y ? 1 : targetY < this.y ? -1 : 0;

    return [directionX, directionY]
  }

  goToPosition(targetX, targetY) {
    this.targetLocation = [targetX, targetY];
    if (!this.moving) {
      this.move();
    }
  }

  attackEnemy(enemy) {
    this.attacking = true;
    this.target = enemy;
    const { x, y } = enemy;
    this.goToPosition(x, y)

    setTimeout(() => {
      if (!this.attacking) return;
      this.handleAttack()
      if (this.target.hp == 0) {
        console.log('stopping')
        this.target = null;
        this.stop();
        return
      }

      this.attackEnemy(enemy)
    }, 700);
  }

  isInFrontOf(otherEntity) {
    // Define the relative positions for "in front"
    const deltaX = Math.abs(this.x - otherEntity.x);
    const deltaY = Math.abs(this.y - otherEntity.y);

    // Check if the other entity is in front based on your criteria
    // For example, check if it's in the same row and the current entity is to the right
    return deltaY < 2 && deltaX < 2;
  }


  // Methods to interact with the entity
  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
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
    this.inventory.push(item);
  }

  removeItem(item) {
    const index = this.inventory.indexOf(item);
    if (index !== -1) {
      this.inventory.splice(index, 1);
    }
  }

  move() {
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
          }
        }
      }
    }, 700);
  }

  handleAttack() {
    if (!this.attacking) return;
    if (!this.isInFrontOf(this.target)) return;
    console.log('dealing dmg -> ', this.name, this.target.name);
    this.target.takeDamage(10);
  }

  placeEntity(x, y) {
    map.placeEntity(x, y, this);
    this.x = x;
    this.y = y;
  }

  die() {
    console.log('dying...')
    this.stop();
    if (this.movingInterval) clearInterval(this.movingInterval)
    console.log('removing eneity', this.name)
    map.removeEntity(this.x, this.y);
  }

  getMap() {
    return map.getEntityMap(this, 7);
  }

  stop() {
    this.attacking = false;
    this.moving = false
  }
}

module.exports = {
  Entity
};