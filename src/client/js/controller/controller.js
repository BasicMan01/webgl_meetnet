import { io } from 'socket.io-client';

import View from '../view/view.js';

class Controller {
	constructor() {
		this._socket = null;
		this._view = null;

		this._init();
	}

	_init() {
		this._view = new View();
		this._view.addCallback('addChatMessageAction', this._addChatMessageAction.bind(this));
		this._view.addCallback('sendTransformDataAction', this._sendTransformDataAction.bind(this));

		// partial view
		this._view.chatView.addCallback('sendChatMessageAction', this._sendChatMessageAction.bind(this));
		this._view.connectView.addCallback('connectAction', this._connectAction.bind(this));
		this._view.loginView.addCallback('loginAction', this._loginAction.bind(this));
	}

	_connectAction(args) {
		this._view.connectView.setErrorMessage('Connect...');

		this._socket = io('ws://' + args.ip + ':' + process.env.SERVER_PORT, {
			reconnection: false,
			transports: ['websocket']
		});

		this._socket.on('connect', () => {
			this._view.connect();
		});

		this._socket.on('disconnect', () => {
			this._socket.close();

			this._view.destroy();
			this._view.connectView.setErrorMessage('Disconnected');
		});

		this._socket.on('connect_error', () => {
			// Fired when a namespace middleware error occurs.
			this._socket.close();

			this._view.destroy();
			this._view.connectView.setErrorMessage('Connection Error');
		});


		this._socket.on('SN_SERVER_CHAT_MESSAGE', (userName, msg) => {
			this._addChatMessageAction({
				userName: userName,
				message: msg
			});
		});

		this._socket.on('SN_SERVER_CLOCK_DATA', (msg) => {
			// TODO: VALIDATION
			const data = JSON.parse(msg);

			this._view.timerView.setValue(data.time);
		});

		this._socket.on('SN_SERVER_LOGIN', (msg) => {
			// TODO: VALIDATION
			const data = JSON.parse(msg);

			this._view.init(data);
		});

		this._socket.on('SN_SERVER_TRANSFORM_DATA', (msg) => {
			// TODO: VALIDATION
			const data = JSON.parse(msg);

			this._view.update(data);
		});
	}

	_loginAction(args) {
		this._socket.emit('SN_CLIENT_LOGIN', args.name, args.gender);
	}

	_addChatMessageAction(args) {
		this._view.chatView.addChatMessage(args.userName, args.message);
	}

	_sendChatMessageAction(args) {
		this._socket.emit('SN_CLIENT_CHAT_MESSAGE', args.message);
	}

	_sendTransformDataAction(args) {
		this._socket.emit('SN_CLIENT_TRANSFORM_DATA', args);
	}
}

export default Controller;