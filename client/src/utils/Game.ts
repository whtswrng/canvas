import {generateNumberBetween} from "./between";
import io from "socket.io-client";

export const CONFIG = {
    visibilityRadius: 300,
    attackingInterval: 1200
};

const listeners: any = {};

window.socket = io('http://localhost:3001');
window.game = {
    on: (event: string, cb) => {
        if (!listeners[event]) listeners[event] = {};
        listeners[event].push(cb);
        window.socket.on(event, (...args) => {
            if (listeners[event].find((_cb) => _cb === cb)) cb(...args)
        });
    },
    off: (event: string) => {
        listeners[event] = []
    },
    getAngleForObjects: (o1, o2) => {
        return window.game.getAngleForPoints(o1.left, o1.top, o2.left, o2.top);
    },
    getAngleForPoints: (x1, y1, x2, y2) => {
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }
};

export class Cell {
    private gameObject;

    constructor(private cell: string) {

    }

    public move(degrees: number) {
        window.socket.emit('MOVE', {cell: this.cell, degrees});
    }

    public setGameObject(gameObject: any) {
        this.gameObject = gameObject;
    }

    public attack(o) {
        return new Promise((res) => {
            this.moveToObject(o);
            const interval = setInterval(async() => {
                if(this.isCloseTo(o)) {
                    clearInterval(interval);
                    this.stop();
                    await penetrateObject('emitAttack', this, o);
                    res();
                }
            }, 600);
        });
    }

    public harvest(o) {
        return new Promise((res) => {
            this.moveToObject(o);
            const interval = setInterval(async() => {
                if(this.isCloseTo(o)) {
                    clearInterval(interval);
                    this.stop();
                    await penetrateObject('emitHarvest', this, o);
                    res();
                }
            }, 600);
        });
    }

    public moveToObject(o) {
        const angle = this.getAngleToObject(o);
        this.move(angle)
    }

    public getGameObject() {
        return this.gameObject;
    }

    public stop() {
        window.socket.emit('STOP', {cell: this.cell});
    }

    public emitAttack() {
        window.socket.emit('ATTACK', {cell: this.cell});
    }

    public isCloseTo(o) {
        const closeDistance = 20;
        return Math.abs(o.left - this.getGameObject().left) <= closeDistance && Math.abs(o.top - this.getGameObject().top) <= closeDistance;
    }

    public emitHarvest() {
        window.socket.emit('HARVEST', {cell: this.cell});
    }

    public getPosition() {
        return {left: this.getGameObject().left, top: this.getGameObject().top};
    }

    public async getAttributes() {
        return new Promise((res, rej) => {
            window.socket.emit('GET_ATTRIBUTES', {cell: this.cell}, (data) => res(data));
        });
    }

    public getAngleToObject(o1) {
        return window.game.getAngleForObjects(this.getPosition(), o1);
    }

    public async useItem(...args) {
        return new Promise((res, rej) => {
            window.socket.emit('USE_ITEM', {cell: this.cell, args: args}, (data) => res(data));
        });
    }

    public async getItems() {
        return new Promise((res, rej) => {
            window.socket.emit('GET_ITEMS', {cell: this.cell}, (data) => res(data));
        });
    }

    public async getEquippedItems() {
        return new Promise((res, rej) => {
            window.socket.emit('GET_ITEMS', {cell: this.cell}, (data) => {
                res(data.filter((d) => d.isEquipped));
            });
        });
    }

    public getShopItems() {
        return new Promise((res, rej) => {
            window.socket.emit('GET_SHOP_ITEMS', {cell: this.cell}, (data) => res(data));
        });
    }

    public getCraftItems() {
        return new Promise((res, rej) => {
            window.socket.emit('GET_CRAFT_ITEMS', {cell: this.cell}, (data) => res(data));
        });
    }

    public async buyItem(itemId: number) {
        return new Promise((res, rej) => {
            window.socket.emit('BUY_ITEM', {cell: this.cell, itemId});
        });
    }

    public async craftItem(itemId: number) {
        return new Promise((res, rej) => {
            window.socket.emit('CRAFT_ITEM', {cell: this.cell, itemId});
        });
    }

    public getCloseMonsters(c) {
        return c.getCloseObjects().filter((o) => o.type === 'MONSTER');
    }

    public getCloseLootableObjects(c) {
        return c.getCloseObjects().filter((o) => o.type === 'LOOTABLE_OBJECT');
    }

