import {MonsterCell} from "./cell/monster-cell";

const fabric = require('fabric').fabric;
import {generateNumberBetween} from "./utils/between";
import {Cell} from "./cell/cell";
import {PlayerCell} from "./cell/player-cell";

export const CONFIG = {
    visibilityRadius: 300,
    attackingInterval: 1200
};

const canvasSize = 5000;
const canvas = new fabric.StaticCanvas(null, { width: canvasSize, height: canvasSize });

export class Game {

    private npcList: Array<Cell> = [];

    constructor(private connections: Array<any>) {
    }

    public addCell(cell: PlayerCell) {
        canvas.add(cell.getGameObject());
    }

    public startGame() {
        this.initRenderCanvas();
        this.initMovement();
        this.initRenderNPC();
        this.renderInitialObjects();
    }

    public attack(from: Cell) {
        const gameObject = from.getGameObject();
        const target = canvas.getObjects().find((o) => {
            return o !== gameObject && Math.abs(o.left - gameObject.left) <= 40 && Math.abs(o.top - gameObject.top) <= 40;
        });

        if(target) {
            const targetCell = target._cell as Cell;
            if(targetCell && ! targetCell.isDead() && from.canAttack()) {
                const damage = from.attackTarget(targetCell);

                if(from.socket) {
                    from.socket.emit('TARGET_HIT', {target: targetCell.name, from: from.name, damage, attributes: targetCell.getAttributes()});
                }

                if(targetCell.isDead()) {
                    console.log('dead!');
                    canvas.remove(target);
                    targetCell.tryToRespawn(() => canvas.add(targetCell.getGameObject()));
                    if(from.socket) {
                        from.socket.emit('TARGET_DEAD', {target: targetCell.name, from: from.name, attributes: targetCell.getAttributes(), drop: targetCell.generateDrop()});
                    }
                }
            }
        }
    }

    private initRenderNPC() {
        const left = 0;
        const top = 250;

        const monster = new MonsterCell(() => new fabric.Circle({
            radius: 20, fill: 'black', left, top
        }), 'Gluk', this.getCanvasSize());
        canvas.add(monster.getGameObject());
        this.npcList.push(monster);

        setInterval(() => {
            console.log('generating a MOB!');
            const left = generateNumberBetween(0, canvasSize);
            const top = generateNumberBetween(0, canvasSize);

            const monster = new MonsterCell(() => new fabric.Circle({
                radius: 20, fill: 'black', left, top
            }), 'Gluk', this.getCanvasSize());
            canvas.add(monster.getGameObject());
            this.npcList.push(monster);
        }, 2000);
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
            for(let i = 0; i < connections.length; i++) {
                const socket = connections[i];

                for(let j = 1; j <= 3; j++) {
                    const cell = socket['_c' + j] as PlayerCell;
                    cell.tryToMove();
                }
            }
            await waitFor(50);
            _move();
        })();
    }

    private initRenderCanvas() {
        const connections = this.connections;
        let localCanvas = new fabric.StaticCanvas(null, { width: canvasSize, height: canvasSize });

        (async function _tick() {
            for(let i = 0; i < connections.length; i++) {
                connections[i].emit('DRAW_GAME', renderGame(connections[i]));
            }
            await waitFor(45);
            _tick();
        })();

        function renderGame(socket) {
            localCanvas.clear();
            canvas.getObjects().forEach((o) => {
                for(let j = 1; j <= 3; j++) {
                    const cell = socket['_c' + j] as PlayerCell;
                    const gameObject = cell.getGameObject();
                    if(Math.abs(o.left - gameObject.left) <= CONFIG.visibilityRadius && Math.abs(o.top - gameObject.top) <= CONFIG.visibilityRadius) {
                        localCanvas.add(fabric.util.object.clone(o));
                    }
                }
            });

            return JSON.stringify(localCanvas);
        }
    }

    public getCanvasSize() {
        return canvasSize;
    }

}

function waitFor(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
}

