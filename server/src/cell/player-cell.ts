import {Cell, CellConfig} from "./cell";

export class PlayerCell extends Cell {

    public constructor(protected instantiateGameObject: () => any, public socket: any, protected canvasSize: number, protected cellConfig: CellConfig) {
        super(instantiateGameObject, canvasSize, cellConfig);
    }

    public setSocket(socket: any) {
        this.socket = socket;
    }
}