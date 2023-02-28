class Observable {
	#callbacks;


	constructor() {
		this.#callbacks = new Map();
	}

	addCallback(token, callback) {
		if (!this.#callbacks.has(token)) {
			this.#callbacks.set(token, callback);
		}
	}

	emit(token, args) {
		const callback = this.#callbacks.get(token);

		if (typeof callback === 'function') {
			return callback(args);
		}

		return false;
	}
}

export default Observable;