class InputManager {
	constructor() {
		this._keys = {};
		this._mouseButtons = {};
	}

	getKeyState(key) {
		if (this._keys.hasOwnProperty(key)) {
			return this._keys[key];
		}

		return false;
	}

	getMouseState(key) {
		if (this._mouseButtons.hasOwnProperty(key)) {
			return this._mouseButtons[key];
		}

		return false;
	}

	setKeyState(key, state) {
		this._keys[key] = state;
	}

	setMouseState(key, state) {
		this._mouseButtons[key] = state;
	}

	// constants workaround
	static get KEY_LEFT() { return 37; }
	static get KEY_UP() { return 38; }
	static get KEY_RIGHT() { return 39; }
	static get KEY_DOWN() { return 40; }

	static get KEY_0() { return 48; }
	static get KEY_1() { return 49; }
	static get KEY_2() { return 50; }
	static get KEY_3() { return 51; }
	static get KEY_4() { return 52; }
	static get KEY_5() { return 53; }
	static get KEY_6() { return 54; }
	static get KEY_7() { return 55; }
	static get KEY_8() { return 56; }
	static get KEY_9() { return 57; }

	static get KEY_A() { return 65; }
	static get KEY_B() { return 66; }
	static get KEY_C() { return 67; }
	static get KEY_D() { return 68; }
	static get KEY_E() { return 69; }
	static get KEY_F() { return 70; }
	static get KEY_G() { return 71; }
	static get KEY_H() { return 72; }
	static get KEY_I() { return 73; }
	static get KEY_J() { return 74; }
	static get KEY_K() { return 75; }
	static get KEY_L() { return 76; }
	static get KEY_M() { return 77; }
	static get KEY_N() { return 78; }
	static get KEY_O() { return 79; }
	static get KEY_P() { return 80; }
	static get KEY_Q() { return 81; }
	static get KEY_R() { return 82; }
	static get KEY_S() { return 83; }
	static get KEY_T() { return 84; }
	static get KEY_U() { return 85; }
	static get KEY_V() { return 86; }
	static get KEY_W() { return 87; }
	static get KEY_X() { return 88; }
	static get KEY_Y() { return 89; }
	static get KEY_Z() { return 90; }

	static get MOUSE_LEFT() { return 0; }
	static get MOUSE_RIGHT() { return 2; }
}

export default InputManager
