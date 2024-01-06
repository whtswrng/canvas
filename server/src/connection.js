class Connection {
  constructor(id, socket, map) {
    this.id = id;
    this.map = map;
    this.socket = socket;
  }

  on(event, data, cb) {
    return this.socket.on(event, data, cb);
  }

  off(event, listener) {
    return this.socket.off(event, listener);
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }

  updateMap(m) {
    const newMap = [];

    for (const row of m) {
      const rows = [];
      for (const cell of row) {
        rows.push({
          type: cell.type,
          bg: cell.bg,
          x: cell.x,
          y: cell.y,
          interactable: cell.interactable
            ? {
                name: cell.interactable.name,
                description: cell.interactable.description,
              }
            : null,
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
                maxHp: cell.occupiedBy.getAttrs().hp,
                mana: cell.occupiedBy.mana,
                maxMana: cell.occupiedBy.maxMana,
                state: cell.occupiedBy.state,
                kind: cell.occupiedBy.kind,
              }
            : null,
        });
      }
      newMap.push(rows);
    }
    this.emit("MAP_UPDATED", {
      playerId: this.id,
      map: newMap,
    });
  }

  entityInit(player) {
    this.emit("ENTITY_INITIALIZED", {
      playerId: player.id,
      name: player.name,
      level: player.level,
      hp: player.hp,
      mana: player.mana,
      attrs: player.getAttrs(),
      inventory: player.inventory.getItems(),
    });
  }

  emitError(msg) {
    this.emit("ERROR_MESSAGE", { playerId: this.id, msg });
  }

  emitInfo(msg) {
    this.emit("INFO_MESSAGE", { playerId: this.id, msg });
  }

  updateEffects(effects) {
    this.emit("PLAYER_EFFECTS", { playerId: this.id, effects });
  }

  updateInventory(inventory) {
    this.emit("INVENTORY_UPDATED", { playerId: this.id, inventory });
  }

  equipedItemsUpdated(equipedItems) {
    this.emit("EQUIPED_ITEMS_UPDATED", {
      playerId: this.id,
      items: equipedItems,
    });
  }

  basicAttrsUpdated(attrs) {
    this.emit("BASIC_ATTRIBUTES_UPDATED", { playerId: this.id, attrs });
  }

  attributesUpdated(attrs) {
    this.emit("ATTRIBUTES_UPDATED", { playerId: this.id, attrs });
  }

  emitActiveControlPanel(panelName) {
    this.emit("ACTIVE_CONTROL_PANEL", { playerId: this.id, panelName });
  }

  changeState(state) {
    this.emit("CHANGE_STATE", { playerId: this.id, state });
  }

  addItem(item) {
    this.emit("ADD_ITEM", { playerId: this.id, item });
  }

  attackEnemy(enemy) {
    this.emit("ATTACK_ENEMY", {
      playerId: this.id,
      enemy: { id: enemy.id, name: enemy.name },
    });
  }

  healPlayer(player) {
    this.emit("HEAL_PLAYER", {
      playerId: this.id,
      player: { id: player.id, name: player.name },
    });
  }

  sendInteractionData(data) {
    this.emit("INTERACTION_DATA", {
      playerId: this.id,
      data,
    });
  }

  takeDamage(dmg, from, to) {
    this.emit("TAKE_DAMAGE", {
      playerId: this.id,
      from: { name: from.name },
      to: { name: to.name },
      damage: dmg,
    });
  }

  enemyHit(dmg, from, to) {
    this.emit("ENEMY_HIT", {
      playerId: this.id,
      playerName: from.name,
      damage: dmg,
      enemy: { id: to.id, name: to.name, hp: to.hp },
    });
  }

  enemyDied(enemy) {
    this.emit("ENEMY_DIED", {
      playerId: this.id,
      enemy: { id: enemy.id, name: enemy.name },
    });
  }

  gainExperience(exp) {
    this.emit("GAIN_EXPERIENCE", { playerId: this.id, experience: exp });
  }

  levelUp(newLevel) {
    this.emit("LEVEL_UP", { playerId: this.id, newLevel });
  }

  die() {
    this.emit("PLAYER_DIED", { playerId: this.id });
  }
}

module.exports = {
  Connection,
};
