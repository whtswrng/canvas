import {Cell, CellConfig} from "./cell";

export class MonsterCell extends Cell {

    public constructor(protected instantiateGameObject: () => any, protected canvasSize: number, protected cellConfig: CellConfig) {
        super(instantiateGameObject, canvasSize, cellConfig);
    }

}