class Config {
	private interval: number;


	constructor() {
		this.interval = 0.1;
	}

	getInterval(): number {
		return this.interval;
	}
}

export = Config;