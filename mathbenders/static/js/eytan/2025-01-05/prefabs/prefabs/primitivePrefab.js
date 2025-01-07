import Prefab from "./prefab.js";

export default class PrimitivePrefab extends Prefab {
    constructor(props = {}) {
        super(props);
        const { type } = props;
        this.type = type;
    }
}