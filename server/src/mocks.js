const { MobEntity } = require("./mob-entity");
const { createTree } = require("./game-map");
const { Material } = require("./material");
const { EntityControl } = require("./entity/entity-control");
const { map } = require("./globals");

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
  secondaryClass: 'lumberjack',
  map,
});
tree.placeMaterial();

const enemy = new MobEntity({
  name: "Rat",
  hp: 60,
  mana: 0,
  kind: 'rat',
  speed: 0,
  map,
  experience: 1,
  respawnInS: 2,
  drops: [{ name: "Varnish", min: 1, max: 3, chance: 99 }],
});

const controls = [
  {
    type: "autoDefend",
    actionValue: true
  },
  {
    type: "controls",
    actionValue: true
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
  }
];
const ec = new EntityControl(enemy, controls);
enemy.placeEntity(11, 10); // Place an enemy nearby
ec.init()

module.exports = {
    enemy: enemy
}