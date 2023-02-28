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

class MusicManager {
	#music = {};
	#currentTrack = null;


	constructor() {
	}

	add(key, path) {
		this.#music[key] = path;
	}

	play(key) {
		if (this.#currentTrack) {
			return;
		}

		if (!Object.prototype.hasOwnProperty.call(this.#music, key)) {
			return;
		}

		this.#currentTrack = new Audio(this.#music[key]);
		this.#currentTrack.loop = true;
		this.#currentTrack.volume = 0.25;
		this.#currentTrack.addEventListener('canplaythrough', () => {
			this.#currentTrack.play();
		});
	}

	stop() {
		if (!this.#currentTrack) {
			return;
		}

		this.#currentTrack.pause();
		this.#currentTrack = null;
	}
}

export default MusicManager;