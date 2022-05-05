import Observable from '../interface/observable.js';

class Connect extends Observable {
	constructor() {
		super();

		this._connect = document.getElementById('connect');
		this._ip = document.getElementById('ip');

		this._ip.value = location.host;
		this._ip.addEventListener('keydown', event => {
			event.stopPropagation();
		});

		this._ip.addEventListener('keyup', event => {
			event.stopPropagation();
		});

		document.getElementById('btnConnect').addEventListener('click', event => {
			let ip = document.getElementById('ip').value;

			this.emit('connectAction', {
				'ip': ip
			});
		});
	}

	show() {
		this._connect.style.display = '';
	}

	hide() {
		this._connect.style.display = 'none';
	}

	setErrorMessage(message) {
		document.getElementById('connectMessage').innerText = message;
	}
}

export default Connect;