import {Cell} from "./cell";

export class MonsterCell extends Cell {

    public constructor(protected instantiateGameObject: () => any, public name: string, protected canvasSize: number) {
        super(instantiateGameObject, name, canvasSize);
    }

}