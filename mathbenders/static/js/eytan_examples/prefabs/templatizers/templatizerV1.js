import AssetPrefabTemplatizer from "./assetPrefabTemplatizer";
import PrimitivePrefabTemplatizer from "./primitivePrefabTemplatizer";
import Templatizer from "./templatizer";

export default class TemplatizerV1 extends Templatizer {

    constructor() {
        super();
        this.prefabTemplatizers = new Map([
            // Logic to handle templatizing is divided across CLASSES which
            // cater to specific prefab instance types. This helps reduce if-else logic
            ['AssetPrefab', new AssetPrefabTemplatizer()],
            ['PrimitivePrefab', new PrimitivePrefabTemplatizer()],
        ]);
    }

    templatize(prefab) {
        const prefabTemplatizer = this.prefabTemplatizers.get(prefab.constructor.toString());
        prefabTemplatizer.templatize(prefab);
    }

}

