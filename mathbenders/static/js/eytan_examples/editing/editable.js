import {ScaleModifier, ValueModifier} from "./modifiers";

export default class Editable {
    constructor(props) {
        const {
            prefab,
            modifiers
        } = props;
        this.prefab = prefab;
        this.modifiers = new Map();
        modifiers.forEach(modifier => this.modifiers.set(modifier.name, modifier));
    }
}

const numberWall = prefabStore['numberWall'];
const editableNumberWall = new Editable({
    prefab: numberWall,
    modifiers: [
        new ScaleModifier({ prefab: numberWall }),
        new ValueModifier({ prefab: numberWall }),
    ]
});

