let Constants = require('./constants');
let User = require('./user');

class Game {
	constructor(config, socketMessage) {
		this._config = config;
		this._socketMessage = socketMessage;

		this._users = [];
		this._socketIndex = {};

		this._timeoutInterval = null;

		this._gameStatus = Constants.GAME_STOP;

		this._init();
	}

	_init() {
		for (let i = 0; i < this._config.getMaxUser(); ++i) {
			this._users[i] = null;
		}
	}

	/*
	animation() {
		this.move();

		this._socketMessage.sendGameData(this.getSocketData());
	}

	startAnimation() {
		this._timeoutInterval = setInterval(this.animation.bind(this), this._config.getInterval());
	}

	stopAnimation() {
		if (this._timeoutInterval !== null) {
			clearInterval(this._timeoutInterval);
		}
	}

	isCreator(socketId) {
		if (this._socketIndex.hasOwnProperty(socketId)) {
			if (this._socketIndex[socketId].getIndex() === 1) {
				return true;
			}
		}

		return false;
	}
	*/

	addUser(socketId) {
		console.log('Game::addUser ' + socketId);

		for (let i = 0; i < this._config.getMaxUser(); ++i) {
			if (this._users[i] === null) {
				this._users[i] = new User(this._config, socketId, i + 1);
				this._socketIndex[socketId] = this._users[i];

				return true;
			}
		}

		return false;
	}

	removeUser(socketId) {
		if (this._socketIndex.hasOwnProperty(socketId)) {
			delete this._socketIndex[socketId];
		}

		for (let i = 0; i < this._config.getMaxUser(); ++i) {
			if (this._users[i] !== null && socketId === this._users[i].getSocketId()) {
				this._users[i] = null;
			}
		}

		console.log('Game::removeUser ' + socketId);
	}

	getPersonalData(socketId) {
		if (this._socketIndex.hasOwnProperty(socketId)) {
			for (let i = 0; i < this._config.getMaxUser(); ++i) {
				if (this._users[i] !== null && socketId === this._users[i].getSocketId()) {
					return {
						'index': this._users[i].getIndex(),
						'name': this._users[i].getName(),
						'position': this._users[i].getPosition()
					};
				}
			}
		}

		return [];
	}

	getUserName(socketId) {
		if (this._socketIndex.hasOwnProperty(socketId)) {
			return this._socketIndex[socketId].getName();
		}

		return '';
	}

	setUserName(socketId, name) {
		if (this._socketIndex.hasOwnProperty(socketId)) {
			this._socketIndex[socketId].setName(name.substring(0, 10));
		}
	}

	/*

	getSocketData() {
		let data = {};

		data.player = [];

		for (let i = 0; i < this._config.player; ++i) {
			if (this._players[i] !== null) {
				data.player.push([
					this._players[i].getIndex(),
					this._players[i].getColor(),
					this._players[i].getName(),
					this._players[i].getPosition()
				]);
			}
		}

		return data;
	}

	setPosition(socketId, position) {
		if (this._gameStatus !== Constants.GAME_RUN) {
			return;
		}

		if (this._socketIndex.hasOwnProperty(socketId)) {
			this._socketIndex[socketId].setPosition(position);
		}
	}

	_countPlayer() {
		let count = 0;

		for (let i = 0; i < this._config.getMaxUser(); ++i) {
			if (this._users[i] !== null) {
				++count;
			}
		}

		return count;
	}

	*/
}

module.exports = Game;