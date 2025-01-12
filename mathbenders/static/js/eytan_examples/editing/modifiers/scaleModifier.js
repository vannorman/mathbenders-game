import Modifier from "./modifier";

export default class ScaleModifier extends Modifier {
    get name() { return 'scale'; }

    // Functions assigned to the corresponding sliders
    set x(x) { this.prefab.entity.transform.scale.x = x; }

    set y(x) { this.prefab.entity.transform.scale.x = x; }

    set z(x) { this.prefab.entity.transform.scale.x = x; }
}