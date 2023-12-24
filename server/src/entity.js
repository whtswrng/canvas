const { map } = require("./globals");

class Entity {
  constructor(name, hp, mana, speed, experience) {
    this.name = name;
    this.hp = hp;
    this.mana = mana;
    this.experience = experience;
    this.inventory = [];
    this.speed = speed;
		this.level = 1;
    this.moving = false;
    this.movingInterval = null;
		this.calculateLevel();
    // map
    this.x = 0;
    this.y = 0;
  }

  // Methods to interact with the entity
  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp < 0) {
      this.hp = 0;
    }
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

  move(vector) {
    // Adjust the entity's position based on the vector and speed
    if(this.movingInterval) clearInterval(this.movingInterval);

    const [dx, dy] = vector;
    const x = this.x+dx;
    const y = this.y+dy;

    this.movingInterval = setInterval(() => {
      if(!this.moving) return clearInterval(this.movingInterval);

      if(map.canMove(x, y)){
        if(map.moveEntity(this.x, this.y, x, y)){
          this.x = x;
          this.y = y
        }
      }
    }, 500);
  }

  placeEntity(x, y) {
    map.placeEntity(x,y, this);
    this.x = x;
    this.y = y;
  }

  getMap() {
    return map.getEntityMap(this, 7);
  }

  stop() {
    this.moving = false
  }
}

module.exports = {
	Entity
};