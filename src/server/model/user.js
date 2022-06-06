let Quaternion = require('../classes/quaternion');
let Vector3 = require('../classes/vector3');

class User {
	constructor(id) {
		this._id = id;
		this._gender = 'm'
		this._name = '';
		this._online = false;

		this._state = 'character.animation.idle';
		this._position = new Vector3();
		this._rotation = new Quaternion();
	}

	isOnline() {
		return this._online;
	}

	setOnline(online) {
		this._online = online;
	}

	getPosition() {
		return {
			'x': this._position.x,
			'y': this._position.y,
			'z': this._position.z
		};
	}

	setPosition(position) {
		this._position.fromArray(position);
	}

	getRotation() {
		return {
			'x': this._rotation.x,
			'y': this._rotation.y,
			'z': this._rotation.z,
			'w': this._rotation.w
		}
	}

	setRotation(rotation) {
		this._rotation.fromArray(rotation);
	}

	setGender(gender) {
		this._gender = gender === 'm' ? 'm' : 'w';
	}

	getName() {
		return this._name;
	}

	setName(name) {
		this._name = name;
	}

	getState() {
		return this._state;
	}

	setState(state) {
		this._state = state;
	}

	getNetworkPackage() {
		return {
			'id': this._id,
			'gender': this._gender,
			'name': this._name,
			'position': this.getPosition(),
			'rotation': this.getRotation(),
			'state': this.getState()
		};
	}
}

module.exports = User;
