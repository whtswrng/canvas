import {CONFIG, Drop, Item} from "../game";
import {generateNumberBetween} from "../utils/between";
import {generateItemsFromDropList} from "../utils/generate-drop-list";

export interface CellConfig {
    dropList: Array<Drop>,
    expRange: [number, number],
    name: string,
    attributes: CellAttributes,
    respawnTimeInMS: number,
    respawnReach: number,
    spawnCoordinates: Array<number>,
    isAttackable: boolean
}

export interface CellAttributes {
    power: number,
    speed: number,
    hp: number,
    energy: number,
    regeneration: number,
    exp: number,
    farm: number,
    craft: number,
    enchant: number
}

export class Cell {
    public socket?: any;
    public isMoving = false;
    public movementDegrees = 0;
    public items: Array<Item> = [];
    public baseAttributes: CellAttributes;
    public attributes: CellAttributes;
    private gameObject: any;
    private isAttacking = false;

    public constructor(protected instantiateGameObject: (cellConfig: CellConfig) => any, protected canvasSize: number, protected cellConfig: CellConfig) {
        this.baseAttributes = {...cellConfig.attributes};
        this.attributes = {...this.baseAttributes};
        this.respawn();
        this.initRegeneration();
    }

    private initRegeneration() {
        setInterval(() => {
            if(! this.isDead() && ! this.isAttacking) {
                const number = Math.round(this.attributes.regeneration / 2);
                this.attributes.hp += number;
                this.attributes.energy += number;

                if(this.attributes.hp > this.baseAttributes.hp) this.attributes.hp = this.baseAttributes.hp;
                if(this.attributes.energy > this.baseAttributes.energy) this.attributes.energy = this.baseAttributes.energy;
            }
        }, 3200);
    }

    public getGameObject() {
        return this.gameObject;
    }

    public getLevel() {
        if(this.attributes.exp < 1000) {
            return 1;
        } else if(this.attributes.exp >= 1000 && this.attributes.exp <= 2500) {
            return 2;
        }

        return 3;
    }

    public getAttributes() {
        return {...this.attributes, level: this.getLevel()};
    }

    public getItems() {
        return this.items;
    }

    public planRespawn(respawnFc: () => void) {
        setTimeout(() => {
            console.log('respawning!');
            this.respawn();
            respawnFc();
        }, 10000);
    }

    public generateDropItems(): Array<Item> {
        return generateItemsFromDropList(this.cellConfig.dropList);
    }

    public isAttackable(): boolean {
        return this.cellConfig.isAttackable;
    }

    public isHarvastable(): boolean {
        return ! this.isAttackable();
    }

    public generateExp() {
        return generateNumberBetween(this.cellConfig.expRange[0], this.cellConfig.expRange[1]);
    }

    public getName() {
        return this.cellConfig.name;
    }

    public addReward(items: Array<Item>, exp: number) {
        this.attributes.exp += exp;
        items.forEach((i) => {
            if(i.stackable) {
                const existingItem = this.items.find((_i) => _i.name === i.name);
                if(existingItem) {
                    existingItem.amount += i.amount;
                } else {
                    this.items.push(i);
                }
            } else {
                this.items.push(i);
            }
        });
    }

    private respawn() {
        this.gameObject = this.instantiateGameObject(this.cellConfig);
        this.gameObject._cell = this;
        this.resetAttributes();
    }

    private resetAttributes() {
        this.attributes = {...this.baseAttributes, exp: this.attributes.exp};
    }

    public receiveDamage(cell: Cell, power: number): boolean {
        if(this.isDead() || cell.isDead()) return false;

        let newHp = this.attributes.hp - power;
        if(newHp <= 0) {
            newHp = 0;
        }

        this.attributes.hp = newHp;
    }

    public attackTarget(target: Cell, attackAttribute: string): undefined | number {
        if(this.isBusy()) return;

        this.isAttacking = true;
        const damage = Math.round(generateNumberBetween(this.getAttributes()[attackAttribute] * 0.85, this.getAttributes()[attackAttribute] * 1.15));
        this.attributes.energy -= 4;
        target.receiveDamage(this, damage);

        setTimeout(() => this.isAttacking = false, CONFIG.attackingInterval);

        return damage;
    }

    public isBusy() {
        return this.isDead() || this.isAttacking || this.attributes.energy < 4;
    }

    public move(degrees: number) {
        this.isMoving = true;
        this.movementDegrees = degrees;
    }

    public isDead() {
        return this.attributes.hp <= 0;
    }

    public stop() {
        this.isMoving = false;
    }

    public tryToMove() {
        if(! this.isMoving) return;

        const gameObject = this.getGameObject();

        const movement = {
            degrees: this.movementDegrees,
            amount: this.attributes.speed
        };

        const angle = (movement.degrees - 90) / 180 * Math.PI;
        const left = gameObject.left + (movement.amount * Math.cos(angle));
        const top = gameObject.top + (movement.amount * Math.sin(angle));

        if(left <= 0 || left >= this.canvasSize - (gameObject.radius * 2) || top <= 0 || top >= this.canvasSize - (gameObject.radius * 2)) {
            return;
        }

        gameObject.left = left;
        gameObject.top = top;
        gameObject.setCoords();
    }
}