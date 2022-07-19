import Observable from '../interface/observable.js';

class Timer extends Observable {
	constructor() {
		super();

		this._timer = document.getElementById('timer');
	}

	show() {
		this._timer.classList.remove('hidden');
	}

	hide() {
		this._timer.classList.add('hidden');
	}

	setValue(value) {
		this._timer.innerText = this._formatTime(value);
	}

	_formatTime(seconds) {
		const restSeconds = seconds % 60;
		const minutes = (seconds - restSeconds) / 60;

		return String(minutes).padStart(2, 0) + ':' + String(restSeconds).padStart(2, 0);
	};
}

export default Timer;