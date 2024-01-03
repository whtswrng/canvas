const { Connection } = require("./connection");
const { Entity } = require("./entity/entity");
const { getRandomInt } = require("./utils");
const { enemy, createPlayer } = require("./mocks");
const { EntityControl } = require("./entity/entity-control");

class User {
  constructor(socket, playersWithControls) {
    this.socket = socket;
    this.playersWithControls = playersWithControls;
    for (const p of playersWithControls) {
      p.player.user = this;
    }
  }

  getPlayers() {
    return this.playersWithControls.map((p) => p.player)
  }

  getPlayerByName(name) {
    for (const p of this.playersWithControls) {
      if (p.player.name === name) return p.player;
    }
  }

  getPlayerById(id) {
    for (const p of this.playersWithControls) {
      if (p.player.id === id) return p.player;
    }
  }

  init() {
    this.socket.on("UPDATE_CONTROLS", ({ playerId, list }) => {
      console.log("============", playerId, list);
      const p = this.playersWithControls.find(
        ({ player }) => player.id === playerId
      );
      if (p) p.control.setControls(list);
    });

    this.socket.on("USE_ITEM", ({ playerId, itemId }) => {
      const p = this.playersWithControls.find(
        ({ player }) => player.id === playerId
      );
      console.log('using item', itemId)
      if (p) p.player.useItem(itemId);
    });

    this.socket.on("FORCE_INVENTORY_UPDATED", (data) => {
      for (const p of this.playersWithControls) {
        p.player.emitInventory();
      }
    });

    this.socket.on("CELL_CLICKED", (data) => {
      const playerId = data?.playerId;
      console.log('=======CELLL CLICKED', data)

      const p = this.playersWithControls.find(
        ({ player }) => player.id === playerId
      );
      if (p) p.player.clickOnCell(data);
    });

    // Handle disconnections
    this.socket.on("disconnect", () => {
      console.log("A user disconnected");
      for (const p of this.playersWithControls) {
        p.control.disconnect();
      }
    });
  }
}

module.exports = {
  User,
};
