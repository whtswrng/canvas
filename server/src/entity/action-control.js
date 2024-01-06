const { map } = require("../globals");
const { ShopInteraction } = require("../interactions/shop-interaction");
const { StorageInteraction } = require("../interactions/storage-interaction");
const { parsePositionFromString, calculatePercentage } = require("../utils");

class ActionControl {
  constructor(control, entity, tempData) {
    this.control = control;
    this.entity = entity;
    this.conditionResult = null;
    this.tempData = tempData;
  }

  isConditionMet() {
    if (!this.control.condition || !this.control.conditionValue || !this.control.conditionComparisonValue) return true;

    const assertPercentage = (attr, operatorFn, compValue) => {
      if (compValue.endsWith("%")) {
        compValue = compValue.slice(0, -1);
        const valueInPercentage = calculatePercentage(this.entity[attr], this.entity.getAttrs()[attr]);
        return operatorFn(compValue, valueInPercentage);
      } else {
        return operatorFn(compValue, this.entity[attr]);
      }
    };

    const attr = {
      ifHp: (operatorFn, compValue) => assertPercentage("hp", operatorFn, compValue),
      ifMana: (operatorFn, compValue) => assertPercentage("mana", operatorFn, compValue),
      ifMyPosition: (operatorFn, compValue) => {
        const pos = parsePositionFromString(compValue);
        return this.entity.x === pos[0] && this.entity.y === pos[1];
      },
      ifItemInInventory: (operatorFn, compValue) => {
        const [quantity, ...rest] = compValue?.trim()?.split(" ");
        let amount = parseInt(quantity);
        let itemName = "";

        if (Number.isInteger(amount)) {
          itemName = rest.join(" ");
        } else {
          itemName = compValue?.trim?.();
          amount = 1;
        }

        const items = this.entity.inventory.getItems().filter((it) => it.name === itemName);
        const totalAmount = items.reduce((acum, cur) => acum + (cur.amount ?? 1), 0);

        return operatorFn(amount, totalAmount);
      },
      ifTargetLvl: (operatorFn, compValue) => {
        compValue = parseInt(compValue);
        const type = this.entity.type === "mob" ? "player" : "mob";
        const enemy = this.entity.getClosestTarget(type, this.entity.type === "player" ? 5 : 4);
        if (enemy && operatorFn(compValue, enemy.getLevel())) {
          return enemy;
        }
        return null;
      },
      ifTargetName: (operatorFn, compValue) => {
        if (this.control.actionType === "gatherObject") {
          const materials = this.entity.getNearbyMaterials();

          for (const m of materials) {
            if (operatorFn(m.name, compValue)) {
              this.conditionResult = m;
              return m;
            }
          }
        }
      },
    };
    const operator = {
      isLowerThan: (val, subject) => subject < val,
      isHigherThan: (val, subject) => subject > val,
      isEqual: (val, subject) => val == subject,
    };

    const compValue = this.control.conditionComparisonValue;
    if (compValue && compValue.endsWith("%")) {
      // TODO convert %!
    }

    const result = attr[this.control.condition](operator[this.control.conditionValue], compValue);
    this.conditionResult = result;
    return !!result;
  }

  execute() {
    const actions = {
      goToPosition: this.execGoTo.bind(this),
      followPlayer: this.follow.bind(this),
      attackEnemy: this.attack.bind(this),
      gatherObject: this.gatherObject.bind(this),
      useItem: this.useItem.bind(this),
      getItem: this.getItem.bind(this),
      storeItem: this.storeItem.bind(this),
      attackFriendlyTarget: this.attackFriendlyTarget.bind(this),
      transitionTo: this.transitionTo.bind(this),
    };
    return actions[this.control.actionType]?.();
  }

  transitionTo() {
    this.entity.user.transitionTo(this.entity.id, this.control.actionValue);
  }

  attackFriendlyTarget() {
    this.entity.attackFriendlyTarget(this.control.actionValue);
  }

  useItem() {
    this.entity.useItemByName(this.control.actionValue);
  }

  getItem() {
    const interactable = this.entity.getClosestInteractable(3);
    const itemName = this.control.actionValue;

    if (!interactable || !itemName) return;
    if (!this.tempData.interactables) this.tempData.interactables = [];
    if (this.tempData.interactables.includes(interactable)) return;

    const data = interactable.interact(this.entity);

    if (interactable.interaction instanceof ShopInteraction) {
      const optionIndex = data.options.findIndex((o) => o.item.name === itemName);
      if (optionIndex !== -1) interactable.handleInteraction(this.entity, { data: { optionIndex } });
    }
    if (interactable.interaction instanceof StorageInteraction) {
      const storedItems = data.storedItems;

      let itemsToWithdraw = [];
      if (itemName === "*") {
        itemsToWithdraw = storedItems;
      } else {
        const item = storedItems.find((i) => i.name === itemName)?.id;
        console.log(storedItems);
        itemsToWithdraw = [item];
      }

      interactable.handleInteraction(this.entity, { data: { itemsToWithdraw } });
    }
    this.tempData.interactables.push(interactable);
  }

  storeItem() {
    const interactable = this.entity.getClosestInteractable(3);
    const itemName = this.control.actionValue;

    if (!interactable || !itemName) return;
    if (!this.tempData.interactables) this.tempData.interactables = [];
    if (this.tempData.interactables.includes(interactable)) return;

    interactable.interact(this.entity);

    if (interactable.interaction instanceof StorageInteraction) {
      let itemsToStore = [];
      if (itemName === "*") {
        itemsToStore = this.entity.inventory
          .getItems()
          .filter((it) => !it.equiped)
          .map((i) => i.id);
      } else {
        itemsToStore = this.entity.inventory
          .getItems()
          .filter((i) => i.name === itemName && !i.equiped)
          .map((i) => i.id);
      }

      interactable.handleInteraction(this.entity, { data: { itemsToStore } });
    }
    this.tempData.interactables.push(interactable);
    // todo
  }

  follow() {
    this.entity.followPlayer(this.control.actionValue);
  }

  execGoTo() {
    const [x, y] = this.control.actionValue.trim().split(" ");
    return this.entity.goToPosition(parseInt(x), parseInt(y));
  }

  attack() {
    if (this.conditionResult === null || typeof this.conditionResult !== "object") {
      const type = this.entity.type === "mob" ? "player" : "mob";
      this.conditionResult = this.entity.getClosestTarget(type);
    }
    if (!this.conditionResult) return; // no enemy found
    console.log("=======,", this.conditionResult);
    this.entity.attackEnemy(this.conditionResult);
    this.conditionResult = null;
  }

  gatherObject() {
    if (!this.conditionResult) return;
    this.entity.gather(this.conditionResult.x, this.conditionResult.y);
    this.conditionResult = null;
  }
}

module.exports = {
  ActionControl,
};
