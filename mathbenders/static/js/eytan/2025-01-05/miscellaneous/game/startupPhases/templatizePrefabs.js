import StartupPhase from "./startupPhase";
import {AssetPrefab, PrimitivePrefab} from "../../../prefabs/prefabs";

// Would be defined elsewhere and imported here
const prefabs = [];

class TemplatizePrefabs extends StartupPhase {
    get name() { return 'Templatizing Prefabs'; }

    async execute() {
        console.log('Templatizing prefabs...');
        templatize(prefabs);
        console.log('Finished templatizing prefabs.');
    }
}

export default TemplatizePrefabs;

function templatize(prefabs) {
    prefabs.forEach(prefab => {
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
    });
}
