const { createItem } = require("../config/item");
const { createItemOption, SecondaryClassInteraction } = require("./alchemy-interaction");

class EnchantingInteraction extends SecondaryClassInteraction {
  generateData(entity) {
    this.data = {
      options: [
        createItemOption(entity, createItem("Common enchant scroll", 1), "enchanting", 0, [createItem("Varnish", 1)]),
      ],
      description: "Hello apprentice! I see you've come to craft a new scrolls and gems!!",
      action: "pickFromOptions",
      title: "Fortress of enchanting",
      actionButton: "Craft",
    };
    return this.data;
  }
}

module.exports = {
  EnchantingInteraction,
};
