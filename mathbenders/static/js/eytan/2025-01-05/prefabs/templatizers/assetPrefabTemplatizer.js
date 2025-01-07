import PrefabTemplatizer from "./prefabTemplatizer.js";

export default class AssetPrefabTemplatizer extends PrefabTemplatizer {
    templatize(prefab) {
        super.templatize(prefab);
        if (!prefab) return;

        const name = prefab.templateName ?? prefab.asset.name ?? '';
        const renderedEntity = prefab.asset.resource.instantiateRenderEntity();
        renderedEntity.setLocalScale(pc.Vec3.ONE.clone().mulScalar(prefab.scale)); // Do you have to clone ONE?
        renderedEntity.addComponent('script');
        renderedEntity.enabled = false;
        prefabStore[name] = renderedEntity;
    }
}