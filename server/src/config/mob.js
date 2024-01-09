const { EntityController } = require("../entity/entity-controller");
const { map } = require("../globals");
const { MobEntity } = require("../mob-entity");
const { getRandomInt } = require("../utils");

const mobs = [
  {
    name: "Rat",
    respawnInS: 4,
    drops: [{ name: "Varnish", min: 1, max: 3, chance: 99 }],
    attrs: { power: 90 },
    dropExperience: 50,
    spawnPoints: [
      [531, 507],
      [536, 506],
      [539, 505],
    ],
    aggresive: false,
  },
];

function spawnMobs() {
  for (const m of mobs) {
    for (const spawnPoint of m.spawnPoints) {
      console.log("creating an entity!!!!!!!=============================================");
      setTimeout(() => {
        createMob(spawnPoint[0], spawnPoint[1], { ...m });
      }, getRandomInt(0, 400));
    }
  }
}

function createMob(x, y, data) {
  const enemy = new MobEntity({
    name: data.name,
    speed: 0,
    map,
    experience: 1,
    respawnInS: data.respawnInS,
    drops: data.drops,
    attrs: data.attrs,
    dropExperience: data.dropExperience,
  });
  enemy.init();

  const controls = [
    {
      type: "pathing",
      actionType: "goToPosition",
      actionValue: `${x - getRandomInt(0, 1)} ${y + getRandomInt(0, 2)}`,
      condition: "",
      conditionValue: "",
      conditionComparisonValue: "",
    },
    {
      type: "pathing",
      actionType: "goToPosition",
      actionValue: `${x + getRandomInt(-5, 5)} ${y + getRandomInt(-4, 4)}`,
      condition: "",
      conditionValue: "",
      conditionComparisonValue: "",
    },
  ];
  if (data.aggresive) {
    controls.push({
      type: "basic",
      actionType: "attackEnemy",
      actionValue: "",
      condition: "ifTargetLvl",
      conditionValue: "isLowerThan",
      conditionComparisonValue: "99",
    });
  }

  const ec = new EntityController(enemy, controls);
  ec.controlsEnabled = true;
  ec.autoDefendEnabled = true;
  enemy.placeEntity(x, y); // Place an enemy nearby
  ec.init();
}

module.exports = {
  createMob,
  spawnMobs,
};
