import Observable from '../../interface/observable.js';

class Connect extends Observable {
	#connect;
	#ip;

	constructor() {
		super();

		this.#connect = document.getElementById('connect');
		this.#ip = document.getElementById('ip');

		this.#ip.value = location.host;
		this.#ip.addEventListener('keydown', (event) => {
			event.stopPropagation();
		});

		this.#ip.addEventListener('keyup', (event) => {
			event.stopPropagation();
		});

		document.getElementById('btnConnect').addEventListener('click', () => {
			const ip = document.getElementById('ip').value;

			this.emit('connectAction', {
				'ip': ip
			});
		});
	}

	show() {
		this.#connect.classList.remove('hidden');
	}

	hide() {
		this.#connect.classList.add('hidden');
	}

	setErrorMessage(message) {
		document.getElementById('connectMessage').innerText = message;
	}
}

export default Connect;