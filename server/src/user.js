const fs = require("fs");

let controlPanelInMemory = [];

// Load JSON from file
try {
  const data = fs.readFileSync("./storage", "utf8");
  controlPanelInMemory = JSON.parse(data);
  console.log("JSON file loaded successfully.");
} catch (err) {
  console.error("Error loading JSON file:", err.message);
}

// Function to save JSON to file
function saveToJsonFile(data) {
  try {
    const jsonData = JSON.stringify(data, null, 2); // The third argument (2) specifies the number of spaces to use for indentation.
    fs.writeFileSync("./storage", jsonData, "utf8");
    console.log("JSON data saved to file successfully.");
  } catch (err) {
    console.error("Error saving JSON data to file:", err.message);
  }
}

class User {
  constructor(socket, playersWithControls) {
    this.socket = socket;
    this.playersWithControls = playersWithControls;
    this.controlPanel = [...controlPanelInMemory];

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
    saveToJsonFile(this.controlPanel);
    this.emitControlPanel();
  }

  renameControlPanel(oldName, newName) {
    if (this.controlPanel) {
      const panel = this.controlPanel.find((panel) => panel.name === oldName);
      if (panel) {
        panel.name = newName;
        console.log(`Control panel '${oldName}' was renamed successfully.`);
      } else {
        console.error(`Control panel '${name}' not found.`);
      }
    }
    controlPanelInMemory = this.controlPanel;
    saveToJsonFile(this.controlPanel);
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

    saveToJsonFile(this.controlPanel);
    this.emitControlPanel();
  }

  transitionTo(playerId, panelName) {
    this.setPlayerControls(playerId, panelName);
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

  setPlayerControls(playerId, panelName) {
    const p = this.playersWithControls.find(({ player }) => player.id === playerId);
    if (!p) return;

    const controls = this.controlPanel.find((p) => p.name === panelName)?.controls;
    if (controls) {
      console.log("setting controls!!!!!!!!1________", controls);
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
      this.setPlayerControls(playerId, name);
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
      console.log("==============");
      console.log(controls, name);
      this.updateControlPanel(name, controls);
    });

    this.socket.on("USE_ITEM", ({ playerId, itemId }) => {
      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (p) p.player.useItem(itemId);
    });

    this.socket.on("ENCHANT_ITEM", ({ playerId, enchantItem, item }) => {
      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (p) p.player.enchantItem(enchantItem, item);
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

    this.socket.on("DELETE_CONTROL_PANEL", (data, cb) => {
      this.deleteControlPanel(data.name);
    });

    this.socket.on("RENAME_CONTROL_PANEL", (data, cb) => {
      this.renameControlPanel(data.old, data.new);
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

    this.socket.on("MOVE_TOWARDS_CELL", (data) => {
      const playerId = data?.playerId;
      const x = data?.x;
      const y = data?.y;

      const p = this.playersWithControls.find(({ player }) => player.id === playerId);
      if (p) p.player.moveTowards(x, y);
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
