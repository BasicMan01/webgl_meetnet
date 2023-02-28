import Observable from '../../interface/observable.js';

class Chat extends Observable {
	#chat;
	#chatMessage;

	constructor() {
		super();

		this.#chat = document.getElementById('chat');
		this.#chatMessage = document.getElementById('chatMessage');

		this.#chatMessage.addEventListener('keydown', (event) => {
			switch (event.code) {
				case 'Enter': {
					this.emit('sendChatMessageAction', {
						'message': this.#chatMessage.value
					});

					this.#chatMessage.value = '';
				} break;
			}

			event.stopPropagation();
		});

		this.#chatMessage.addEventListener('keyup', (event) => {
			event.stopPropagation();
		});
	}

	addChatMessage(userName, message) {
		const chatMessages = document.getElementById('chatMessages');
		const li = document.createElement('li');

		li.innerHTML = '[' + userName + ']: ' + message;
		// li.style.color = ''

		if (userName === 'SYSTEM') {
			li.style.fontStyle = 'italic';
		}

		chatMessages.appendChild(li);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	show() {
		this.#chat.classList.remove('hidden');
	}

	hide() {
		this.#chat.classList.add('hidden');
	}
}

export default Chat;