export default class Prefab {

    constructor(props = {}) {
        const {
            scale = pc.Vec3.ONE,
            initialize = () => { console.log('prefab initialize'); },
            templateName,
            icon,
            parent = {
                entity: null,           // hasEmptyParent potential replacement
                offset: pc.Vec3.ZERO    // emptyParentOffset potential replacement
                // other parent related fields...
            }
        } = props;
        this.scale = scale;
        this.initialize = initialize.bind(this);
        this.templateName = templateName;
        this.icon = icon;
        this.parent = parent;
    }

    serialize() { console.log('serializing prefab', this); }

    jsonify() { console.log('jsonifying prefab', this); }

    get properties() {}

    set properties(properties) {}

}