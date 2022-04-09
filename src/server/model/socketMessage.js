class SocketMessage {
	constructor(io) {
		this._io = io;
	}

	sendUserData(socketId, data) {
		this._io.to(socketId).emit('SN_SERVER_INIT_DATA', JSON.stringify(data));
	}

	/*
	sendGameData(data) {
		this._io.emit('SN_SERVER_MESSAGE', JSON.stringify(data));
	}
	*/
}

module.exports = SocketMessage;