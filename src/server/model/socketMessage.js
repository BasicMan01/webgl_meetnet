class SocketMessage {
	constructor(io) {
		this._io = io;
	}

	sendChatMessage(userName, message) {
		this._io.emit('SN_SERVER_CHAT_MESSAGE', userName, this._parseChatMessage(message));
	}

	sendClockData(data) {
		this._io.emit('SN_SERVER_CLOCK_DATA', JSON.stringify(data));
	}

	sendUserData(socketId, data) {
		this._io.to(socketId).emit('SN_SERVER_LOGIN', JSON.stringify(data));
	}

	sendWorldData(data) {
		this._io.emit('SN_SERVER_TRANSFORM_DATA', JSON.stringify(data));
	}

	_parseChatMessage(message) {
		return message.replace(/>/g, '&gt;').replace(/</g, '&lt;');
	}
}

module.exports = SocketMessage;