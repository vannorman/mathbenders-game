import PrefabTemplatizer from "./prefabTemplatizer.js";

export default class PrimitivePrefabTemplatizer extends PrefabTemplatizer {
    templatize(prefab) {
        super.templatize(prefab);
        if (!prefab) return;

        const name = prefab.templateName ?? prefab.asset.name ?? '';
        const entity = new pc.Entity(name);
        entity.addComponent("render", { type: prefab.type });
        entity.setLocalScale(prefab.scale);
        entity.addComponent('script');
        pc.app.root.addChild(entity);
        prefabStore[name] = entity;
        prefabStore[name].enabled = false;
    }
}