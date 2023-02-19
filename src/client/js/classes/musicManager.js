/*
	Check the value of the readyState property. If it's HTMLMediaElement.HAVE_FUTURE_DATA, there's enough data
	available to begin playback and play for at least a short time. If it's HTMLMediaElement.HAVE_ENOUGH_DATA,
	then there's enough data available that, given the current download rate, you should be able to play the
	audio through to the end without interruption.
	(if (this._music[key].readyState === this._music[key].HAVE_ENOUGH_DATA))

	Listen for the canplay event. It is sent to the <audio> element when there's enough audio available
	to begin playback, although interruptions may occur.

	Listen for the canplaythrough event. It is sent when it's estimated that the audio should be able to
	play to the end without interruption.
*/

class MusicManager {
	constructor() {
		this._music = {};
		this._currentTrack = null;
	}

	add(key, path) {
		this._music[key] = path;
	}

	play(key) {
		if (this._currentTrack) {
			return;
		}

		if (!Object.prototype.hasOwnProperty.call(this._music, key)) {
			return;
		}

		this._currentTrack = new Audio(this._music[key]);
		this._currentTrack.loop = true;
		this._currentTrack.volume = 0.25;
		this._currentTrack.addEventListener('canplaythrough', () => {
			this._currentTrack.play();
		});
	}

	stop() {
		if (!this._currentTrack) {
			return;
		}

		this._currentTrack.pause();
		this._currentTrack = null;
	}
}

export default MusicManager;