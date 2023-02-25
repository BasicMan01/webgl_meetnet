import * as fs from 'fs';

class SpawnArea {
	private spawnArea: { count: number };


	constructor() {
		const rawDataSpawnArea = fs.readFileSync('src/server/assets/spawnArea.json', 'utf-8');

		this.spawnArea = JSON.parse(rawDataSpawnArea);
	}

	getRandomPos(): number {
		return this.randomInt(this.spawnArea.count);
	}


	private randomInt(max: number): number {
		return Math.floor(Math.random() * max);
	}
}

export = SpawnArea;