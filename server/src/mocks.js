const { map } = require("./globals");
const { MobEntity } = require("./mob-entity");
const { createTree } = require("./game-map");
const { Material } = require("./material");

const tree = new Material({
  type: "tree",
  name: "Tall tree",
  hp: 30,
  x: 10,
  y: 7,
  respawnInS: 5,
  bg: "green",
  _static: true,
  dropItem: "logs",
  map,
});
tree.placeMaterial();

const enemy = new MobEntity({
  name: "Rat",
  hp: 70,
  mana: 0,
  kind: 'rat',
  speed: 0,
  map,
  experience: 1,
  respawnInS: 2,
  drops: [{ type: "Varnish", min: 1, max: 4, chance: 80 }],
});
enemy.placeEntity(11, 11); // Place an enemy nearby
enemy.guardArea(4);

module.exports = {
    enemy: enemy
}