    public getCloseObjects() {
        const objects: Array<any> = [];

        window.canvas.getObjects().forEach((o) => {
            const gameObject = this.getGameObject();
            if (Math.abs(o.left - gameObject.left) <= CONFIG.visibilityRadius && Math.abs(o.top - gameObject.top) <= CONFIG.visibilityRadius) {
                objects.push({left: o.left, top: o.top, name: o._name, type: o._type});
            }
        });

        return objects;
    }
}

async function penetrateObject(method, c, o) {
    return new Promise((res) => {
        c[method]();
        const interval = setInterval(() => {
            c[method]();
            if( ! c.getCloseObjects().find((_o) => o.left === _o.left && o.top === _o.top)) {
                clearInterval(interval);
                res()
            }
        }, 500);
    });
}


window.c1 = new Cell('c1');
window.c2 = new Cell('c2');
window.c3 = new Cell('c3');


function runGameEngine() {
    const hitSound1 = new Audio('/sounds/hit.flac');
    const hitSound2 = new Audio('/sounds/hit2.flac');
    const harvestSound1 = new Audio('/sounds/harvest.wav');
    const harvestSound2 = new Audio('/sounds/harvest2.wav');
    const count1 = new Audio('/sounds/coin.wav');
    const count2 = new Audio('/sounds/coin2.wav');
    const monsterDead = new Audio('/sounds/monster_dead.wav');
    const itemEquipped = new Audio('/sounds/item_equipped.wav');
    const itemUnequipped = new Audio('/sounds/item_unequipped.wav');
    const levelUpSound = new Audio('/sounds/level_up.mp3');
    const itemUsed = new Audio('/sounds/item_used.mp3');

    window.socket.on('INFO', (data) => {
        console.info(`%c ${data}`,'background: #cce6ff; color: black');
    });

    window.socket.on('WARNING', (data) => {
        console.warn(`%c ${data}`,'');
    });

    window.socket.on('LEVEL_UP', (data) => {
        playSound(levelUpSound);
        console.info(
            `%c Player ${data.name} level up!`, 'background: #008080; color: white'
        );
    });

    window.socket.on('ITEM_USED', async(data) => {
        console.log(await window.c1.getAttributes());
        playSound(itemUsed);
        console.info(
            `%c Item used ${data.item.name}!`, 'background: #008080; color: white'
        );
    });

    window.socket.on('ITEM_EQUIPPED', (data) => {
        playSound(itemEquipped);
        console.info(
            `%c Player ${data.from} equipped item ${data.name}`, 'background: #005c99; color: white'
        );
    });

    window.socket.on('ITEM_UNEQUIPPED', (data) => {
        playSound(itemUnequipped);
        console.info(
            `%c Player ${data.from} unequipped item ${data.name}`, 'background: #99d6ff; color: black'
        );
    });

    window.socket.on('TARGET_HIT', (data) => {
        if(data.target.type === 'MONSTER') {
            generateNumberBetween(0, 1) === 0 ? playSound(hitSound1) : playSound(hitSound2);
        } else {
            generateNumberBetween(0, 1) === 0 ? playSound(harvestSound1) : playSound(harvestSound2);
        }

        console.info(
            `%c ${data.from.name} hits for ${data.damage} dmg to a ${data.target.name} (${data.target.attributes.hp})`, 'background: green; color: white'
        );

        if(data.from.attributes.energy <= 20) {
            console.warn(
                `%c Player ${data.from.name} has low energy (${data.from.attributes.energy})`, 'color: black'
            );
        }
    });
    window.socket.on('TARGET_DEAD', async (data) => {
        console.info(
            `%c ${data.target.name} is destroyed. Received ${data.exp} exp and drop is: `, 'background: gold; color: black'
        );
        data.drop.forEach((d) => {
                console.info(
                    `%c    ${d.amount}x ${d.name} (${d.id})`, 'background:  #fff0b3; color: black'
                );
        });
        setTimeout(() => {
            if(data.target.type === 'MONSTER') {
                playSound(monsterDead);
            }
        }, 150);
        generateNumberBetween(0, 1) === 0 ? playSound(count1) : playSound(count2);
    });

}

function playSound(sound) {
    sound.currentTime = 0;
    sound.volume = 0.5;
    sound.play();
}

runGameEngine();


export default () => {
}
