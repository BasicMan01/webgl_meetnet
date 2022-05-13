import Observable from '../interface/observable.js';

class Chat extends Observable {
	constructor() {
		super();

		this._chat = document.getElementById('chat');
		this._chatMessage = document.getElementById('chatMessage');

		this._chatMessage.addEventListener('keydown', event => {
			switch (event.code) {
				case 'Enter': {
					this.emit('sendChatMessageAction', {
						'message': this._chatMessage.value
					});

					this._chatMessage.value = '';
				} break;
			}

			event.stopPropagation();
		});

		this._chatMessage.addEventListener('keyup', event => {
			event.stopPropagation();
		});
	}

	addChatMessage(userName, message) {
		let chatMessages = document.getElementById('chatMessages')
		let li = document.createElement('li');

		li.innerHTML = '[' + userName + ']: ' + message;
		//li.style.color = ''

		if (userName === 'SYSTEM') {
			li.style.fontStyle = "italic";
		}

		chatMessages.appendChild(li);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	show() {
		this._chat.classList.remove('hidden');
	}

	hide() {
		this._chat.classList.add('hidden');
	}
}

export default Chat;
