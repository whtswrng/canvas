const { map } = require("../globals");

class ActionControl {
  constructor(control, entity) {
    this.control = control;
    this.entity = entity;
    this.selectedEntity = null;
  }

  isConditionMet() {
    if (
      !this.control.condition ||
      !this.control.conditionValue ||
      !this.control.conditionComparisonValue
    )
      return true;

    const attr = {
      ifHp: () => this.entity.hp,
      ifTargetLvl: () => {
        const type = this.entity.type === "mob" ? "player" : "mob";
        const enemy = this.entity.getClosestTarget(type, 6);
        if (enemy) {
          this.selectedEntity = enemy;
          console.log("here", enemy.level);
          return enemy.level;
        }
        return null;
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

    return operator[this.control.conditionValue](
      compValue,
      attr[this.control.condition]()
    );
  }

  execute() {
    const actions = {
      goToPosition: this.execGoTo.bind(this),
      attackEnemy: this.attack.bind(this),
    };
    actions[this.control.actionType]?.();
  }

  execGoTo() {
    const [x, y] = this.control.actionValue.trim().split(" ");
    console.log("go to", x, y);
    this.entity.goToPosition(parseInt(x), parseInt(y));
  }

  attack() {
    if (!this.selectedEntity) return;
    this.entity.attackEnemy(this.selectedEntity);
    this.selectedEntity = null;
  }
}

module.exports = {
  ActionControl,
};
