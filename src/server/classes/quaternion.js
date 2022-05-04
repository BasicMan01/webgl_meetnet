class Quaternion {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.w = w;
		this.x = x;
		this.y = y;
		this.z = z;
	}

	fromArray(a) {
		this.x = a[0];
		this.y = a[1];
		this.z = a[2];
		this.w = a[3];
	}

	toArray() {
		return [this.x, this.y, this.z, this.w];
	}
}

module.exports = Quaternion;