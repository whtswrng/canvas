import {CONFIG} from "../game";
import {generateNumberBetween} from "../utils/between";

export class Cell {
    public socket?: any;
    public isMoving = false;
    public movementDegrees = 0;
    public items = [];
    public baseAttributes = {
        power: 10,
        speed: 3.5,
        hp: 50,
        energy: 50,
        regeneration: 4
    };
    public attributes = {...this.baseAttributes};
    public specialization = {
        farm: 50,
        craft: 40,
        enchant: 40
    };
    private gameObject: any;
    private isAttacking = false;

    public constructor(protected instantiateGameObject: () => any, public name: string, protected canvasSize: number) {
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
        }, 2000);
    }

    public getGameObject() {
        return this.gameObject;
    }

    public getSpecialization() {
        return this.specialization;
    }

    public getAttributes() {
        return this.attributes;
    }

    public getItems() {
        return this.items;
    }

    public tryToRespawn(respawnFc: () => void) {
        setTimeout(() => {
            console.log('respawning!');
            this.respawn();
            respawnFc();
        }, 10000);
    }

    public generateDrop() {
        return [];
    }

    private respawn() {
        this.gameObject = this.instantiateGameObject();
        this.gameObject._cell = this;
        this.resetAttributes();
    }

    private resetAttributes() {
        this.attributes = {...this.baseAttributes};
    }

    public receiveDamage(cell: Cell, power: number): boolean {
        if(this.isDead() || cell.isDead()) return false;

        let newHp = this.attributes.hp - power;
        if(newHp <= 0) {
            newHp = 0;
        }

        this.attributes.hp = newHp;
    }

    public attackTarget(target: Cell): undefined | number {
        if( ! this.canAttack() || target.isDead()) return;

        this.isAttacking = true;
        const damage = Math.round(generateNumberBetween(this.getAttributes().power * 0.85, this.getAttributes().power * 1.15));
        this.attributes.energy -= 4;
        target.receiveDamage(this, damage);

        setTimeout(() => this.isAttacking = false, CONFIG.attackingInterval);

        return damage;
    }

    public canAttack() {
        return ! this.isDead() && ! this.isAttacking && this.attributes.energy >= 4;
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