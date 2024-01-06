const { createItem } = require("../item");

function createItemOption(entity, item, alchemyLvl, requirementItems) {
  const secondaryClassReq = {
    type: "secondaryClass",
    name: "alchemy",
    level: alchemyLvl,
    fulfilled: entity?.secondaryClass?.level >= alchemyLvl,
  };

  return {
    type: "item",
    item: item,
    requirements: [
      secondaryClassReq,
      ...requirementItems.map((i) => ({
        type: "item",
        fulfilled: entity.hasItems([i]),
        item: i,
      })),
    ],
  };
}

class AlchemyInteraction {
  generateData(entity) {
    this.data = {
      options: [
        createItemOption(entity, createItem("Common defense potion", 1), 0, [createItem("Varnish", 1)]),
        createItemOption(entity, createItem("Common power potion", 1), 5, [createItem("Varnish", 1)]),
      ],
      description: "Hello apprentice! I see you've come to craft a new potions!",
      action: "pickFromOptions",
      title: "Alchemy trainer",
      actionButton: "Create",
    };
    return this.data;
  }

  handle(entity, response) {
    const selectedOption = this.data.options[response.data?.optionIndex];
    const item = selectedOption.item;
    const requirementItems = selectedOption.requirements.filter((r) => r.type === "item").map((r) => r.item);
    const classRequirement = selectedOption.requirements.find((r) => r.type === "secondaryClass");

    console.log('requirement', classRequirement)
    if (classRequirement) {
      if (classRequirement.name !== entity.secondaryClass.name) {
        return entity.emitError(`You need appropriate secondary class!`);
      }
      if (classRequirement.level > entity.secondaryClass.level) {
        return entity.emitError(`You need appropriate secondary class level!`);
      }
    }

    if (!item) return;

    if (entity.hasItems(requirementItems)) {
      entity.removeItems(requirementItems);
      entity.addItem(item);
      if (classRequirement) {
        if (entity.secondaryClass.level - classRequirement.level <= 20) {
          entity.increaseSecondaryClassLvl();
        }
      }
      return;
    }

    entity.emitError(`You cannot craft item ${item.name}!`);
  }
}

module.exports = {
  AlchemyInteraction,
};
