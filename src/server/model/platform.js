let User = require('./user');

const { performance } = require('perf_hooks');

class Platform {
	constructor(config, socketMessage) {
		this._config = config;
		this._socketMessage = socketMessage;

		this._lastId = 0;
		this._socketIndex = {};

		this._timerWorldData = 0;

		// this._startTime = new Date().getTime();
		// this._lastTime = this._startTime;
	}

	update(timeDelta) {
		this._timerWorldData += timeDelta;

		if (this._timerWorldData >= this._config.getInterval()) {
			this._timerWorldData = 0;

			this._socketMessage.sendWorldData(this._getSocketData());
		}

		/*
		this._currentTime = new Date().getTime();

		if (this._currentTime - this._lastTime >= 1000) {
			this._lastTime += 1000;

			//this._socketMessage.sendClockData();
			console.log((this._startTime + 120000 - this._lastTime) / 1000);
		}
		*/
	}

	startAnimation(timeLast = 0) {
		setTimeout(() => {
			const timeNow = performance.now();

			this.update((timeNow - timeLast) * 0.001);
			this.startAnimation(timeNow);
		});
	}

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