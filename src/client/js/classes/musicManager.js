class MusicManager {
	constructor() {
		this._music = {};
	}

	add(key, path) {
		this._music[key] = new Audio(path);
		this._music[key].loop = true;
		this._music[key].volume = 0.25;

		/*
			audio.addEventListener('loadeddata', () => {
				console.log('loadeddata');
			});

			audio.addEventListener("canplaythrough", event => {
				console.log('canplaythrough')
			});
		*/
	}

	play(key) {
		if (!this._music.hasOwnProperty(key)) {
			return;
		}

		/*
			Check the value of the readyState property. If it's HTMLMediaElement.HAVE_FUTURE_DATA, there's enough data
			available to begin playback and play for at least a short time. If it's HTMLMediaElement.HAVE_ENOUGH_DATA,
			then there's enough data available that, given the current download rate, you should be able to play the
			audio through to the end without interruption.

			Listen for the canplay event. It is sent to the <audio> element when there's enough audio available
			to begin playback, although interruptions may occur.

			Listen for the canplaythrough event. It is sent when it's estimated that the audio should be able to
			play to the end without interruption.
		*/

		if (this._music[key].readyState === this._music[key].HAVE_ENOUGH_DATA) {
			this._music[key].play()
		}
	}

	stop(key) {
		if (!this._music.hasOwnProperty(key)) {
			return;
		}

		this._music[key].pause();
		this._music[key].currentTime = 0;
	}
}

export default MusicManager;