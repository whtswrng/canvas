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

const shopInteraction = new ShopInteraction();
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

const mob1 = createMob('Rat', 10, 11);

function createMob(name, x, y) {
  const enemy = new MobEntity({
    name: name,
    kind: "rat",
    speed: 0,
    map,
    experience: 1,
    respawnInS: 4,
    drops: [{ name: "Varnish", min: 1, max: 3, chance: 99 }],
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
      actionValue: `${x-1} ${y}`,
      condition: "",
      conditionValue: "",
      conditionComparisonValue: "",
    },
    {
      type: "pathing",
      actionType: "goToPosition",
      actionValue: `${x+5} ${y+2}`,
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

  inventory.addItem({ name: "Hands of Aros" });
  inventory.addItem({ name: "Simple axe" });
  inventory.addItem({ name: "Oak Log", amount: 10 });
  inventory.addItem({ name: "Oak Log", amount: 10 });
  inventory.addItem({ name: "Oak Log", amount: 10 });
  inventory.addItem({ name: "Common defense potion", amount: 4 });

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
  createMob
};
