import { io } from 'socket.io-client';

import View from '../view/view.js';

class Controller {
	#socket = null;
	#view = null;


	constructor() {
		this.#init();
	}


	#init() {
		this.#view = new View();
		this.#view.addCallback('addChatMessageAction', this.#addChatMessageAction.bind(this));
		this.#view.addCallback('sendTransformDataAction', this.#sendTransformDataAction.bind(this));

		// partial view
		this.#view.chatView.addCallback('sendChatMessageAction', this.#sendChatMessageAction.bind(this));
		this.#view.connectView.addCallback('connectAction', this.#connectAction.bind(this));
		this.#view.loginView.addCallback('loginAction', this.#loginAction.bind(this));
	}

	#connectAction(args) {
		this.#view.connectView.setErrorMessage('Connect...');

		this.#socket = io('ws://' + args.ip + ':' + process.env.SERVER_PORT, {
			reconnection: false,
			transports: ['websocket']
		});

		this.#socket.on('connect', () => {
			this.#view.connect();
		});

		this.#socket.on('disconnect', () => {
			this.#socket.close();

			this.#view.destroy();
			this.#view.connectView.setErrorMessage('Disconnected');
		});

		this.#socket.on('connect_error', () => {
			// Fired when a namespace middleware error occurs.
			this.#socket.close();

			this.#view.destroy();
			this.#view.connectView.setErrorMessage('Connection Error');
		});


		this.#socket.on('SN_SERVER_CHAT_MESSAGE', (userName, msg) => {
			this.#addChatMessageAction({
				userName: userName,
				message: msg
			});
		});

		this.#socket.on('SN_SERVER_CLOCK_DATA', (msg) => {
			// TODO: VALIDATION
			const data = JSON.parse(msg);

			this.#view.timerView.setValue(data.time);
		});

		this.#socket.on('SN_SERVER_LOGIN', (msg) => {
			// TODO: VALIDATION
			const data = JSON.parse(msg);

			this.#view.init(data);
		});

		this.#socket.on('SN_SERVER_TRANSFORM_DATA', (msg) => {
			// TODO: VALIDATION
			const data = JSON.parse(msg);

			this.#view.update(data);
		});
	}

	#loginAction(args) {
		this.#socket.emit('SN_CLIENT_LOGIN', args.name, args.gender);
	}

	#addChatMessageAction(args) {
		this.#view.chatView.addChatMessage(args.userName, args.message);
	}

	#sendChatMessageAction(args) {
		this.#socket.emit('SN_CLIENT_CHAT_MESSAGE', args.message);
	}

	#sendTransformDataAction(args) {
		this.#socket.emit('SN_CLIENT_TRANSFORM_DATA', args);
	}
}

export default Controller;