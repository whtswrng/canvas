const { Connection } = require("./connection");
const { Entity } = require("./entity/entity");
const { getRandomInt } = require("./utils");
const { enemy, createPlayer } = require("./mocks");
const { EntityController: EntityControl } = require("./entity/entity-controller");

let controlPanelInMemory = [];

class User {
  constructor(socket, playersWithControls) {
    this.socket = socket;
    this.playersWithControls = playersWithControls;
    this.controlPanel = [...controlPanelInMemory];
    this.currentControls = null;

    for (const p of playersWithControls) {
      p.player.user = this;
      p.player.init();
    }
  }

  async initControlPanel() {
    this.controlPanel = [...controlPanelInMemory];
  }

  addControlPanel(name, controls) {
    this.controlPanel.push({ name, controls });
    console.log(`Control panel '${name}' added successfully.`);
    this.emitControlPanel();
    controlPanelInMemory = this.controlPanel;
  }

  deleteControlPanel(name) {
    if (this.controlPanel) {
      const panelIndex = this.controlPanel.findIndex((panel) => panel.name === name);
      if (panelIndex !== -1) {
        this.controlPanel.splice(panelIndex, 1);
        console.log(`Control panel '${name}' deleted successfully.`);
      } else {
        console.error(`Control panel '${name}' not found.`);
      }
    }
    controlPanelInMemory = this.controlPanel;
    this.emitControlPanel();
  }

  updateControlPanel(name, newControls) {
    if (this.controlPanel) {
      const panel = this.controlPanel.find((panel) => panel.name === name);
      if (panel) {
        panel.controls = newControls;
        console.log(`Control panel '${name}' updated successfully.`);
      } else {
        console.error(`Control panel '${name}' not found.`);
      }
    }
    controlPanelInMemory = this.controlPanel;

    this.emitControlPanel();
  }

  emitControlPanel() {
    this.socket.emit("CONTROL_PANEL_UPDATED", { panel: this.getControlPanel() });
  }

  setControlPanel(controlPanel) {
    this.controlPanel = controlPanel;
  }

  getControlPanel() {
    return this.controlPanel;
  }

  getPlayers() {
    return this.playersWithControls.map((p) => p.player);
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

  updatePlayerControls(playerId, panelName) {
    const p = this.playersWithControls.find(({ player }) => player.id === playerId);
    if (!p) return;

    const controls = this.controlPanel.find((p) => p.name === panelName)?.controls;
    if (controls) {
      console.log('setting controls!!!!!!!!1________', controls)
      p.control.setCurrentControls(panelName, controls);
      p.control.refreshQuickControls();
    }
  }

  init() {
    this.socket.on("SET_CONTROLS_STATE", ({ playerId, state = true, name }) => {
      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (!p) return;

      console.log("SET CONTROLS STATE", state, name);
      p.control.controlsEnabled = !!state;
      this.updatePlayerControls(playerId, name);
    });

    this.socket.on("SET_AUTO_DEFEND_STATE", ({ playerId, state = true }) => {
      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (!p) return;
      p.control.autoDefendEnabled = !!state;
      p.control.refreshQuickControls();
    });

    this.socket.on("SET_PVP_STATE", ({ playerId, state = true }) => {
      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (!p) return;
      p.control.pvpEnabled = !!state;
      p.control.refreshQuickControls();
    });

    this.socket.on("UPDATE_CONTROLS", ({ playerId, controls, name = "foo" }) => {
      console.log('==============')
      console.log(controls, name);
      this.updateControlPanel(name, controls);
      this.updatePlayerControls(playerId, name);
    });

    this.socket.on("USE_ITEM", ({ playerId, itemId }) => {
      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (p) p.player.useItem(itemId);
    });

    this.socket.on("EQUIP_ITEM", ({ playerId, itemId }) => {
      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (p) p.player.equipById(itemId);
    });

    this.socket.on("FORCE_INVENTORY_UPDATED", (data) => {
      for (const p of this.playersWithControls) {
        p.player.emitInventory();
      }
    });

    this.socket.on("FETCH_PLAYERS", (data, cb) => {
      for (const p of this.playersWithControls) {
        p.player.emitInventory();
      }
      cb(
        this.playersWithControls.map((p) => ({
          name: p.player.name,
          id: p.player.id,
        }))
      );
    });

    this.socket.on("FETCH_CONTROL_PANEL", (data, cb) => {
      cb({ panel: this.getControlPanel() });
    });

    this.socket.on("ADD_CONTROL_PANEL", (data, cb) => {
      this.addControlPanel(data.name, []);
    });

    this.socket.on("HAND_OVER_ITEMS", (data) => {
      const playerId = data?.playerId;

      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (p) p.player.handOverItems(this.getPlayerById(data.toPlayerId), data.items);
    });

    this.socket.on("CELL_CLICKED", (data) => {
      const playerId = data?.playerId;

      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (p) p.player.clickOnCell(data);
    });

    // Handle disconnections
    this.socket.on("disconnect", () => {
      for (const p of this.playersWithControls) {
        p.control.disconnect();
      }
    });
  }
}

module.exports = {
  User,
};
