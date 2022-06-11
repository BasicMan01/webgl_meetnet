let User = require('./user');

class Platform {
	constructor(config, socketMessage) {
		this._config = config;
		this._socketMessage = socketMessage;

		this._lastId = 0;
		this._socketIndex = {};

		this._timeoutInterval = null;
	}


	animation() {
		this._socketMessage.sendWorldData(this._getSocketData());
	}

	startAnimation() {
		this._timeoutInterval = setInterval(this.animation.bind(this), this._config.getInterval());
	}

	/*
	stopAnimation() {
		if (this._timeoutInterval !== null) {
			clearInterval(this._timeoutInterval);
		}
	}
	*/

	addUser(socketId) {
		if (this._socketIndex.hasOwnProperty(socketId)) {
			return false;
		}

		this._socketIndex[socketId] = new User(++this._lastId);
		console.log('Platform::addUser ' + socketId);

		return true;
	}

	removeUser(socketId) {
		if (!this._socketIndex.hasOwnProperty(socketId)) {
			return false;
		}

		delete this._socketIndex[socketId];
		console.log('Platform::removeUser ' + socketId);

		return true;
	}

	getCreationPackage(socketId) {
		if (!this._socketIndex.hasOwnProperty(socketId)) {
			return [];
		}

		return this._socketIndex[socketId].getNetworkPackage();
	}

	setTransformData(socketId, position, rotation, state) {
		if (this._socketIndex.hasOwnProperty(socketId)) {
			this._socketIndex[socketId].setPosition(position);
			this._socketIndex[socketId].setRotation(rotation);
			this._socketIndex[socketId].setState(state);
			this._socketIndex[socketId].setOnline(true);
		}
	}

	getUserName(socketId) {
		if (this._socketIndex.hasOwnProperty(socketId)) {
			return this._socketIndex[socketId].getName();
		}

		return '';
	}

	setUserData(socketId, name, gender) {
		if (this._socketIndex.hasOwnProperty(socketId)) {
			this._socketIndex[socketId].setName(name);
			this._socketIndex[socketId].setGender(gender);
		}
	}

	_getSocketData() {
		let data = {
			user: []
		};

		for (let socketId in this._socketIndex) {
			if (this._socketIndex[socketId].isOnline()) {
				data.user.push(this._socketIndex[socketId].getNetworkPackage());
			}
		}

		return data;
	}
}

module.exports = Platform;