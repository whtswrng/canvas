import {Cell, CellConfig} from "./cell";

export class ObjectCell extends Cell {

    constructor(public instantiateGameObject: () => any, protected canvasSize: number, protected cellConfig: CellConfig) {
        super(instantiateGameObject, canvasSize, cellConfig)
    }

}