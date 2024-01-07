const { MobEntity } = require("./mob-entity");
const { createTree } = require("./game-map");
const { Material } = require("./material");
const { EntityController } = require("./entity/entity-controller");
const { map } = require("./globals");
const { Connection } = require("./connection");
const { Entity } = require("./entity/entity");
const { getRandomInt } = require("./utils");
const { Interactable } = require("./interactable");
const { createItem } = require("./item");
const { ShopInteraction } = require("./interactions/shop-interaction");
const { Inventory } = require("./entity/inventory");
const { StorageInteraction } = require("./interactions/storage-interaction");
const { AlchemyInteraction } = require("./interactions/alchemy-interaction");
const { EnchantingInteraction } = require("./interactions/enchanting-interaction");
const { SmithingInteraction } = require("./interactions/smithing-interaction");

const shopInteraction = new ShopInteraction();
const alchemyInteraction = new AlchemyInteraction();
const enchantingInteraction = new EnchantingInteraction();
const smithingInteraction = new SmithingInteraction();
const storageInteraction = new StorageInteraction();

const shop = new Interactable({
  name: "Magic shop",
  description: "You can buy a lot of stuff here",
  x: 3,
  y: 3,
  map,
  interaction: shopInteraction,
});
shop.place();

const storage = new Interactable({
  name: "Storage",
  description: "You can store your items here.",
  x: 7,
  y: 3,
  map,
  interaction: storageInteraction,
});
storage.place();

const alchemy = new Interactable({
  name: "Alchemy",
  description: "You can craft your potions here.",
  x: 12,
  y: 3,
  map,
  interaction: alchemyInteraction,
});
alchemy.place();

const enchanting = new Interactable({
  name: "Enchanting Fortress",
  description: "You can craft enchants and gems here.",
  x: 4,
  y: 8,
  map,
  interaction: enchantingInteraction,
});
enchanting.place();

const smithing = new Interactable({
  name: "Armory",
  description: "You can craft armors and weapons here.",
  x: 4,
  y: 13,
  map,
  interaction: smithingInteraction,
});
smithing.place();

const tree = new Material({
  type: "tree",
  name: "Tall tree",
  hp: 30,
  level: 2,
  x: 10,
  y: 7,
  respawnInS: 5,
  bg: "green",
  _static: true,
  dropItem: "Oak Log",
  secondaryClass: "lumberjack",
  map,
});
tree.placeMaterial();

const mob1 = createMob("Rat", 10, 13);

function createMob(name, x, y) {
  const enemy = new MobEntity({
    name: name,
    kind: "rat",
    speed: 0,
    map,
    experience: 1,
    respawnInS: 4,
    drops: [{ name: "Varnish", min: 1, max: 3, chance: 99 }],
    attrs: { power: 90 },
    dropExperience: 50,
  });
  enemy.init();

  const controls = [
    {
      type: "basic",
      actionType: "attackEnemy",
      actionValue: "",
      condition: "ifTargetLvl",
      conditionValue: "isLowerThan",
      conditionComparisonValue: "99",
    },
    {
      type: "pathing",
      actionType: "goToPosition",
      actionValue: `${x - 1} ${y}`,
      condition: "",
      conditionValue: "",
      conditionComparisonValue: "",
    },
    {
      type: "pathing",
      actionType: "goToPosition",
      actionValue: `${x + 5} ${y + 2}`,
      condition: "",
      conditionValue: "",
      conditionComparisonValue: "",
    },
  ];

  const ec = new EntityController(enemy, controls);
  ec.controlsEnabled = true;
  ec.autoDefendEnabled = true;
  enemy.placeEntity(x, y); // Place an enemy nearby
  ec.init();
}

function createPlayer(name, kind, socket, x, y) {
  const entityId = getRandomInt(0, 1000000);
  const connection = new Connection(entityId, socket, map);
  const inventory = new Inventory(connection);

  inventory.addItem({ name: "Hands of Aros", enchant: 1, attrs: { hp: 20 } });
  inventory.addItem({ name: "Simple axe" });
  inventory.addItem({ name: "Oak Log", amount: 10 });
  inventory.addItem({ name: "Oak Log", amount: 10 });
  inventory.addItem({ name: "Varnish", amount: 4 });
  inventory.addItem({ name: "Oak Log", amount: 10 });
  inventory.addItem({ name: "Common defense potion", amount: 4 });
  inventory.addItem({ name: "Common hp potion", amount: 4 });
  inventory.addItem({ name: "Common mana potion", amount: 4 });

  const p = new Entity({
    id: entityId,
    name: name,
    kind: kind ?? "mage",
    speed: 0,
    experience: 1,
    attackRange: 4,
    connection,
    inventory,
    map,
    inventory,
  });

  p.equipByName("Simple axe");

  const entityControl = new EntityController(p, []);
  p.placeEntity(x, y); // Place the player at the center of the map
  entityControl.init();

  return { control: entityControl, player: p };
}

module.exports = {
  enemy: mob1,
  createPlayer,
  createMob,
};
