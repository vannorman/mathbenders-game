export class Property {
    #value;
    constructor(args) {
        const { initialValue, onChangeProperty } = args;
        this.#value = initialValue;
        this.onChangeProperty = onChangeProperty;
    }

    get value() { return this.#value; }
    set value(value) { this.#value = value; }
}

export class NumericProperty extends Property {
    constructor(args) {
        super(args);
        const { name, minValue, maxValue } = args;
        this.name = name;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    set value(value) {
        const isValidValue = value >= this.minValue || value <= this.maxValue;
        if (!isValidValue) throw new Error(`Invalid value passed ${value}`);
        // It is not necessary to throw an error above. You could just return to prevent the invalid value
        // if (!isValidValue) return;

        super.value = value;
        this.onChangeProperty(value);
    }

    get value() { return super.value; }
}

export class NumeratorProperty extends NumericProperty {
    constructor({ initialValue, minValue = 1, maxValue = 100, onChangeProperty }) {
        super({
            initialValue: initialValue ?? (maxValue + minValue) / 2,
            minValue,
            maxValue,
            onChangeProperty
        });
        this.name = 'numerator';
    }
}

export class DenominatorProperty extends NumericProperty {
    constructor({ initialValue, minValue = 1, maxValue = 100, onChangeProperty }) {
        super({
            initialValue: initialValue ?? (maxValue + minValue) / 2,
            minValue,
            maxValue,
            onChangeProperty
        });
        this.name = 'denominator';
    }
}
