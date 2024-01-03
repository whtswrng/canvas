const { createItem } = require("../item");

class ShopInteraction {
  generateData(entity) {
    this.data = {
      options: [
        {
          type: "item",
          item: createItem("Varnish", 1),
          requirements: [
            {
              type: "item",
              item: createItem("Silver", 30),
            },
          ],
        },
        {
          type: "item",
          item: createItem("Varnish", 5),
          requirements: [
            {
              type: "item",
              fulfilled: entity.hasItems([{ name: "Oak Log", amount: 22 }]),
              item: createItem("Oak Log", 22),
            },
          ],
        },
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

    console.log("here baybe==========================");
    if (entity.hasItems(requirementItems)) {
      entity.addItem(item);
    }
  }
}

module.exports = {
  ShopInteraction,
};
