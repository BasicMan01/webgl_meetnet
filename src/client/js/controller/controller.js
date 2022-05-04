import { io } from 'socket.io-client';

import Chat from '../view/chat.js';
import Login from '../view/login.js';
import View from '../view/view.js';

class Controller {
	constructor() {
		console.log('START CONTROLLER');

		this._socket = null;

		this._chat = null;
		this._login = null;
		this._view = null;

		this._init();
	}

	_init() {
		this._login = new Login();
		this._login.addCallback('connectAction', this._connectAction.bind(this));
		this._login.show();

		this._chat = new Chat();
		this._chat.addCallback('sendChatMessageAction', this._sendChatMessageAction.bind(this));
	}

	_connectAction(args) {
		this._login.setErrorMessage('Connect...');

		this._socket = io('ws://' + args.ip + ':3000', {
			reconnection: false,
			transports: ['websocket']
		});

		this._socket.on('connect', function() {
			if (this._socket.connected) {
				console.log('CONNECTED');

				this._socket.emit('SN_CLIENT_NAME', args.nickname);

				this._login.hide();
			} else {
				console.log('CONNECTION FAILED');
			}
		}.bind(this));

		this._socket.on('disconnect', function() {
			this._socket.close();

			this._view.destroy();

			this._login.setErrorMessage('Disconnected');
			this._login.show();
		}.bind(this));

		this._socket.on('connect_error', function(error) {
			this._socket.close();

			this._login.setErrorMessage('Connection Error');
		}.bind(this));

		this._socket.on('connect_timeout', function(timeout) {
			this._socket.close();

			this._login.setErrorMessage('Connection Timeout');
		}.bind(this));

		this._socket.on('SN_SERVER_CHAT_MESSAGE', function(userName, msg) {
			this._chat.addChatMessage(userName, msg);
		}.bind(this));

		this._socket.on('SN_SERVER_INIT_DATA', function(msg) {
			// TODO: VALIDATION
			let data = JSON.parse(msg);

			this._view = new View();
			this._view.addCallback('sendTransformDataAction', this._sendTransformDataAction.bind(this));
			this._view.init(data);
		}.bind(this));

		this._socket.on('SN_SERVER_TRANSFORM_DATA', function(msg) {
			// TODO: VALIDATION
			let data = JSON.parse(msg);

			this._view.update(data);
		}.bind(this));
	}

	_sendChatMessageAction(args) {
		this._socket.emit('SN_CLIENT_CHAT_MESSAGE', args.message);
	}

	_sendTransformDataAction(args) {
		this._socket.emit('SN_CLIENT_TRANSFORM_DATA', args);
	}
}

export default Controller;
