import Config from '../model/config';
import Platform from '../model/platform';
import SocketMessage from '../model/socketMessage';

import { createServer } from 'http';
import { Server } from 'socket.io';

const http = createServer();
const io = new Server (http, {
	cors: {
		origin: '*'
	}
});


class Controller {
	private port: number;

	private config: Config;
	private platform: Platform;
	private socketMessage: SocketMessage;


	constructor() {
		this.port = Number(process.env.SERVER_PORT || 3000);

		this.config = new Config();
		this.socketMessage = new SocketMessage(io);

		this.platform = new Platform(this.config, this.socketMessage);

		this.init();
	}


	private init(): void {
		io.on('connection', (socket: any) => {
			console.log('user connected');

			if (!this.platform.addUser(socket.id)) {
				console.log('user disconnected');
				socket.disconnect(true);
			}

			socket.on('disconnect', () => {
				const userName = this.platform.getUserName(socket.id);

				if (this.platform.removeUser(socket.id)) {
					this.socketMessage.sendChatMessage('SYSTEM', userName + ' left the world');
				}
			});

			socket.on('SN_CLIENT_CHAT_MESSAGE', (chatMessage: string) => {
				this.socketMessage.sendChatMessage(
					this.platform.getUserName(socket.id),
					chatMessage
				);
			});

			socket.on('SN_CLIENT_LOGIN', (userName: string, userGender: string) => {
				this.platform.setUserData(socket.id, userName, userGender);

				const data = this.platform.getCreationPackage(socket.id);

				this.socketMessage.sendUserData(socket.id, data);
				this.socketMessage.sendChatMessage(
					'SYSTEM',
					this.platform.getUserName(socket.id) + ' joined the world'
				);
			});

			socket.on('SN_CLIENT_TRANSFORM_DATA', (data: any) => {
				// TODO: Validation
				this.platform.setTransformData(socket.id, data.position, data.rotation, data.state);
			});
		});

		http.listen(this.port, () => {
			console.log('listening on *:' + this.port);
		});

		this.platform.startAnimation();
	}
}

export = Controller;