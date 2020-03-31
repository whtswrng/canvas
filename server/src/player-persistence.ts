import {Cell, CellAttributes} from "./cell/cell";
import * as fs from "fs";
import {Item} from "./game";
import {Files} from "./Files";
import {PlayerCell} from "./cell/player-cell";

export interface PersistentCharacter {
    name: string,
    items: Array<Item>,
    exp: number,
    attributes: Partial<CellAttributes>,
}

export interface PlayerConfig {
    name: string,
    characters: Array<PersistentCharacter>,
    files: Array<{name: string, content: string}>
}

export class PlayerPersistence {

    private filePath = __dirname + '/files/' + this.playerName.replace('\s', '_').toLowerCase() + '.json';

    constructor(private cells: Array<PlayerCell>, private playerName: string, private files: Files) {
        this.initSaving();
        this.files.initFiles(this.getPlayerConfig()?.files);
    }

    public getCells(): Array<PlayerCell> {
        return this.cells;
    }

    public getFiles(): Files {
        return this.files;
    }

    private initSaving() {
        setInterval(() => {
            fs.writeFileSync(this.filePath, JSON.stringify({
                name: this.playerName,
                characters: this.cells.map((c) => ({
                   name: c.getName(),
                   items: c.getItems(),
                   exp: c.getAttributes().exp,
                   attributes: {
                       farm: c.rawAttributes.farm,
                       craft: c.rawAttributes.craft,
                       enchant: c.rawAttributes.enchant,
                   }
                })),
                files: this.files.getFiles()
            } as PlayerConfig));
        }, 10000);
    }

    public getPlayerConfig(): PlayerConfig | undefined {
        if(fs.existsSync(this.filePath)) {
            return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        }
    }

}