class Observable {
	constructor() {
		this._callbacks = new Map();
	}

	addCallback(token, callback) {
		if (!this._callbacks.has(token)) {
			this._callbacks.set(token, callback);
		}
	}

	emit(token, args) {
		let callback = this._callbacks.get(token);

		if (typeof callback === 'function') {
			return callback(args);
		}

		return false;
	}
}

export default Observable;
