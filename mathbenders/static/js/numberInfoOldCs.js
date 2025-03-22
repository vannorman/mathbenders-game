
public class NumberText {
	public CCText integer;
	public CCText numerator;
	public CCText line;
	public CCText denominator;
}


public class NumberInfo  {



	public Fraction fraction = new Fraction(1,1);
	public NumberShape myShape = NumberShape.Sphere;

    public Renderer childMeshRenderer;
	public Transform digits;
	[SerializeField] public NumberText[] texts;

	public void UpdateNumberText(){
		if (texts == null) {
			
			return;
		}
		if (isPercent){
			GetTextScale(5);
			string p = (Mathf.RoundToInt(fraction.GetAsPercent()).ToString() + "%");
			foreach(NumberText t in texts){
				t.integer.Text = p;
			}
			return;
		}


		if (fraction.denominator == 1) SetTextInteger();
		else SetTextFraction();
	}

	void SetTextFraction(){
		int sign = fraction.numerator > 0 ? 1 : -1;
		int mixedNumberCoefficient = Mathf.FloorToInt(Mathf.Abs (fraction.GetAsFloat()));

		int numerator = fraction.numerator;
		float leftRightOffset = 0;
		float scale = GetIntegerScale(mixedNumberCoefficient);
		if (mixedNumberCoefficient != 0){
			mixedNumberCoefficient *= sign;
			numerator -= mixedNumberCoefficient * fraction.denominator;
			numerator = Mathf.Abs(numerator);
			scale *= .8f;
			leftRightOffset = -0.2f;
		} else {
//			numerator *= sign;

		}
		if (myShape == NumberShape.Cube) scale *= 3f;
		else scale *= 2.5f;
		foreach(NumberText t in texts){
			if (mixedNumberCoefficient == 0) t.integer.Text = "";
			else t.integer.Text = mixedNumberCoefficient.ToString();

			t.integer.transform.localScale = Vector3.one * scale;

			t.numerator.Text = numerator.ToString();
			t.denominator.Text = fraction.denominator.ToString();
			t.line.Text = "_";

			t.integer.transform.localScale = Vector3.one * scale * .35f;
			t.numerator.transform.localScale = Vector3.one * scale * .2f;
			t.denominator.transform.localScale = Vector3.one * scale * .2f;

			t.integer.transform.localPosition = new Vector3(-leftRightOffset,t.integer.transform.localPosition.y,t.integer.transform.localPosition.z); // asuming parent is positioned correctyl in cubes and spheres. If not, absolute localpos will be wrong
			t.numerator.transform.localPosition = new Vector3(leftRightOffset,t.numerator.transform.localPosition.y,t.numerator.transform.localPosition.z);
			t.line.transform.localPosition =  new Vector3(leftRightOffset,t.line.transform.localPosition.y,t.line.transform.localPosition.z);
			t.denominator.transform.localPosition = new Vector3(leftRightOffset,t.denominator.transform.localPosition.y,t.denominator.transform.localPosition.z);

			t.numerator.gameObject.SetActive(true);
			t.denominator.gameObject.SetActive(true);
			t.line.gameObject.SetActive(true);
		}

	}

	float GetIntegerScale(int integer){
		int digitsLength = integer.ToString().Replace("-","").Length;
		return GetTextScale(digitsLength);
	}

	float GetTextScale(int digitsLength){
		//		if (integer < 0) digitsLength ++;
		float newScale = 1f;
		switch(digitsLength){
		case 0: newScale = 1; break;
		case 1: newScale = 1; break;
		case 2: newScale = 0.8f; break; // special hardcoded sizes based on integer length.
		case 3: newScale = 0.5f; break;
		case 4: newScale = 0.45f; break;
		case 5: newScale = 0.37f; break;
		case 6: newScale = 0.31f; break;
		case 7: newScale = 0.25f; break;
		default: newScale = 0.23f; break;
		}
//		newScale *= .83f;


		return newScale;

	}

	void SetTextInteger(){

		float newScale = GetIntegerScale(fraction.numerator);
		foreach(NumberText t in texts){
			t.integer.Text = fraction.numerator.ToString();

			t.integer.transform.localScale = Vector3.one * newScale;
			t.integer.transform.localPosition = new Vector3(0,t.integer.transform.localPosition.y,t.integer.transform.localPosition.z); 
			if (!t.numerator) {

				name += "no at time ";
			}
			t.numerator.Text = "";
			t.denominator.Text = "";
			t.line.Text = "";
			t.numerator.gameObject.SetActive(false);
			t.denominator.gameObject.SetActive(false);
			t.line.gameObject.SetActive(false);
		}
	}

	public void NotifyDestroyer(GameObject o){



	public void SetNumber(Fraction frac, bool sinGrow=false, bool allowRevert=true) {
		fraction = frac;
		UpdateNumberText();

	}


