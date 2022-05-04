class Config {
	constructor() {
		this._interval = 25;
	}

	getInterval() {
		return this._interval;
	}
}

module.exports = Config;