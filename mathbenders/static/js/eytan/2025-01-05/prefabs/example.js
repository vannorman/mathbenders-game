import prefabsToTemplatize from './example-prefabs';
import { AssetPrefab, PrimitivePrefab } from "./prefabs";
import { TemplatizerV1 } from "./templatizers";

// 1.) Use existing Game.templatize ? It would need to be reimplemented or delegate to a handler class/method
prefabsToTemplatize.forEach((prefab) => {/* Game.templatize */});

// 2.) Class approach
const templatizer = new TemplatizerV1();
prefabsToTemplatize.forEach((prefab) => templatizer.templatize(prefab));
prefabsToTemplatize.forEach(templatizer.templatize);

// 3.) Function approach (helper functions nested but don't have to be)
const templatize = (prefab) => {
    if (prefab instanceof PrimitivePrefab) {
        _templatizePrimitivePrefab(prefab);
    }
    else if (prefab instanceof AssetPrefab) {
        _templatizeAssetPrefab(prefab)
    }

    function _templatizeAssetPrefab (prefab) {
        console.log('templatizing prefab', prefab);
    }

    function _templatizePrimitivePrefab (primitivePrefab) {
        console.log('templatizing primitive prefab', primitivePrefab);
    }
}

prefabsToTemplatize.forEach((prefab) => templatize(prefab));
prefabsToTemplatize.forEach(templatize);