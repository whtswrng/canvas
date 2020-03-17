import {Cell, CellConfig} from "./cell";
const fabric = require('fabric').fabric;
import {ObjectCell} from "./object-cell";
import {generateNumberBetween} from "../utils/between";
import {createGoldOre, createWood} from "../utils/items";

export interface SpawnObject {
    createObject: (cellConfig: CellConfig, canvasSize: number) => ObjectCell,
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

export const objectCells: Array<SpawnObject> = [
    {
        createObject: (cellConfig: CellConfig, canvasSize) => {
            return new ObjectCell(() => new fabric.Circle({
                radius: 10 + 1, fill: 'gold', left: generateLeft(cellConfig), top: generateTop(cellConfig)
            }), canvasSize, cellConfig);
        },
        count: 10,
        cellConfig: {
            attributes: {
                ...defaultAttributes,
                hp: 50
            },
            dropList: [{dropChance: 750, item: createGoldOre(2)}],
            expRange: [0, 0],
            respawnReach: 1600,
            respawnTimeInMS: 10000,
            spawnCoordinates: [5, 5],
            name: 'Gold Ore',
            isAttackable: false,
            type: "LOOTABLE_OBJECT"
        }
    },
    {
        createObject: (cellConfig: CellConfig, canvasSize) => {
            return new ObjectCell(() => new fabric.Triangle({
                width: 34, height: 80, fill: '#8a470c', left: generateLeft(cellConfig), top: generateTop(cellConfig)
            }), canvasSize, cellConfig);
        },
        count: 18,
        cellConfig: {
            attributes: {
                ...defaultAttributes,
                hp: 50
            },
            dropList: [{dropChance: 1000, item: createWood(3)}],
            expRange: [0, 0],
            respawnReach: 2400,
            respawnTimeInMS: 10000,
            spawnCoordinates: [5, 5],
            name: 'Tree',
            isAttackable: false,
            type: "LOOTABLE_OBJECT"
        }
    }
];


function generateLeft(cellConfig: CellConfig) {
    return generateNumberBetween(cellConfig.spawnCoordinates[0], cellConfig.respawnReach);
}

function generateTop(cellConfig: CellConfig) {
    return generateNumberBetween(cellConfig.spawnCoordinates[1], cellConfig.respawnReach);
}
