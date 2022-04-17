import { io } from 'socket.io-client';
import View from '../view/view.js';

class Controller {
	constructor() {
		console.log('START CONTROLLER');

		this._socket = null;
		this._view = null;

		this._init();
	}

	_init() {
		this._view = new View();

		this._view.showLogin(true);

		this._view.addCallback('connectAction', this._connectAction.bind(this));
		//this._view.addCallback('sendTransformDataAction', this.sendTransformDataAction.bind(this));
	}

	_connectAction(args) {
		this._view.showErrorMessage('Connect...');

		console.log(io);
		this._socket = io('http://' + args.ip + ':3000', {
			reconnection: false
		});

		console.log(this._socket);

		this._socket.on('connect', function() {
			if (this._socket.connected) {
				console.log('CONNECTED');

				this._socket.emit('SN_CLIENT_NAME', args.nickname);

				this._view.showLogin(false);
			} else {
				console.log('CONNECTION FAILED');
			}
		}.bind(this));

		this._socket.on('disconnect', function() {
			this._socket.close();

			this._view.showErrorMessage('Disconnected');
			this._view.showLogin(true);
		}.bind(this));

		this._socket.on('connect_error', function(error) {
			this._socket.close();

			this._view.showErrorMessage('Connection Error');
		}.bind(this));

		this._socket.on('connect_timeout', function(timeout) {
			this._socket.close();

			this._view.showErrorMessage('Connection Timeout');
		}.bind(this));

		this._socket.on('SN_SERVER_INIT_DATA', function(msg) {
			// TODO: VALIDATION
			let data = JSON.parse(msg);

			this._view.init(data);
		}.bind(this));

		/*
		this._socket.on('SN_SERVER_MESSAGE', function(msg) {
			// TODO VALIDATION
			let data = JSON.parse(msg);

			this._view.updateData(data);
		}.bind(this));
		*/
	}

	/*
	sendTransformDataAction(args) {
		this._socket.emit('SN_CLIENT_TRANSFORM_DATA', args.keyCode);
	}
	*/
}

export default Controller;
