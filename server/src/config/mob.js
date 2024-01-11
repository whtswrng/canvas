const { EntityController } = require("../entity/entity-controller");
const { map } = require("../globals");
const { MobEntity } = require("../mob-entity");
const { getRandomInt } = require("../utils");

const mobs = [
  {
    name: "Rat",
    respawnInS: 10,
    level: 1,
    drops: [{ name: "Varnish", min: 1, max: 3, chance: 99 }],
    attrs: { power: 28, defense: 1, critChance: 5, hp: 55 },
    dropExperience: 30,
    spawnPoints: [
      {
        point: [541, 530],
        count: 35,
        density: 3, // offset of spawn point for next mob
      },
    ],
    aggresive: false,
  },
  {
    name: "Rat",
    respawnInS: 4,
    level: 2,
    drops: [{ name: "Varnish", min: 1, max: 3, chance: 99 }],
    attrs: { power: 30, defense: 1, critChance: 5, hp: 55 },
    dropExperience: 35,
    spawnPoints: [
      {
        point: [570, 530],
        count: 20,
        density: 3, // offset of spawn point for next mob
      },
    ],
    aggresive: false,
  },
  {
    name: "Forest Sprite",
    respawnInS: 60,
    drops: [{ name: "Twig", min: 1, max: 5, chance: 80 }],
    attrs: { power: 35, defense: 3, critChance: 5, hp: 65 },
    dropExperience: 20,
    spawnPoints: [
      {
        point: [600, 570],
        count: 20,
        density: 3, // offset of spawn point for next mob
      },
    ],
    aggressive: false,
    level: 2,
  },
  {
    name: "Forest Sprite",
    respawnInS: 60,
    drops: [{ name: "Twig", min: 1, max: 5, chance: 80 }],
    attrs: { power: 37, defense: 6, critChance: 5, hp: 70 },
    dropExperience: 20,
    spawnPoints: [
      {
        point: [570, 630],
        count: 20,
        density: 3, // offset of spawn point for next mob
      },
    ],
    aggressive: false,
    level: 3,
  },
  {
    name: "Young Wolf",
    respawnInS: 90,
    drops: [{ name: "Wolf Pelt", min: 1, max: 2, chance: 70 }],
    attrs: { power: 42, defense: 10, critChance: 10, hp: 80 },
    dropExperience: 30,
    spawnPoints: [
      {
        point: [550, 680],
        count: 30,
        density: 3, // offset of spawn point for next mob
      },
    ],
    aggressive: true,
    level: 4,
  },
  {
    name: "Young Wolf",
    respawnInS: 90,
    drops: [{ name: "Wolf Pelt", min: 1, max: 2, chance: 70 }],
    attrs: { power: 48, defense: 12, critChance: 10, hp: 90 },
    dropExperience: 35,
    spawnPoints: [
      {
        point: [620, 620],
        count: 30,
        density: 3, // offset of spawn point for next mob
      },
    ],
    aggressive: true,
    level: 5,
  },
  {
    name: "Giant Spiderling",
    respawnInS: 120,
    drops: [{ name: "Spider Silk", min: 1, max: 3, chance: 60 }],
    attrs: { power: 55, defense: 16, critChance: 15, hp: 105 },
    dropExperience: 40,
    spawnPoints: [
      {
        point: [610, 680],
        count: 30,
        density: 3, // offset of spawn point for next mob
      },
    ],
    aggressive: true,
    level: 6,
  },
  {
    name: "Giant Spiderling",
    respawnInS: 120,
    drops: [{ name: "Spider Silk", min: 1, max: 3, chance: 60 }],
    attrs: { power: 55, defense: 4, critChance: 15, hp: 135 },
    dropExperience: 45,
    spawnPoints: [
      {
        point: [610, 680],
        count: 30,
        density: 4, // offset of spawn point for next mob
      },
    ],
    aggressive: true,
    level: 7,
  },
  // {
  //   name: "Enchanted Treant",
  //   respawnInS: 180,
  //   drops: [{ name: "Ancient Bark", min: 2, max: 4, chance: 50 }],
  //   attrs: { power: 70, defense: 6, critChance: 18, hp: 150 },
  //   dropExperience: 60,
  //   spawnPoints: [
  //     {
  //       point: [610, 680],
  //       count: 30,
  //       density: 3, // offset of spawn point for next mob
  //     },
  //   ],
  //   aggressive: true,
  //   level: 8,
  // },
  {
    name: "Thunderhawk",
    respawnInS: 150,
    drops: [{ name: "Thunder Feather", min: 1, max: 2, chance: 65 }],
    attrs: { power: 80, defense: 5, critChance: 20, hp: 120 },
    dropExperience: 50,
    spawnPoints: [
      {
        point: [650, 680],
        count: 30,
        density: 4, // offset of spawn point for next mob
      },
    ],
    aggressive: true,
    level: 9,
  },
  {
    name: "Thunderhawk",
    respawnInS: 150,
    drops: [{ name: "Thunder Feather", min: 1, max: 2, chance: 65 }],
    attrs: { power: 85, defense: 6, critChance: 22, hp: 140 },
    dropExperience: 55,
    spawnPoints: [
      {
        point: [680, 710],
        count: 30,
        density: 4, // offset of spawn point for next mob
      },
    ],
    spawnPoints: [],
    aggressive: true,
    level: 10,
  },
  // {
  //   name: "Venomous Serpent",
  //   respawnInS: 120,
  //   drops: [{ name: "Venomous Fang", min: 1, max: 3, chance: 70 }],
  //   attrs: { power: 90, defense: 7, critChance: 15, hp: 100 },
  //   dropExperience: 55,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 11,
  // },
  // {
  //   name: "Venomous Serpent",
  //   respawnInS: 120,
  //   drops: [{ name: "Venomous Fang", min: 1, max: 3, chance: 75 }],
  //   attrs: { power: 100, defense: 9, critChance: 20, hp: 140 },
  //   dropExperience: 65,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 12,
  // },
  // {
  //   name: "Mystic Unicorn",
  //   respawnInS: 200,
  //   drops: [{ name: "Magical Horn", min: 1, max: 1, chance: 40 }],
  //   attrs: { power: 100, defense: 8, critChance: 25, hp: 200 },
  //   dropExperience: 70,
  //   spawnPoints: [],
  //   aggressive: false,
  //   level: 13,
  // },
  // {
  //   name: "Mystic Unicorn",
  //   respawnInS: 200,
  //   drops: [{ name: "Magical Horn", min: 1, max: 1, chance: 50 }],
  //   attrs: { power: 110, defense: 10, critChance: 32, hp: 240 },
  //   dropExperience: 85,
  //   spawnPoints: [],
  //   aggressive: false,
  //   level: 13,
  // },
  // {
  //   name: "Ancient Dragonling",
  //   respawnInS: 300,
  //   drops: [{ name: "Dragon Scale", min: 1, max: 2, chance: 30 }],
  //   attrs: { power: 120, defense: 10, critChance: 30, hp: 250 },
  //   dropExperience: 90,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 14,
  // },
  // {
  //   name: "Ancient Dragonling",
  //   respawnInS: 300,
  //   drops: [{ name: "Dragon Scale", min: 1, max: 2, chance: 40 }],
  //   attrs: { power: 140, defense: 11, critChance: 38, hp: 300 },
  //   dropExperience: 110,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 15,
  // },
  // {
  //   name: "Frost Elemental",
  //   respawnInS: 250,
  //   drops: [{ name: "Frost Essence", min: 1, max: 3, chance: 40 }],
  //   attrs: { power: 110, defense: 9, critChance: 25, hp: 180 },
  //   dropExperience: 80,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 16,
  // },
  // {
  //   name: "Frost Elemental",
  //   respawnInS: 250,
  //   drops: [{ name: "Frozen Essence", min: 1, max: 3, chance: 50 }],
  //   attrs: { power: 130, defense: 10, critChance: 30, hp: 230 },
  //   dropExperience: 100,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 17,
  // },
  // {
  //   name: "Celestial Phoenix",
  //   respawnInS: 350,
  //   drops: [{ name: "Phoenix Feather", min: 1, max: 1, chance: 25 }],
  //   attrs: { power: 150, defense: 15, critChance: 35, hp: 350 },
  //   dropExperience: 120,
  //   spawnPoints: [],
  //   aggressive: false,
  //   level: 18,
  // },
  // {
  //   name: "Celestial Phoenix",
  //   respawnInS: 350,
  //   drops: [{ name: "Phoenix Feather", min: 1, max: 1, chance: 25 }],
  //   attrs: { power: 150, defense: 15, critChance: 35, hp: 350 },
  //   dropExperience: 120,
  //   spawnPoints: [],
  //   aggressive: false,
  //   level: 19,
  // },
  // {
  //   name: "Spectral Wraith",
  //   respawnInS: 400,
  //   drops: [{ name: "Ephemeral Essence", min: 1, max: 2, chance: 20 }],
  //   attrs: { power: 160, defense: 18, critChance: 40, hp: 400 },
  //   dropExperience: 150,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 13,
  // },
  // {
  //   name: "Spectral Wraith",
  //   respawnInS: 400,
  //   drops: [{ name: "Ephemeral Essence", min: 1, max: 2, chance: 20 }],
  //   attrs: { power: 160, defense: 18, critChance: 40, hp: 400 },
  //   dropExperience: 150,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 14,
  // },
  // {
  //   name: "Titanic Earthshaker",
  //   respawnInS: 450,
  //   drops: [{ name: "Titanium Ore", min: 2, max: 4, chance: 15 }],
  //   attrs: { power: 180, defense: 20, critChance: 38, hp: 500 },
  //   dropExperience: 170,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 15,
  // },
  // {
  //   name: "Titanic Earthshaker",
  //   respawnInS: 450,
  //   drops: [{ name: "Titanium Ore", min: 2, max: 4, chance: 15 }],
  //   attrs: { power: 180, defense: 20, critChance: 38, hp: 500 },
  //   dropExperience: 170,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 16,
  // },
  // {
  //   name: "Abyssal Leviathan",
  //   respawnInS: 500,
  //   drops: [{ name: "Deep-sea Pearl", min: 1, max: 1, chance: 10 }],
  //   attrs: { power: 200, defense: 25, critChance: 45, hp: 600 },
  //   dropExperience: 200,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 17,
  // },
  // {
  //   name: "Abyssal Leviathan",
  //   respawnInS: 500,
  //   drops: [{ name: "Deep-sea Pearl", min: 1, max: 1, chance: 10 }],
  //   attrs: { power: 210, defense: 27, critChance: 45, hp: 600 },
  //   dropExperience: 220,
  //   spawnPoints: [],
  //   aggressive: true,
  //   level: 18,
  // },
  // {
  //   name: "Celestial Behemoth",
  //   respawnInS: 550,
  //   drops: [{ name: "Stellar Crystal", min: 1, max: 2, chance: 8 }],
  //   attrs: { power: 220, defense: 30, critChance: 50, hp: 700 },
  //   dropExperience: 230,
  //   spawnPoints: [],
  //   aggressive: false,
  //   level: 19,
  // },
  // {
  //   name: "Celestial Behemoth",
  //   respawnInS: 550,
  //   drops: [{ name: "Stellar Crystal", min: 1, max: 2, chance: 8 }],
  //   attrs: { power: 224, defense: 35, critChance: 50, hp: 700 },
  //   dropExperience: 250,
  //   spawnPoints: [],
  //   aggressive: false,
  //   level: 20,
  // },
  // {
  //   name: "Eternal Phoenix Emperor",
  //   respawnInS: 600,
  //   drops: [{ name: "Divine Feather", min: 1, max: 1, chance: 5 }],
  //   attrs: { power: 250, defense: 35, critChance: 55, hp: 800 },
  //   dropExperience: 250,
  //   spawnPoints: [],
  //   aggressive: false,
  //   level: 21,
  // },
  // {
  //   name: "Eternal Phoenix Emperor",
  //   respawnInS: 600,
  //   drops: [{ name: "Divine Feather", min: 1, max: 1, chance: 5 }],
  //   attrs: { power: 250, defense: 35, critChance: 55, hp: 800 },
  //   dropExperience: 250,
  //   spawnPoints: [],
  //   aggressive: false,
  //   level: 22,
  // },
];

function spawnMobs() {
  for (const m of mobs) {
    for (const spawnPoint of m.spawnPoints) {
      const points = createSpawnPoints(spawnPoint);

      for (const spawn of points) {
        console.log("creating an entity!!!!!!!=============================================");
        setTimeout(() => {
          createMob(spawn[0], spawn[1], { ...m });
        }, getRandomInt(0, 800));
      }
    }
  }

  function createSpawnPoints({ count, density, point }) {
    const spawnPoints = [];
    let acumDensity = density;

    for (let i = 0; i < count; i++) {
      const newSpawnPoint = [
        point[0] + i + getRandomInt(acumDensity / 2, acumDensity),
        point[1] + i + getRandomInt(acumDensity / 2, acumDensity),
      ];
      spawnPoints.push(newSpawnPoint);
      acumDensity += density;
    }
    console.log(spawnPoints);

    return spawnPoints;
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
      actionValue: `${x - getRandomInt(-5, 5)} ${y + getRandomInt(-4, 2)}`,
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

  if (map.canMove(x, y)) {
    enemy.placeEntity(x, y); // Place an enemy nearby
    ec.init();
  }
}

module.exports = {
  createMob,
  spawnMobs,
};
