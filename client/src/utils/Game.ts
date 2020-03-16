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

    public harvestObject(o) {
        return new Promise((res) => {
            this.moveToObject(o);
            const interval = setInterval(async() => {
                if(this.isCloseTo(o)) {
                    clearInterval(interval);
                    this.stop();
                    await penetrateObject('harvest', this, o);
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

    public attack() {
        window.socket.emit('ATTACK', {cell: this.cell});
    }

    public isCloseTo(o) {
        const closeDistance = 20;
        return Math.abs(o.left - this.getGameObject().left) <= closeDistance && Math.abs(o.top - this.getGameObject().top) <= closeDistance;
    }

    public harvest() {
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

    public getObjectsNearby() {
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
            if( ! c.getObjectsNearby().find((_o) => o.left === _o.left && o.top === _o.top)) {
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
    const hitSound2 = new Audio('/sounds/hit1.flac');
    const hitSound1 = new Audio('/sounds/hit2.flac');
    const deadSound = new Audio('/sounds/object_dead.wav');
    const itemEquipped = new Audio('/sounds/item_equipped.wav');
    const itemUnequipped = new Audio('/sounds/item_unequipped.wav');

    window.socket.on('ITEM_EQUIPPED', (data) => {
        itemEquipped.play();
    });

    window.socket.on('ITEM_UNEQUIPPED', (data) => {
        itemUnequipped.play();
        console.log(
            `%c ${data.from} => ${data.target} (${data.damage})`, 'background: green; color: red'
        );
    });

    window.socket.on('TARGET_HIT', (data) => {
        generateNumberBetween(0, 1) === 0 ? hitSound1.play() : hitSound2.play();

        console.log(data);
        console.log(
            `%c ${data.from} => ${data.target} (${data.damage})`, 'background: green; color: black'
        );
    });
    window.socket.on('TARGET_DEAD', async (data) => {
        // setTimeout(() => deadSound.play(), 350);
    });

}

runGameEngine();


export default () => {
}
