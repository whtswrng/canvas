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

  move(direction) {
    this.moving = true;
    // Adjust the entity's position based on the speed and direction
    switch (direction) {
      case 'up':
        this.y -= this.speed;
        break;
      case 'down':
        this.y += this.speed;
        break;
      case 'left':
        this.x -= this.speed;
        break;
      case 'right':
        this.x += this.speed;
        break;
      default:
        break;
    }
    if(this.movingInterval) clearInterval(this.movingInterval);

    this.movingInterval = setInterval(() => {
      // moving here
    }, 500);
  }

  stop() {
    this.moving = false
  }
}

module.exports = {
	Entity
};