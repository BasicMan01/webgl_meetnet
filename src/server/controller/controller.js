let Config = require('../model/config.js');
let Platform = require('../model/platform.js');
let SocketMessage = require('../model/socketMessage.js');

let http = require('http').createServer();
let io = require('socket.io')(http, {
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
		io.on('connection', function(socket){
			console.log('user connected');

			if (!this._platform.addUser(socket.id)) {
				console.log('user disconnected');
				socket.disconnect(true);
			}

			socket.on('disconnect', function() {
				const userName = this._platform.getUserName(socket.id);

				if (this._platform.removeUser(socket.id)) {
					this._socketMessage.sendChatMessage('SYSTEM', userName + ' left the world');
				}
			}.bind(this));

			socket.on('SN_CLIENT_CHAT_MESSAGE', function(chatMessage) {
				this._socketMessage.sendChatMessage(
					this._platform.getUserName(socket.id),
					chatMessage
				);
			}.bind(this));

			socket.on('SN_CLIENT_LOGIN', function(userName, userGender) {
				this._platform.setUserData(socket.id, userName, userGender);

				let data = this._platform.getCreationPackage(socket.id);

				this._socketMessage.sendUserData(socket.id, data);
				this._socketMessage.sendChatMessage(
					'SYSTEM',
					this._platform.getUserName(socket.id) + ' joined the world'
				);
			}.bind(this));

			socket.on('SN_CLIENT_TRANSFORM_DATA', function(data) {
				// TODO: Validation
				this._platform.setTransformData(socket.id, data.position, data.rotation, data.state);
			}.bind(this));
		}.bind(this));

		http.listen(this._port, function(){
			console.log('listening on *:' + this._port);
		}.bind(this));

		this._platform.startAnimation();
	}
}

module.exports = Controller;
