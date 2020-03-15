window.game = {
    moveAngle: (degree: number) => {
        if (!window.socket) return;
        window.socket.emit('MOVE_ANGLE', degree);
    },
    on: (...args) => {
        window.socket.on(...args);
    },
    off: (...args) => {
        window.socket.off(...args);
    },
    removeIntervals: () => {
        for (let i = 1; i < 30; i++) {
            console.log(window.clearInterval(i));
        }
    }
};

export class Cell {

    constructor(private cell: string) {

    }

    public move(degrees: number) {
        window.socket.emit('MOVE', {cell: this.cell, degrees});
    }

    public stop() {
        window.socket.emit('STOP', {cell: this.cell});
    }

    public attack() {
        window.socket.emit('ATTACK', {cell: this.cell});
    }

    public harvest() {
        window.socket.emit('HARVEST', {cell: this.cell});
    }

    public async getAttributes() {
        return new Promise((res, rej) => {
            window.socket.emit('GET_ATTRIBUTES', {cell: this.cell}, (data) => res(data));
        });
    }

    public async getItems() {
        return new Promise((res, rej) => {
            window.socket.emit('GET_ITEMS', {cell: this.cell}, (data) => res(data));
        });
    }

    public async getSpecialization() {
        return new Promise((res, rej) => {
            window.socket.emit('GET_SPECIALIZATION', {cell: this.cell}, (data) => res(data));
        });
    }

    public getObjectsNearby() {
        return [];
    }
}

window.c1 = new Cell('c1');
window.c2 = new Cell('c2');
window.c3 = new Cell('c3');

export default () => { }
