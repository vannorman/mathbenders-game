import {DenominatorProperty, NumeratorProperty, NumericProperty} from "./property.js";

export class Attribute {
    get name() {}
    get value() {}
}

export class FractionAttribute extends Attribute {
    constructor(args) {
        super();
        const { value, onChangeAttribute } = args;
        const [numerator, denominator] = value;
        this.onChangeAttribute = onChangeAttribute;
        this.onChangeProperty = this.onChangeProperty.bind(this);
        this.properties = [
            new NumeratorProperty({
                initialValue: numerator,
                onChangeProperty: this.onChangeProperty
            }),
            new DenominatorProperty({
                initialValue: denominator,
                onChangeProperty: this.onChangeProperty
            })
        ]
        // NOTE: We could use NumericProperty type instead. I don't know if there
        // will be a need for a property to have a name (e.g. rendering it in the UI).
        // Extending it with NumeratorProperty and DenominatorProperty is more a matter of convenience
        // to hardcode the property name for all instances.
        // this.properties = [
        //     new NumericProperty({
        //         name: 'numerator',
        //         initialValue: numerator,
        //         onChangeProperty: this.onChangeProperty
        //     }),
        //     new NumericProperty({
        //         name: 'denominator',
        //         initialValue: denominator,
        //         onChangeProperty: this.onChangeProperty
        //     })
        // ]
    }

    get name() { return 'fraction'; }

    get value() {
        const numerator = this.properties[0];
        const denominator = this.properties[1];
        const value = [numerator.value, denominator.value];
        return value;
    }

    onChangeProperty() {
        const numerator = this.properties[0];
        const denominator = this.properties[1];
        const fraction = [numerator.value, denominator.value];
        this.onChangeAttribute(this.name, fraction);
    }

}
