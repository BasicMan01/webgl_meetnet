/*
	Check the value of the readyState property. If it's HTMLMediaElement.HAVE_FUTURE_DATA, there's enough data
	available to begin playback and play for at least a short time. If it's HTMLMediaElement.HAVE_ENOUGH_DATA,
	then there's enough data available that, given the current download rate, you should be able to play the
	audio through to the end without interruption.
	(if (this.#music[key].readyState === this.#music[key].HAVE_ENOUGH_DATA))

	Listen for the canplay event. It is sent to the <audio> element when there's enough audio available
	to begin playback, although interruptions may occur.

	Listen for the canplaythrough event. It is sent when it's estimated that the audio should be able to
	play to the end without interruption.
*/

class SoundManager {
	#sound = {};


	constructor() {
	}

	add(key, path) {
		this.#sound[key] = new Audio(path);
		this.#sound[key].volume = 1.0;

		/*
			audio.addEventListener('loadeddata', () => {
				console.log('loadeddata');
			});

			audio.addEventListener("canplaythrough", (event) => {
				console.log('canplaythrough')
			});
		*/
	}

	play(key) {
		if (!Object.prototype.hasOwnProperty.call(this.#sound, key)) {
			return;
		}

		if (this.#sound[key].readyState === this.#sound[key].HAVE_ENOUGH_DATA) {
			this.#sound[key].play();
		}
	}

	stop(key) {
		if (!Object.prototype.hasOwnProperty.call(this.#sound, key)) {
			return;
		}

		this.#sound[key].pause();
		this.#sound[key].currentTime = 0;
	}
}

export default SoundManager;