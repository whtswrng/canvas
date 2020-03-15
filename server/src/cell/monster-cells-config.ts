import {CellConfig} from "./cell";
const fabric = require('fabric').fabric;
import {ObjectCell} from "./object-cell";
import {generateNumberBetween} from "../utils/between";
import {createCoins, createGoldOre, createWood} from "../utils/items";
import {MonsterCell} from "./monster-cell";

export interface SpawnObject {
    createObject: (cellConfig: CellConfig, canvasSize: number) => MonsterCell,
    cellConfig: CellConfig,
    count: number
}

const defaultAttributes = {
    energy: 0,
    exp: 0,
    power: 0,
    speed: 0,
    regeneration: 4,
    hp: 50,
    farm: 0,
    enchant: 0,
    craft: 0
};

export const monsterCells: Array<SpawnObject> = [
    {
        createObject: (cellConfig: CellConfig, canvasSize) => {
            return new MonsterCell(() => new fabric.Circle({
                radius: 20, fill: 'black', left: generateLeft(cellConfig), top: generateTop(cellConfig)
            }), canvasSize, cellConfig);
        },
        count: 10,
        cellConfig: {
            attributes: {
                ...defaultAttributes,
                hp: 50
            },
            dropList: [{dropChance: 750, item: createCoins(3)}],
            expRange: [20, 30],
            respawnReach: 1600,
            respawnTimeInMS: 10000,
            spawnCoordinates: [5, 5],
            name: 'Gluk',
            isAttackable: true
        }
    },
];


function generateLeft(cellConfig: CellConfig) {
    return generateNumberBetween(cellConfig.spawnCoordinates[0], cellConfig.respawnReach);
}

function generateTop(cellConfig: CellConfig) {
    return generateNumberBetween(cellConfig.spawnCoordinates[1], cellConfig.respawnReach);
}
