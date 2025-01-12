import Prefab from "./prefab";

export default class AssetPrefab extends Prefab {
    constructor(props = {}) {
        super(props);
        const { asset } = props;
        this.asset = asset;
    }
}