const { createItem } = require("../item");

function createItemOption(entity, item, requirementItems) {
  return {
    type: "item",
    item: item,
    requirements: requirementItems.map((i) => ({
      type: "item",
      fulfilled: entity.hasItems([i]),
      item: i,
    })),
  };
}

class ShopInteraction {
  generateData(entity) {
    this.data = {
      options: [
        createItemOption(entity, createItem("Varnish", 1), [
          createItem("Silver", 10),
        ]),
        createItemOption(entity, createItem("Varnish", 5), [
          createItem("Oak Log", 10),
          createItem("Varnish", 10),
        ]),
      ],
      description:
        "You can buy a lot of interesting stuff in my place my friend!",
      action: "buying",
      title: "Magic shop",
      actionButton: "Buy",
    };
    return this.data;
  }

  handle(entity, response) {
    const selectedOption = this.data.options[response.data?.optionIndex];
    const item = selectedOption.item;
    const requirementItems = selectedOption.requirements.map((r) => r.item);
    if (!item) return;

    if (entity.hasItems(requirementItems)) {
      entity.removeItems(requirementItems);
      entity.addItem(item);
    }
  }
}

module.exports = {
  ShopInteraction,
};
