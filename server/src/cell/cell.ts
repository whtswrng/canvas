import {CONFIG, Drop, Item} from "../game";
import {generateNumberBetween} from "../utils/between";
import {generateItemsFromDropList} from "../utils/generate-drop-list";

export interface CellConfig {
    dropList: Array<Drop>,
    expRange: [number, number],
    name: string,
    type: 'MONSTER' | 'OBJECT' | 'LOOTABLE_OBJECT',
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
    private rawAttributes: CellAttributes;
    private attributes: {hp: number, energy: number, exp: number};
    private gameObject: any;
    private isAttacking = false;

    public constructor(protected instantiateGameObject: (cellConfig: CellConfig) => any, protected canvasSize: number, protected cellConfig: CellConfig) {
        this.rawAttributes = {...cellConfig.attributes};
        this.respawn();
        this.initRegeneration();
    }

    private initRegeneration() {
        setInterval(() => {
            if(! this.isDead() && ! this.isAttacking) {
                const baseAttributes = this.getBaseAttributes();
                const number = Math.round(baseAttributes.regeneration / 2);
                this.attributes.hp += number;
                this.attributes.energy += number;

                if(this.attributes.hp > baseAttributes.hp) this.attributes.hp = baseAttributes.hp;
                if(this.attributes.energy > baseAttributes.energy) this.attributes.energy = baseAttributes.energy;
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

    private getBaseAttributes() {
        const attributes = {...this.rawAttributes};
        const items = this.getEquippedItems();

        items.forEach((i) => {
            if(i.attributes) {
                for (let key in i.attributes) {
                    attributes[key] += i.attributes[key];
                }
            }
        });

        return attributes;
    }

    public getAttributes() {
        const baseAttributes = this.getBaseAttributes();
        return {...baseAttributes, ...this.attributes, level: this.getLevel()};
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
        this.gameObject._name = this.getName();
        this.gameObject._type = this.cellConfig.type;
        this.gameObject._isAttackable = this.isAttackable();
        this.resetAttributes();
    }

    private resetAttributes() {
        const baseAttributes = this.getBaseAttributes();
        this.attributes = {hp: baseAttributes.hp, energy: baseAttributes.energy, exp: this.attributes?.exp || 0};
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

    public getEquippedItems(): Array<Item> {
        return this.items.filter((i) => i.isEquipped);
    }

    public useItem(itemId?: number, itemId2?: number) {
        if(! itemId) return;

        const item = this.items.find((i) => i.id === itemId);

        if(item) {
            if(item.canEquip) {
                if(item.isEquipped) {
                    item.isEquipped = false;
                    if(this.socket) this.socket.emit('ITEM_UNEQUIPPED', {from: this.getName(), item})
                } else {
                    item.isEquipped = true;
                    if(this.socket) this.socket.emit('ITEM_EQUIPPED', {from: this.getName(), item})
                }
            }
        }
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
        const baseAttributes = this.getBaseAttributes();

        const movement = {
            degrees: this.movementDegrees,
            amount: baseAttributes.speed
        };

        const angle = movement.degrees / 180 * Math.PI;
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