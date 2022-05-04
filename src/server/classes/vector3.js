class Vector3 {
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	fromArray(a) {
		this.x = a[0];
		this.y = a[1];
		this.z = a[2];
	}

	toArray() {
		return [this.x, this.y, this.z];
	}
}

module.exports = Vector3;