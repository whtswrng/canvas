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
    this.lastPathIndex = -1;
    this.lastSpellIndex = -1;
    this.lastState = null;
    this.enabled = false;
  }

  setControls(controls) {
    this.controls = controls;
    this.lastPathIndex = -1;
    this.lastSpellIndex = -1;
    this.lastState = null;
    this.resetBasicActionsInterval()
    this.handleControls(this.entity.state);
    this.handleQuickControls();
  }

  init() {
    this.entity.registerStateCb(() => this.handleControls());
    this.handleControls(this.entity.state);
    this.handleQuickControls();
  }

  handleQuickControls() {
    const autoDefendControl = this.controls.find((c) => c.type === 'autoDefend');
    if(autoDefendControl) {
      this.entity.autoDefend = Boolean(autoDefendControl.actionValue)
    }

    const controlsControl = this.controls.find((c) => c.type === 'controls');
    console.log(controlsControl)
    if(controlsControl) {
      this.enabled = controlsControl.actionValue;
    }
  }

  handleControls() {
    setTimeout(() => {
      const newState = this.entity.state;
      if (this.lastState === newState || !this.enabled) return;
      this.lastState = newState;


      if ([STATE.IDLE].includes(newState)) {
        this.handlePathingActions();
        this.handleBasicActions();
      }
      if ([STATE.ATTACKING].includes(newState)) {
        this.handleCombatActions();
      }
      if ([STATE.MOVING].includes(newState)) {
        this.handleBasicActions();
      }
    }, 0);
  }

  handleCombatActions() {
    this.resetBasicActionsInterval()
    const controls = this.controls.filter((c) => c.type === "combat");

    for (const c of controls) {
    }
  }

  resetBasicActionsInterval() {
    clearInterval(this.basicActionsInterval)
    this.basicActionsInterval = null;
  }

  handlePathingActions() {
    const controls = this.controls.filter((c) => c.type === "pathing");

    if (this.lastPathIndex >= controls.length - 1) this.lastPathIndex = -1;

    for (let i = this.lastPathIndex+1; i < controls.length; i++) {
      const control = controls[i];
      console.log('iterating pathing...', i)
      if (control) {
        const [x, y] = control.actionValue?.trim()?.split(" ");
        if(this.entity.x === parseInt(x) && this.entity.y === parseInt(y)) continue;
        const a = new ActionControl(control, this.entity);
        if (a.isConditionMet()) {
          this.lastPathIndex = i;
          a.execute();
          return
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
        // if (this.isConditionMet(c)) {

        // }
      }
    }, 200);
  }

  handleCombatAction(action) {
    switch (action.actionType) {
      case "useSpell":
        this.useSpell(action.actionValue);
        break;
      default:
        console.log(`Unknown combat action type: ${action.actionType}`);
    }
  }

  handleBasicAction(action) {
    switch (action.actionType) {
      case "attackEnemy":
        this.attackEnemy(action.conditionValue);
        break;
      default:
        console.log(`Unknown basic action type: ${action.actionType}`);
    }
  }

  handlePathingAction(action) {
    switch (action.actionType) {
      case "goToPosition":
        const [x, y] = action.actionValue.split(" ").map(Number);
        this.goToPosition(x, y);
        break;
      default:
        console.log(`Unknown pathing action type: ${action.actionType}`);
    }
  }

  goToPosition(x, y) {
    this.position = { x, y };
    console.log(
      `Entity moved to position: (${this.position.x}, ${this.position.y})`
    );
  }

  attackEnemy(enemyLevel) {
    if (enemyLevel < 10) {
      console.log("Attacking enemy!");
    } else {
      console.log("Enemy level too high, not attacking.");
    }
  }

  useSpell(spellName) {
    console.log(`Using ${spellName} spell!`);
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
