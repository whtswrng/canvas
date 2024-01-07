const { createItem } = require("../item");
const { createItemOption, SecondaryClassInteraction } = require("./alchemy-interaction");

class SmithingInteraction extends SecondaryClassInteraction {
  generateData(entity) {
    this.data = {
      options: [
        createItemOption(entity, createItem("Hands of Aros", 1), "smithing", 0, [createItem("Oak Log", 4)]),
      ],
      description: "Hello apprentice! I see you've come to craft a new armors and weapons!",
      action: "pickFromOptions",
      title: "Armory",
      actionButton: "Craft",
    };
    return this.data;
  }
}

module.exports = {
  SmithingInteraction,
};
