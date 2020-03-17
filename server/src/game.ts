import {Cell, CellAttributes, CellConfig} from "./cell/cell";
import {PlayerCell} from "./cell/player-cell";
import {ObjectCell} from "./cell/object-cell";
import {objectCells} from "./cell/object-cells-config";
import {monsterCells} from "./cell/monster-cells-config";
import {makeBorderLine} from "./utils/canvas-utils";
import {io} from "./app";

const fabric = require('fabric').fabric;

export const CONFIG = {
    visibilityRadius: 300,
    attackingInterval: 1200
};

const canvasSize = 4000;
const canvas = new fabric.StaticCanvas(null, {width: canvasSize, height: canvasSize});
canvas.selection = false;
let localCanvas = new fabric.StaticCanvas(null, {width: canvasSize, height: canvasSize});
localCanvas.selection = false;

export interface ItemAttributes extends CellAttributes {

}

export interface Item {
    id: number,
    name: string,
    level: number,
    amount: number,
    stackable: boolean,
    attributes?: Partial<ItemAttributes>,
    quality: 'COMMON' | 'RARE' | 'EPIC',
    canEquip?: boolean,
    canUse?: boolean,
    isEquipped?: boolean,
    type: 'MATERIAL' | 'HELMET' | 'ARMOR' | 'WEAPON' | 'HANDS' | 'BOOTS' | 'OTHER' | 'POTION',
    requirements?: Array<{amount: number, itemName: string}>
}

export interface Drop {
    dropChance: number,
    item: Item
}

export class Game {
    private npcList: Array<Cell> = [];
    private farmObjectList: Array<ObjectCell> = [];

    constructor(private connections: Array<any>) {
    }

    public addCell(cell: PlayerCell) {
        canvas.add(cell.getGameObject());
    }

    private initRenderCanvas() {
        const connections = this.connections;
        let localCanvas = new fabric.StaticCanvas(null, {width: canvasSize, height: canvasSize});

        (async function _tick() {
            for (let i = 0; i < connections.length; i++) {
                const connection = connections[i];
                connection.emit('DRAW_GAME', {
                    game: renderGame(connection),
                    c1: connection._c1.getGameObject(),
                    c2: connection._c2.getGameObject(),
                });
            }
            await waitFor(45);
            _tick();
        })();

        function renderGame(socket) {
            localCanvas.clear();
            canvas.getObjects().forEach((o) => {
                for (let j = 1; j <= 2; j++) {
                    const cell = socket['_c' + j] as PlayerCell;
                    const gameObject = cell.getGameObject();
                    if (Math.abs(o.left - gameObject.left) <= CONFIG.visibilityRadius && Math.abs(o.top - gameObject.top) <= CONFIG.visibilityRadius) {
                        localCanvas.add(fabric.util.object.clone(o));
                    }
                }
            });
            localCanvas.add(makeBorderLine([0, 0, 0, canvasSize]));
            localCanvas.add(makeBorderLine([0, 0, canvasSize, 0]));
            localCanvas.add(makeBorderLine([canvasSize, 0, canvasSize, canvasSize]));
            localCanvas.add(makeBorderLine([0, canvasSize, canvasSize + 7, canvasSize]));

            return JSON.stringify(localCanvas.toJSON(['_name', '_type', '_isAttackable']));
        }
    }

    public startGame() {
        this.initRenderCanvas();
        this.initMovement();
        this.initRenderMonsters();
        this.initRenderObjects();
        this.renderInitialObjects();
    }

    public attack(from: Cell, attackAttribute: string) {
        const gameObject = from.getGameObject();
        const target = canvas.getObjects().find((o) => {
            const isClose = o !== gameObject && Math.abs(o.left - gameObject.left) <= 40 && Math.abs(o.top - gameObject.top) <= 40;
            if (!isClose) return false;

            const targetCell = o._cell as Cell;

            if (attackAttribute === 'power') {
                return targetCell.isAttackable();
            } else {
                return targetCell.isHarvastable();
            }
        });

        if (target) {
            const targetCell = target._cell as Cell;

            if (targetCell && !targetCell.isDead() && !from.isBusy()) {
                const damage = from.attackTarget(targetCell, attackAttribute);

                if (from.socket) {
                    from.socket.emit('TARGET_HIT', {
                        target: {
                            attributes: targetCell.getAttributes(),
                            name: targetCell.getName(),
                            type: targetCell.getType(),
                        },
                        from: {
                            name: from.getName(),
                            attributes: from.getAttributes(),
                            type: targetCell.getType(),
                        },
                        damage,
                    });
                }

                if (targetCell.isDead()) {
                    canvas.remove(target);
                    targetCell.planRespawn(() => canvas.add(targetCell.getGameObject()));
                    if (from.socket) {
                        const dropItems = targetCell.generateDropItems();
                        const exp = targetCell.generateExp();
                        from.addReward(dropItems, exp);
                        from.socket.emit('TARGET_DEAD', {
                            target: {
                                attributes: targetCell.getAttributes(),
                                name: targetCell.getName(),
                                type: targetCell.getType(),
                            },
                            from: {
                                name: from.getName(),
                                attributes: from.getAttributes(),
                                type: targetCell.getType(),
                            },
                            exp,
                            drop: dropItems
                        });
                    }
                }
            }
        }
    }

    private initRenderObjects() {
        objectCells.forEach((o) => {
            for (let i = 0; i < o.count; i++) {
                const object = o.createObject(o.cellConfig, canvasSize);
                canvas.add(object.getGameObject());
                this.farmObjectList.push(object);
            }
        });

    }

    private initRenderMonsters() {
        monsterCells.forEach((o) => {
            for (let i = 0; i < o.count; i++) {
                const object = o.createObject(o.cellConfig, canvasSize);
                canvas.add(object.getGameObject());
                this.npcList.push(object);
            }
        });
    }

    private renderInitialObjects() {
        const text = new fabric.Text('Welcome!', {
            left: 2,
            top: 2,
            fill: '#ff0e4c',
            angle: 15,
        });
        canvas.add(text);
    }

    private initMovement() {
        const connections = this.connections;

        (async function _move() {
            for (let i = 0; i < connections.length; i++) {
                const socket = connections[i];

                for (let j = 1; j <= 2; j++) {
                    const cell = socket['_c' + j] as PlayerCell;
                    cell.tryToMove();
                }
            }
            await waitFor(50);
            _move();
        })();
    }

    public getCanvasSize() {
        return canvasSize;
    }

}

function waitFor(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
}

