import Observable from '../interface/observable.js';

class Login extends Observable {
	constructor() {
		super();

		this._login = document.getElementById('login');
		this._name = document.getElementById('name');

		this._name.addEventListener('keydown', event => {
			event.stopPropagation();
		});

		this._name.addEventListener('keyup', event => {
			event.stopPropagation();
		});

		document.getElementById('btnLogin').addEventListener('click', event => {
			this.emit('loginAction', {
				'name' : this._name.value
			});
		});
	}

	show() {
		this._login.style.display = '';
	}

	hide() {
		this._login.style.display = 'none';
	}
}

export default Login;