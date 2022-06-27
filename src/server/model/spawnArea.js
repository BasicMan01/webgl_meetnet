const fs = require('fs');

class SpawnArea {
	constructor() {
		const rawDataSpawnArea = fs.readFileSync('src/server/assets/spawnArea.json');

		this._spawnArea = JSON.parse(rawDataSpawnArea);
	}

	getRandomPos() {
		return this._randomInt(this._spawnArea.count);
	}

	_randomInt(max) {
		return Math.floor(Math.random() * max);
	}
}

module.exports = SpawnArea;