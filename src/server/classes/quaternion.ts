class Quaternion {
	w: number;
	x: number;
	y: number;
	z: number;


	constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
		this.w = w;
		this.x = x;
		this.y = y;
		this.z = z;
	}

	fromArray(a: number[]) {
		this.x = a[0];
		this.y = a[1];
		this.z = a[2];
		this.w = a[3];
	}

	toArray(): number[] {
		return [this.x, this.y, this.z, this.w];
	}
}

export = Quaternion;