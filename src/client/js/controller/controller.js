import { io } from 'socket.io-client';

import Chat from '../view/chat.js';
import Connect from '../view/connect.js';
import Login from '../view/login.js';
import View from '../view/view.js';

class Controller {
	constructor() {
		this._socket = null;

		this._chat = null;
		this._connect = null;
		this._login = null;
		this._view = null;

		this._init();
	}

	_init() {
		this._connect = new Connect();
		this._connect.addCallback('connectAction', this._connectAction.bind(this));
		this._connect.show();

		this._login = new Login();
		this._login.addCallback('loginAction', this._loginAction.bind(this));

		this._view = new View();
		this._view.addCallback('addChatMessageAction', this._addChatMessageAction.bind(this));
		this._view.addCallback('sendTransformDataAction', this._sendTransformDataAction.bind(this));

		this._chat = new Chat();
		this._chat.addCallback('sendChatMessageAction', this._sendChatMessageAction.bind(this));
	}

	_connectAction(args) {
		this._connect.setErrorMessage('Connect...');

		this._socket = io('ws://' + args.ip + ':3000', {
			reconnection: false,
			transports: ['websocket']
		});

		this._socket.on('connect', function() {
			this._connect.hide();
			this._login.show();
		}.bind(this));

		this._socket.on('disconnect', function() {
			this._socket.close();

			this._view.destroy();

			this._chat.hide();
			this._login.hide();

			this._connect.setErrorMessage('Disconnected');
			this._connect.show();
		}.bind(this));

		this._socket.on('connect_error', function(error) {
			// Fired when a namespace middleware error occurs.
			this._socket.close();

			this._view.destroy();

			this._chat.hide();
			this._login.hide();

			this._connect.setErrorMessage('Connection Error');
			this._connect.show();
		}.bind(this));


		this._socket.on('SN_SERVER_CHAT_MESSAGE', function(userName, msg) {
			this._addChatMessageAction({
				userName: userName,
				message: msg
			});
		}.bind(this));

		this._socket.on('SN_SERVER_LOGIN', function(msg) {
			this._login.hide();
			this._chat.show();

			// TODO: VALIDATION
			let data = JSON.parse(msg);

			this._view.init(data);
		}.bind(this));

		this._socket.on('SN_SERVER_TRANSFORM_DATA', function(msg) {
			// TODO: VALIDATION
			let data = JSON.parse(msg);

			this._view.update(data);
		}.bind(this));
	}

	_loginAction(args) {
		this._socket.emit('SN_CLIENT_LOGIN', args.name);
	}

	_addChatMessageAction(args) {
		this._chat.addChatMessage(args.userName, args.message);
	}

	_sendChatMessageAction(args) {
		this._socket.emit('SN_CLIENT_CHAT_MESSAGE', args.message);
	}

	_sendTransformDataAction(args) {
		this._socket.emit('SN_CLIENT_TRANSFORM_DATA', args);
	}
}

export default Controller;
