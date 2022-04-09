class Config {
	constructor() {
		this._maxUser = 8;

		this._interval = 50;
	}

	getInterval() {
		return this._interval;
	}

	getMaxUser() {
		return this._maxUser;
	}
}

module.exports = Config;