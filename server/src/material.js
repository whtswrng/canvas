const { createObject } = require("./game-map");
const { map } = require("./globals");

class Material {
    constructor(type, hp, x, y, respawnInS = 5, bg, _static, dropItem) {
        this.type = type;
        this.hp = hp;
        this.originalHp = hp;
        this.x = x;
        this.y = y;
        this.respawnInS = respawnInS;
        this.bg = bg;
        this._static = _static;
        this.harvested = false
        this.dropItem = dropItem
    }

    placeMaterial() {
        map.placeObject(this.x, this.y, createObject(this.type, this.bg, this._static, this))
    }

    harvest(weapon) {
        if (this.hp <= 0) {
            map.removeObject(this.x, this.y);
            this.respawn();
            this.harvested = true;
            return { type: this.dropItem, amount: 10 };
        }

        this.hp -= 10;
    }

    respawn() {
        setTimeout(() => {
            this.placeMaterial()
            this.harvested = false;
            this.hp = this.originalHp
        }, this.respawnInS * 1000);
    }

}

module.exports = {
    Material
}