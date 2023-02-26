class Timer {
	private initialTime: number;

	private lastTime: number = 0;
	private run: boolean = false;
	private startTime: number = 0;


	constructor(seconds: number) {
		this.initialTime = seconds * 1000;
	}

	start() {
		this.startTime = new Date().getTime();
		this.lastTime = this.startTime;
		this.run = true;
	}

	update(stepCallback: any) {
		if (this.run) {
			const currentTime = new Date().getTime();

			if (currentTime - this.lastTime >= 1000) {
				this.lastTime += 1000;

				const calculatedTime = (this.startTime + this.initialTime - this.lastTime) / 1000;

				// fallback
				if (calculatedTime < 0) {
					this.stop();
				}

				if (typeof stepCallback === 'function') {
					stepCallback(calculatedTime);
				}
				//this.socketMessage.sendClockData({
				//	'time': (this.startTime + this.initialTime - this.lastTime) / 1000
				//});
			}
		}
	}

	stop() {
		this.run = false;
	}
}

export = Timer;