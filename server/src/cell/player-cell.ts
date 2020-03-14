import {Cell} from "./cell";

export class PlayerCell extends Cell {

    public constructor(protected instantiateGameObject: () => any, public name: string, public socket: any, protected canvasSize: number) {
        super(instantiateGameObject, name, canvasSize);
    }

}