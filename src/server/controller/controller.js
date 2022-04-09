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
		this._config = new Config();
		this._socketMessage = new SocketMessage(io);

		this._platform = new Platform(this._config, this._socketMessage);

		this._init();
	}

	_init() {
		io.on('connection', function(socket){
			console.log('user connected');

			if (this._platform.addUser(socket.id)) {
				let data = {
					'personalData': this._platform.getPersonalData(socket.id),
					'environmentData': {},
					'userData': {}
				};
				/*
				let data = {
					'isCreator': this._game.isCreator(socket.id),
					'playerData':
				};
				*/

				this._socketMessage.sendUserData(socket.id, data);
			} else {
				console.log('user disconnected');
				socket.disconnect(true);
			}

			socket.on('disconnect', function() {
				this._platform.removePlayer(socket.id);
			}.bind(this));

			/*
			socket.on('SN_CLIENT_TRANSFORM_DATA', function(data) {
				//this._game.setPosition(socket.id, parseInt(direction));
			}.bind(this));
			*/

			socket.on('SN_CLIENT_NAME', function(userName) {
				this._platform.setUserName(socket.id, userName);
			}.bind(this));
		}.bind(this));

		http.listen(3000, function(){
			console.log('listening on *:3000');
		});

		//this._game.startAnimation()
	}
}

module.exports = Controller;
