class SocketMessage {
	private io: any;


	constructor(io: any) {
		this.io = io;
	}

	sendChatMessage(userName: string, message: string): void {
		this.io.emit('SN_SERVER_CHAT_MESSAGE', userName, this.parseChatMessage(message));
	}

	sendClockData(data: any): void {
		this.io.emit('SN_SERVER_CLOCK_DATA', JSON.stringify(data));
	}

	sendUserData(socketId: number, data: any): void {
		this.io.to(socketId).emit('SN_SERVER_LOGIN', JSON.stringify(data));
	}

	sendWorldData(data: any): void {
		this.io.emit('SN_SERVER_TRANSFORM_DATA', JSON.stringify(data));
	}


	private parseChatMessage(message: string): string {
		return message.replace(/>/g, '&gt;').replace(/</g, '&lt;');
	}
}

export = SocketMessage;