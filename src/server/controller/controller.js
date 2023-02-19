const Config = require('../model/config.js');
const Platform = require('../model/platform.js');
const SocketMessage = require('../model/socketMessage.js');

const http = require('http').createServer();
const io = require('socket.io')(http, {
	cors: {
		origin: '*'
	}
});

class Controller {
	constructor() {
		this._port = process.env.SERVER_PORT || 3000;

		this._config = new Config();
		this._socketMessage = new SocketMessage(io);

		this._platform = new Platform(this._config, this._socketMessage);

		this._init();
	}

	_init() {
		io.on('connection', (socket) => {
			console.log('user connected');

			if (!this._platform.addUser(socket.id)) {
				console.log('user disconnected');
				socket.disconnect(true);
			}

			socket.on('disconnect', () => {
				const userName = this._platform.getUserName(socket.id);

				if (this._platform.removeUser(socket.id)) {
					this._socketMessage.sendChatMessage('SYSTEM', userName + ' left the world');
				}
			});

			socket.on('SN_CLIENT_CHAT_MESSAGE', (chatMessage) => {
				this._socketMessage.sendChatMessage(
					this._platform.getUserName(socket.id),
					chatMessage
				);
			});

			socket.on('SN_CLIENT_LOGIN', (userName, userGender) => {
				this._platform.setUserData(socket.id, userName, userGender);

				const data = this._platform.getCreationPackage(socket.id);

				this._socketMessage.sendUserData(socket.id, data);
				this._socketMessage.sendChatMessage(
					'SYSTEM',
					this._platform.getUserName(socket.id) + ' joined the world'
				);
			});

			socket.on('SN_CLIENT_TRANSFORM_DATA', (data) => {
				// TODO: Validation
				this._platform.setTransformData(socket.id, data.position, data.rotation, data.state);
			});
		});

		http.listen(this._port, () => {
			console.log('listening on *:' + this._port);
		});

		this._platform.startAnimation();
	}
}

module.exports = Controller;