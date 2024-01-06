const { createObject } = require("./game-map");
const { map } = require("./globals");
const { createItem } = require("./item");
const { generateUniqueString } = require("./utils");

class Interactable {
  constructor({ name, x, y, description, offsetX = 1, offsetY = 1, map, interaction }) {
    this.name = name;
    (this.x = x), (this.y = y);
    this.map = map;
    this.interaction = interaction;
    this.activeMap = {
      // entity id ->  request id
    };
  }

  place() {
    this.map.placeInteractable(this.x, this.y, this);
    this.map.makeStatic(this.x + 1, this.y);
    this.map.makeStatic(this.x, this.y + 1);
    this.map.makeStatic(this.x + 1, this.y + 1);
  }

  interact(entity) {
    const reqId = generateUniqueString();
    const result = { ...this.interaction.generateData(entity), reqId };
    entity.connection.sendInteractionData(result);

    const handleFn = (data) => {
      this.handleSocketInteraction(entity, data);
      entity.connection.off("INTERACT", handleFn);
    };

    entity.connection.on("INTERACT", handleFn);

    this.activeMap = {
      [entity.id]: reqId,
    };

    return result;
  }

  handleSocketInteraction(entity, data) {
    const requestId = data.reqId;
    const playerId = data.playerId;
    const _entity = entity.user.getPlayerById(playerId);
    const id = this.activeMap[entity.id];
    if (id !== requestId) return;

    this.handleInteraction(_entity, data);
  }

  handleInteraction(entity, data) {
    this.interaction.handle(entity, data);
  }

  stopInteracting(entity) {
    this.activeMap[entity.id] = undefined;
  }
}

module.exports = {
  Interactable,
};
