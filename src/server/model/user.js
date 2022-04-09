let Vector3 = require('../classes/vector3');

class User {
	constructor(config, socketId, index) {
		this._config = config;

		this._socketId = socketId;
		this._index = index;

		this._name = '';

		this._position = new Vector3(0, 2.0, 0);
		this._rotation = new Vector3();
	}

	getPosition() {
		return {
			'x': this._position.x,
			'y': this._position.y,
			'z': this._position.z
		};
	}

	setPosition(x, y, z) {
		this._position.x = x;
		this._position.y = y;
		this._position.z = z;
	}

	getIndex() {
		return this._index;
	}

	getName() {
		return this._name;
	}

	setName(name) {
		this._name = name;
	}

	getSocketId() {
		return this._socketId;
	}
}

module.exports = User;
