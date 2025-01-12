export default class PrefabTemplatizer {
    templatize(prefab) {
        if (!prefab) return;

        const name = prefab.templateName ?? prefab.asset.name ?? '';
        if (prefab.icon) iconStore[name] = prefab.icon;

        // In the original implementation in game.js, the below should happen after
        // what happens in the classes that derive from this class. This may have to
        // move into both subclass implementations
        const hasParent = prefab.parent.entity;
        if (hasParent) return;

        const parent = new pc.Entity();
        parent.addChild(prefab);
        parent.addComponent('script');
        parent.setLocalPosition(prefab.parent.offset);
        parent.enabled = false;
        prefabStore[name] = parent;
        pc.app.root.addChild(parent);
    }
}