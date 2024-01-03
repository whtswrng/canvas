const { ActionControl } = require("./action-control");
const { STATE } = require("./entity");

// [
//   {
//     type: "basic",
//     actionType: "attackEnemy",
//     actionValue: "",
//     condition: "ifTargetLvl",
//     conditionValue: "isLowerThan",
//     conditionComparisonValue: "10",
//   },
//   {
//     type: "pathing",
//     actionType: "goToPosition",
//     actionValue: "40 50",
//     condition: "",
//     conditionValue: "",
//     conditionComparisonValue: "",
//   },
//   {
//     type: "combat",
//     actionType: "useSpell",
//     actionValue: "spell 1",
//     condition: "ifHp",
//     conditionValue: "isLowerThan",
//     conditionComparisonValue: "22",
//   },
// ];

class EntityControl {
  constructor(entity, controls = []) {
    this.entity = entity;
    this.controls = controls;
    this.basicActionsInterval = null;
    this.combatActionsInterval = null;
    this.lastPathIndex = -1;
    this.lastSpellIndex = -1;
    this.lastState = null;
    this.enabled = false;
  }

  disconnect() {
    this.entity.disconnect();
    this.enabled = false;
  }

  setControls(controls) {
    this.controls = controls;
    this.lastPathIndex = -1;
    this.lastSpellIndex = -1;
    this.lastState = null;
    this.resetIntervals();
    this.handleControls(this.entity.state);
    this.handleQuickControls();
  }

  init() {
    this.entity.registerStateCb(() => this.handleControls());
    this.handleControls(this.entity.state);
    this.handleQuickControls();
  }

  handleQuickControls() {
    const autoDefendControl = this.controls.find(
      (c) => c.type === "autoDefend"
    );
    if (autoDefendControl) {
      this.entity.autoDefend = Boolean(autoDefendControl.actionValue);
    }

    const controlsControl = this.controls.find((c) => c.type === "controls");
    if (controlsControl) {
      this.enabled = controlsControl.actionValue;
    }
  }

  handleControls() {
    setTimeout(() => {
      const newState = this.entity.state;
      if (this.lastState === newState || !this.enabled) return;
      this.lastState = newState;

      console.log("newState", this.entity.name, newState);
      if ([STATE.IDLE].includes(newState)) {
        this.handlePathingActions();
        this.handleBasicActions();
      }
      if ([STATE.ATTACKING].includes(newState)) {
        this.handleCombatActions();
      }
      if ([STATE.GATHERING, STATE.ATTACKING, STATE.DEATH].includes(newState)) {
        this.resetIntervals();
      }
      if ([STATE.MOVING].includes(newState)) {
        this.handleBasicActions();
      }
    }, 0);
  }

  resetIntervals() {
    clearInterval(this.basicActionsInterval);
    clearInterval(this.combatActionsInterval);
    this.basicActionsInterval = null;
    this.combatActionsInterval = null;
  }

  handlePathingActions() {
    const controls = this.controls.filter((c) => c.type === "pathing");

    if (this.lastPathIndex >= controls.length - 1) this.lastPathIndex = -1;

    for (let i = this.lastPathIndex + 1; i < controls.length; i++) {
      const control = controls[i];
      if (control) {
        if (control.actionType === "goToPosition") {
          const [x, y] = control.actionValue?.trim()?.split(" ");
          if (this.entity.x === parseInt(x) && this.entity.y === parseInt(y))
            continue;
          const a = new ActionControl(control, this.entity);
          if (a.isConditionMet()) {
            this.lastPathIndex = i;
            return a.execute();
          }
        }
        if (control.actionType === "followPlayer") {
          const a = new ActionControl(control, this.entity);
          if (a.isConditionMet()) {
            return a.execute();
          }
        }
      }
    }
  }

  handleBasicActions() {
    if (this.basicActionsInterval) return;
    this.basicActionsInterval = setInterval(() => {
      const controls = this.controls.filter((c) => c.type === "basic");

      for (const c of controls) {
        const a = new ActionControl(c, this.entity);
        if (a.isConditionMet()) {
          a.execute();
        }
      }
    }, 200);
  }

  handleCombatActions() {
    if (this.combatActionsInterval) return;
    this.combatActionsInterval = setInterval(() => {
      const controls = this.controls.filter((c) => c.type === "combat");

      for (const c of controls) {
        const a = new ActionControl(c, this.entity);
        if (a.isConditionMet()) {
          a.execute();
        }
      }
    }, 200);
  }

}

module.exports = {
  EntityControl,
};

// // Example Usage
// const entity = { hp: 100, mana: 50, inventory: ["Sword", "Shield"] };

// const actions = [
//   { type: "combat", actionType: "useSpell", actionValue: "spell 1" },
//   {
//     type: "basic",
//     actionType: "attackEnemy",
//     conditionValue: "isLowerThan",
//     conditionComparisonValue: "10",
//   },
//   { type: "pathing", actionType: "goToPosition", actionValue: "22 55" },
//   { type: "pathing", actionType: "goToPosition", actionValue: "40 50" },
//   { type: "pathing", actionType: "goToPosition", actionValue: "100 60" },
//   { type: "pathing", actionType: "goToPosition", actionValue: "40 50" },
// ];

// const entityControl = new EntityControl(entity, actions);
// entityControl.init();
