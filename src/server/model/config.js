class Config {
	constructor() {
		this._interval = 100;
	}

	getInterval() {
		return this._interval;
	}
}

module.exports = Config;