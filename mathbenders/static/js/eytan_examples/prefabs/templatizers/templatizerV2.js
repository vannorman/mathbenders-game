import Templatizer from "./templatizer";

class TemplatizerV2 extends Templatizer {

    constructor() {
        super();
        this.prefabTemplatizers = new Map([
            // Logic to handle templatizing is divided across FUNCTIONS which
            // cater to specific prefab instance types. This helps reduce if-else logic
            ['AssetPrefab', this.#templatizeAssetPrefab],
            ['PrimitivePrefab', this.#templatizePrimitivePrefab],
        ]);
        this.#templatizeAssetPrefab = this.#templatizeAssetPrefab.bind(this);
        this.#templatizePrimitivePrefab = this.#templatizePrimitivePrefab.bind(this);
    }

    #templatizeAssetPrefab(prefab) {
        console.log('prefab templatizing...');
    }

    #templatizePrimitivePrefab(prefab) {
        console.log('primitive prefab templatizing...');
    }

    templatize(prefab) {
        const templatizeFn = this.prefabTemplatizers.get(prefab.constructor.toString());
        templatizeFn(prefab);
    }

}