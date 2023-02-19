import Observable from '../../interface/observable.js';

class Login extends Observable {
	constructor() {
		super();

		this._login = document.getElementById('login');
		this._name = document.getElementById('name');

		this._name.addEventListener('keydown', (event) => {
			event.stopPropagation();
		});

		this._name.addEventListener('keyup', (event) => {
			event.stopPropagation();
		});

		document.getElementById('btnLogin').addEventListener('click', () => {
			if (this._validate()) {
				this.emit('loginAction', {
					'name': this._name.value,
					'gender': document.querySelector('input[name="gender"]:checked').value
				});
			}
		});
	}

	show() {
		this._login.classList.remove('hidden');
	}

	hide() {
		this._login.classList.add('hidden');
	}

	_validate() {
		const checkedGender = document.querySelector('input[name="gender"]:checked');

		let valid = true;

		if (this._name.value.length) {
			this._name.closest('.form-field').classList.remove('input-error');
		} else {
			this._name.closest('.form-field').classList.add('input-error');
			valid = false;
		}

		if (checkedGender) {
			document.querySelector('input[name="gender"]').closest('.form-field').classList.remove('input-error');
		} else {
			document.querySelector('input[name="gender"]').closest('.form-field').classList.add('input-error');
			valid = false;
		}

		return valid;
	}
}

export default Login;