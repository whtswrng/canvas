class Connection {
  constructor(socket, map) {
    this.map = map;
    this.socket = socket;
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }

  updateMap(id, m) {
    const newMap = [];

    for (const row of m) {
      const rows = [];
      for (const cell of row) {
        rows.push({
          type: cell.type,
          bg: cell.bg,
          x: cell.x,
          y: cell.y,
          material: cell.material
            ? {
                name: cell.material.name,
                level: cell.material.level,
                hp: cell.material.hp,
                maxHp: cell.material.maxHp,
              }
            : null,
          occupiedBy: cell.occupiedBy
            ? {
                id: cell.occupiedBy.id,
                name: cell.occupiedBy.name,
                level: cell.occupiedBy.level,
                hp: cell.occupiedBy.hp,
                maxHp: cell.occupiedBy.maxHp,
                mana: cell.occupiedBy.mana,
                maxMana: cell.occupiedBy.maxMana,
                state: cell.occupiedBy.state,
                kind: cell.occupiedBy.kind
              }
            : null,
        });
      }
      newMap.push(rows);
    }
    this.emit("MAP_UPDATED", {
      playerId: id,
      map: newMap,
    });
  }

  entityInit(player) {
    this.emit("ENTITY_INITIALIZED", {
      playerId: player.id,
      name: player.name,
      level: player.level,
      hp: player.hp,
      maxHp: player.maxHp,
      mana: player.mana,
      maxMana: player.maxMana,
      attrs: player.getAttrs(),
      inventory: player.inventory,
    });
  }

  emitError(id, msg) {
    this.emit("ERROR_MESSAGE", { playerId: id, msg });
  }

  updateInventory(id, inventory) {
    this.emit("INVENTORY_UPDATED", { playerId: id, inventory });
  }

  equipedItemsUpdated(id, equipedItems) {
    this.emit("EQUIPED_ITEMS_UPDATED", { playerId: id, equipedItems });
  }

  basicAttrsUpdated(id, attrs) {
    this.emit("BASIC_ATTRIBUTES_UPDATED", { playerId: id, attrs });
  }

  attributesUpdated(id, attrs) {
    this.emit("ATTRIBUTES_UPDATED", { playerId: id, attrs });
  }

  changeState(id, state) {
    this.emit("CHANGE_STATE", { playerId: id, state });
  }

  addItem(id, item) {
    this.emit("ADD_ITEM", { playerId: id, item });
  }

  attackEnemy(id, enemy) {
    this.emit("ATTACK_ENEMY", {
      playerId: id,
      enemy: { id: enemy.id, name: enemy.name },
    });
  }

  takeDamage(id, dmg, from, to) {
    this.emit("TAKE_DAMAGE", {
      playerId: id,
      from: { name: from.name },
      to: { name: to.name },
      damage: dmg,
    });
  }

  enemyHit(id, dmg, from, to) {
    this.emit("ENEMY_HIT", {
      playerId: id,
      playerName: from.name,
      damage: dmg,
      enemy: { id: to.id, name: to.name, hp: to.hp },
    });
  }

  enemyDied(id, enemy) {
    this.emit("ENEMY_DIED", {
      playerId: id,
      enemy: { id: enemy.id, name: enemy.name },
    });
  }

  gainExperience(id, exp) {
    this.emit("GAIN_EXPERIENCE", { playerId: id, experience: exp });
  }

  levelUp(id, newLevel) {
    this.emit("LEVEL_UP", { playerId: id, newLevel });
  }

  die(id) {
    this.emit("PLAYER_DIED", { playerId: id });
  }
}

module.exports = {
  Connection,
};
