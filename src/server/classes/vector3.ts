class Vector3 {
	x: number;
	y: number;
	z: number;


	constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	fromArray(a: number[]): void {
		this.x = a[0];
		this.y = a[1];
		this.z = a[2];
	}

	toArray(): number[] {
		return [this.x, this.y, this.z];
	}
}

export = Vector3;