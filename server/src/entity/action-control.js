const { map } = require("../globals");

class ActionControl {
  constructor(control, entity) {
    this.control = control;
    this.entity = entity;
    this.conditionResult = null;
  }

  isConditionMet() {
    if (
      !this.control.condition ||
      !this.control.conditionValue ||
      !this.control.conditionComparisonValue
    )
      return true;

    const attr = {
      ifHp: (operatorFn, compValue) => operatorFn(compValue, this.entity.hp),
      ifTargetLvl: (operatorFn, compValue) => {
        const type = this.entity.type === "mob" ? "player" : "mob";
        const enemy = this.entity.getClosestTarget(type, 6);
        if (enemy && operatorFn(compValue, enemy.level)) {
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

    const result = attr[this.control.condition](
      operator[this.control.conditionValue],
      compValue
    );
    this.conditionResult = result;
    return !!result;
  }

  execute() {
    const actions = {
      goToPosition: this.execGoTo.bind(this),
      attackEnemy: this.attack.bind(this),
      gatherObject: this.gatherObject.bind(this),
    };
    actions[this.control.actionType]?.();
  }

  execGoTo() {
    const [x, y] = this.control.actionValue.trim().split(" ");
    console.log("go to", x, y);
    this.entity.goToPosition(parseInt(x), parseInt(y));
  }

  attack() {
    if (!this.conditionResult) return;
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
