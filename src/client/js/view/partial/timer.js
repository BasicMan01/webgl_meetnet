import Observable from '../../interface/observable.js';

class Timer extends Observable {
	#timer;

	constructor() {
		super();

		this.#timer = document.getElementById('timer');
	}

	show() {
		this.#timer.classList.remove('hidden');
	}

	hide() {
		this.#timer.classList.add('hidden');
	}

	setValue(value) {
		this.#timer.innerText = this.#formatTime(value);
	}


	#formatTime(seconds) {
		const restSeconds = seconds % 60;
		const minutes = (seconds - restSeconds) / 60;

		return String(minutes).padStart(2, 0) + ':' + String(restSeconds).padStart(2, 0);
	}
}

export default Timer;