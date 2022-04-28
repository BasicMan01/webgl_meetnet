class SocketMessage {
	constructor(io) {
		this._io = io;
	}

	sendChatMessage(userName, message) {
		this._io.emit('SN_SERVER_CHAT_MESSAGE', userName, this._parseChatMessage(message));
	}

	sendUserData(socketId, data) {
		this._io.to(socketId).emit('SN_SERVER_INIT_DATA', JSON.stringify(data));
	}

	/*
	sendGameData(data) {
		this._io.emit('SN_SERVER_MESSAGE', JSON.stringify(data));
	}
	*/

	_parseChatMessage(message) {
		return message.replace(/>/g, '&gt;').replace(/</g, '&lt;');
	}
}

module.exports = SocketMessage;