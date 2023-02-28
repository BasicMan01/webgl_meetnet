import Observable from '../../interface/observable.js';

class Login extends Observable {
	#login;
	#name;

	constructor() {
		super();

		this.#login = document.getElementById('login');
		this.#name = document.getElementById('name');

		this.#name.addEventListener('keydown', (event) => {
			event.stopPropagation();
		});

		this.#name.addEventListener('keyup', (event) => {
			event.stopPropagation();
		});

		document.getElementById('btnLogin').addEventListener('click', () => {
			if (this.#validate()) {
				this.emit('loginAction', {
					'name': this.#name.value,
					'gender': document.querySelector('input[name="gender"]:checked').value
				});
			}
		});
	}

	show() {
		this.#login.classList.remove('hidden');
	}

	hide() {
		this.#login.classList.add('hidden');
	}


	#validate() {
		const checkedGender = document.querySelector('input[name="gender"]:checked');

		let valid = true;

		if (this.#name.value.length) {
			this.#name.closest('.form-field').classList.remove('input-error');
		} else {
			this.#name.closest('.form-field').classList.add('input-error');
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