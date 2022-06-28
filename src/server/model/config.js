class Config {
	constructor() {
		this._interval = 0.1;
	}

	getInterval() {
		return this._interval;
	}
}

module.exports = Config;