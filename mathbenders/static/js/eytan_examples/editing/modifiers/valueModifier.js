import Modifier from "./modifier";

export default class ValueModifier extends Modifier {
    get name() { return 'value'; }

    // Assign to corresponding UI component
    set value(value) { this.prefab.script.numberWall.value = value; }
}