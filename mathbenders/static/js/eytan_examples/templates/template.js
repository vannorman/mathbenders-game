import {FractionAttribute} from "./attribute.js";

export class Template {
    constructor(args) {
        const { name } = args;
        this.name = name;
        this.entity = {
            getPosition: () => [1, 4, 6],
            getRotation: () => [0, 0, 0],
            getScale: () => [1, 1, 1],
        }
        this.onChangeAttribute = this.onChangeAttribute.bind(this);
    }

    serialize() {
        return {
            name: this.name,
            position: this.entity.getPosition(),
            rotation: this.entity.getRotation(),
            scale: this.entity.getScale?.()
        }
    }

    onChangeAttribute(key, value) {
        // console.log(this.name, 'setting attribute', key, '=', value)
    }

}

export class NumberWall extends Template {

    constructor(args) {
        super(args);
        const { attributes } = args;
        this.attributes = attributes.map(attribute => toAttribute({
            name: attribute.name,
            value: attribute.value,
            onChangeAttribute: this.onChangeAttribute
        }));
    }

    serialize() {
        return {
            ...super.serialize(),
            attributes: this.attributes.map(attribute => ({ name: attribute.name, value: attribute.value }))
        }
    }

    onChangeAttribute(name, value) {
        super.onChangeAttribute(name, value);
        switch (name) {
            case 'fraction':
                this.#onChangeFractionAttribute(value)
                break;
            default:
                console.warn(`Attribute ${name} not found on ${this.name}`)
                break;
        }
    }

    #onChangeFractionAttribute(fractionAttributeValue) {
        console.log(this.name, 'modifying the entity to account for new fraction:', fractionAttributeValue);
    }

}

// Converting an attribute from JSON to an object instance
function toAttribute({name, value, onChangeAttribute}) {
    let attribute;
    switch (name) {
        case 'fraction':
            attribute = new FractionAttribute({name, value, onChangeAttribute});
            break;
        default:
            break;
    }
    return attribute;
}
