const Constants = require('./constants');
const User = require('./user');

const { performance } = require('perf_hooks');

class Platform {
	constructor(config, socketMessage) {
		this._config = config;
		this._socketMessage = socketMessage;

		this._lastUserId = 0;
		this._socketIndex = {};
		this._userList = [];
		this._userOnline = 0;

		this._timerWorldData = 0;

		this._startTime = 0;
		this._lastTime = 0;

		this._gameStatus = Constants.GAME_STOP;
	}

	update(timeDelta) {
		// TODO: change game status

		this._timerWorldData += timeDelta;

		if (this._timerWorldData >= this._config.getInterval()) {
			this._timerWorldData = 0;

			this._socketMessage.sendWorldData(this._getSocketData());
		}


		if (this._gameStatus === Constants.GAME_WAIT) {
			this._currentTime = new Date().getTime();

			if (this._currentTime - this._lastTime >= 1000) {
				this._lastTime += 1000;

				const calculatedTime = (this._startTime + 120000 - this._lastTime) / 1000;

				// fallback
				if (calculatedTime < 0) {
					this._startTime = new Date().getTime();
					this._lastTime = this._startTime;
				}

				this._socketMessage.sendClockData({
					'time': (this._startTime + 120000 - this._lastTime) / 1000
				});
			}
		}
	}

	startAnimation(timeLast = 0) {
		setTimeout(() => {
			const timeNow = performance.now();

			this.update((timeNow - timeLast) * 0.001);
			this.startAnimation(timeNow);
		});
	}

	addUser(socketId) {
		if (Object.prototype.hasOwnProperty.call(this._socketIndex, socketId)) {
			return false;
		}

		this._socketIndex[socketId] = new User(++this._lastUserId);
		console.log('Platform::addUser ' + socketId);

		return true;
	}

	removeUser(socketId) {
		if (!Object.prototype.hasOwnProperty.call(this._socketIndex, socketId)) {
			return false;
		}

		delete this._socketIndex[socketId];
		console.log('Platform::removeUser ' + socketId);

		return true;
	}

	updateUserStatus() {
		let currentUserOnline = 0;

		// this._userList = [];

		for (const socketId in this._socketIndex) {
			if (this._socketIndex[socketId].isOnline()) {
				++currentUserOnline;

				/*
				this._userList.push({
					'name': '',
					'points': 0
				})
				*/
			}
		}

		if (currentUserOnline === 0) {
			this._gameStatus = Constants.GAME_STOP;
		}

		if (currentUserOnline > this._userOnline && this._userOnline === 0) {
			this._startTime = new Date().getTime();
			this._lastTime = this._startTime;

			this._gameStatus = Constants.GAME_WAIT;
		}

		this._userOnline = currentUserOnline;
	}


	getCreationPackage(socketId) {
		if (!Object.prototype.hasOwnProperty.call(this._socketIndex, socketId)) {
			return [];
		}

		return this._socketIndex[socketId].getNetworkPackage();
	}

	getUserName(socketId) {
		if (Object.prototype.hasOwnProperty.call(this._socketIndex, socketId)) {
			return this._socketIndex[socketId].getName();
		}

		return '';
	}

	setTransformData(socketId, position, rotation, state) {
		if (Object.prototype.hasOwnProperty.call(this._socketIndex, socketId)) {
			this._socketIndex[socketId].setPosition(position);
			this._socketIndex[socketId].setRotation(rotation);
			this._socketIndex[socketId].setState(state);
		}
	}

	setUserData(socketId, name, gender) {
		if (Object.prototype.hasOwnProperty.call(this._socketIndex, socketId)) {
			this._socketIndex[socketId].setName(name);
			this._socketIndex[socketId].setGender(gender);
			this._socketIndex[socketId].setOnline(true);
		}
	}

	_getSocketData() {
		const data = {
			user: []
		};

		for (const socketId in this._socketIndex) {
			if (this._socketIndex[socketId].isOnline()) {
				data.user.push(this._socketIndex[socketId].getNetworkPackage());
			}
		}

		return data;
	}
}

module.exports = Platform;