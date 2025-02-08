class Fraction {
    asString(){
        return this.denominator == 1 ? this.numerator : this.numerator + "/" + this.denominator;
    }
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }

    toString(){
        if (this.denominator == 1) {
            return this.numerator.toString();
        } else {
            return (this.numerator + "/" + this.denominator).toString();
        }
    }

    toJSON(){
        return {Fraction:{numerator:this.numerator,denominator:this.denominator}}; // preserve "Fraction" key in JSON conversion; else {numerator:1,denominator:1} is returned, stripping "Fraction" label
    }
    static Add (a,b, reduce=true){
		if (a.denominator == 1 && b.denominator == 1){
			return new Fraction(a.numerator+b.numerator,1);
		}

		const expA = new Fraction(a.numerator * b.denominator, a.denominator * b.denominator);
		const expB = new Fraction(b.numerator * a.denominator, b.denominator * a.denominator);
		if(reduce) {
			return Fraction.ReduceFully(new Fraction(expA.numerator + expB.numerator, expA.denominator));
		}
		else {
			return Fraction.ReduceOverIntegers(new Fraction(expA.numerator + expB.numerator, expA.denominator));
		}

    }
    static Divide(a,b){
		return Fraction.Multiply(a,Fraction.Inverse(b));
    }
    static Multiply(a, b, reduce = true) {
		if(reduce){
			return Fraction.ReduceFully(new Fraction(a.numerator * b.numerator, a.denominator * b.denominator));
		}
		else {
			return Fraction.ReduceOverIntegers(new Fraction(a.numerator * b.numerator, a.denominator * b.denominator));
		}
	}
    static Inverse(a){
		if (a.numerator < 0){
			return new Fraction(-a.denominator,-a.numerator);
		} else {
	 		return new Fraction(a.denominator,a.numerator);
		}
	}
    static ReduceOverIntegers(a) {
		if (a.numerator % a.denominator == 0) {
			return new Fraction(a.numerator / a.denominator, 1);
		}
		return a;
	}
//    public static Dictionary<Fraction, Fraction> memoReduceFully = new Dictionary<Fraction, Fraction>();
	static ReduceFully(a) {
//		if(memoReduceFully.ContainsKey(a)) {
//			return memoReduceFully[a];
//		}
		let sign = (a.numerator * a.denominator) < 0 ? -1 : 1;
		let gcd = 1;
		let div;
		let min = Math.min(Math.abs(a.numerator), Math.abs(a.denominator));
		for (div=1;div<=min;div++){
			if (a.numerator%div==0 && a.denominator%div==0){
				gcd=div;
			}
		}
		let newFrac = new Fraction(sign * Math.abs(a.numerator) / gcd, Math.abs(a.denominator) / gcd);
		// memoReduceFully[a] = newFrac;
		return newFrac;
	}

}


