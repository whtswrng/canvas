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

class EntityController {
  constructor(entity, controls = [], controlPanel = []) {
    this.entity = entity;
    this.currentControls = { name: "foo", controls };
    this.controlPanel = controlPanel;
    this.basicActionsInterval = null;
    this.combatActionsInterval = null;
    this.transitionInterval = null;
    this.nextPathIndex = 0;
    this.lastSpellIndex = -1;
    this.lastState = null;
    this.enabled = false;
    this.originalPosition = [];
    this.returningBackFromFight = false;

    this.controlsEnabled = false;
    this.autoDefendEnabled = false;
    this.pvpEnabled = false;
    this.tempData = {};
  }

  disconnect() {
    this.entity.disconnect();
    this.enabled = false;
  }

  refreshQuickControls() {
    this.handleQuickControls();
  }

  setCurrentControls(name, controls) {
    this.currentControls = { name, controls };
    this.nextPathIndex = 0;
    this.lastSpellIndex = -1;
    this.lastState = null;
    this.resetIntervals();
    this.handleQuickControls();
    this.handleControls(this.entity.state);
    this.entity.connection.emitActiveControlPanel(name);
  }

  init() {
    this.entity.registerStateCb(() => this.handleControls());
    this.handleControls(this.entity.state);
    this.handleQuickControls();
    this.originalPosition = [this.entity.x, this.entity.y];
    this.handleTransitions();
  }

  handleTransitions() {
    if (this.transitionInterval !== null) return;
    this.transitionInterval = setInterval(() => {
      if ([STATE.GATHERING, STATE.ATTACKING].includes(this.entity.state)) return;
      const controls = this.currentControls?.controls?.filter?.((c) => c.type === "transition");

      for (const c of controls) {
        const a = new ActionControl(c, this.entity);
        if (a.isConditionMet()) {
          a.execute();
        }
      }
    }, 200);
  }

  handleQuickControls() {
    this.entity.autoDefend = this.autoDefendEnabled;
    this.enabled = this.controlsEnabled;
    if (!this.enabled) {
      this.entity.connection.emitActiveControlPanel("");
    }
  }

  handleControls() {
    const newState = this.entity.state;
    setTimeout(() => {
      if (this.lastState === newState || !this.enabled) return;
      this.lastState = newState;
      this.tempData = {};

      console.log("newState", this.entity.name, newState, this.returningBackFromFight);
      if ([STATE.IDLE].includes(newState)) {
        this.resetCombatInterval();
        this.handlePathingActions();
        if (!this.returningBackFromFight) this.handleBasicActions(); // do not start anything crazy when returning to its path
      }
      if ([STATE.ATTACKING].includes(newState)) {
        this.originalPosition = [this.entity.x, this.entity.y];
        this.resetBasicActionsInterval();
        this.handleCombatActions();
      }
      if ([STATE.GATHERING, STATE.ATTACKING, STATE.DEATH].includes(newState)) {
        this.resetBasicActionsInterval();
      }
      if ([STATE.MOVING].includes(newState)) {
        this.resetCombatInterval();
        if (!this.returningBackFromFight) this.handleBasicActions(); // do not start anything crazy when returning to its path
      }
    }, 0);
  }

  resetBasicActionsInterval() {
    clearInterval(this.basicActionsInterval);
    this.basicActionsInterval = null;
  }

  resetCombatInterval() {
    clearInterval(this.combatActionsInterval);
    this.combatActionsInterval = null;
  }

  resetIntervals() {
    this.resetBasicActionsInterval();
    this.resetCombatInterval();
  }

  async handlePathingActions() {
    const controls = this.currentControls?.controls?.filter?.((c) => c.type === "pathing");

    console.log("handle pathing", this.nextPathIndex);
    for (let i = this.nextPathIndex; i <= controls.length; i++) {
      console.log("tick");
      const control = controls[i];
      const a = new ActionControl(control, this.entity);
      if (control) {
        if (!a.isConditionMet()) continue;

        if (control.actionType === "goToPosition") {
          const [x, y] = control.actionValue?.trim()?.split(" ");
          if (this.entity.x === parseInt(x) && this.entity.y === parseInt(y)) {
            console.log("this is the problematic branch!");
            continue;
          }
          await a.execute();
          if (this.entity.calculateDistance(this.entity.x, this.entity.y, x, y) <= 1) {
            this.returningBackFromFight = false;
            this.nextPathIndex += 1;
            if (this.nextPathIndex >= controls.length) this.nextPathIndex = 0;
          }
          return;
        }

        return a.execute();
      }
    }
  }

  handleBasicActions() {
    if (this.basicActionsInterval) return;
    this.basicActionsInterval = setInterval(() => {
      const controls = this.currentControls?.controls?.filter?.((c) => c.type === "basic");

      for (const c of controls) {
        const a = new ActionControl(c, this.entity, this.tempData);
        if (a.isConditionMet()) {
          a.execute();
        }
      }
    }, 200);
  }

  handleCombatActions() {
    if (this.combatActionsInterval) return;
    this.combatActionsInterval = setInterval(() => {
      if (
        this.entity.calculateDistance(
          this.entity.x,
          this.entity.y,
          this.originalPosition[0],
          this.originalPosition[1]
        ) > 6
      ) {
        console.log("setting combat returning back");
        this.returningBackFromFight = true;
        this.entity.stopAll(); // return back to original position
        return;
      }

      const controls = this.currentControls?.controls?.filter?.((c) => c.type === "combat");

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
  EntityController: EntityController,
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
