const { MobEntity } = require("./mob-entity");
const { createTree } = require("./game-map");
const { Material } = require("./material");
const { EntityControl } = require("./entity/entity-control");
const { map } = require("./globals");
const { Connection } = require("./connection");
const { Entity } = require("./entity/entity");
const { getRandomInt } = require("./utils");
const { Interactable } = require("./interactable");
const { createItem } = require("./item");
const { ShopInteraction } = require("./interactions/shop-interaction");
const { Inventory } = require("./entity/inventory");

const shopInteraction = new ShopInteraction();

const shop = new Interactable({
  name: "Magic shop",
  description: "You can buy a lot of stuff here",
  x: 3,
  y: 3,
  map,
  interaction: shopInteraction,
});
shop.place();

const tree = new Material({
  type: "tree",
  name: "Tall tree",
  hp: 30,
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

const enemy = new MobEntity({
  name: "Rat",
  hp: 60,
  mana: 0,
  kind: "rat",
  speed: 0,
  map,
  experience: 1,
  respawnInS: 2,
  drops: [{ name: "Varnish", min: 1, max: 3, chance: 99 }],
});

const controls = [
  {
    type: "autoDefend",
    actionValue: true,
  },
  {
    type: "controls",
    actionValue: true,
  },
  // {
  //   type: "basic",
  //   actionType: "attackEnemy",
  //   actionValue: "",
  //   condition: "ifTargetLvl",
  //   conditionValue: "isLowerThan",
  //   conditionComparisonValue: "99",
  // },
  {
    type: "pathing",
    actionType: "goToPosition",
    actionValue: "11 10",
    condition: "",
    conditionValue: "",
    conditionComparisonValue: "",
  },
  {
    type: "pathing",
    actionType: "goToPosition",
    actionValue: "7 10",
    condition: "",
    conditionValue: "",
    conditionComparisonValue: "",
  },
];
const ec = new EntityControl(enemy, controls);
enemy.placeEntity(11, 10); // Place an enemy nearby
ec.init();

function createPlayer(name, socket, x, y) {
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
    hp: 100,
    kind: "light-mage",
    mana: 50,
    speed: 0,
    experience: 1,
    attackRange: 4,
    connection,
    inventory,
    map,
    inventory,
  });

  const entityControl = new EntityControl(p, []);
  p.placeEntity(x, y); // Place the player at the center of the map
  entityControl.init();

  return { control: entityControl, player: p };
}

module.exports = {
  enemy: enemy,
  createPlayer,
};
