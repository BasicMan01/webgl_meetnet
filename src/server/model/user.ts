import Quaternion from '../classes/quaternion';
import Vector3 from '../classes/vector3';

class User {
	private id: number;
	private gender: string = 'm';
	private name: string = '';
	private online: boolean = false;

	private state: string = 'character.animation.idle';
	private position: Vector3;
	private rotation: Quaternion;


	constructor(id: number) {
		this.id = id;

		this.position = new Vector3();
		this.rotation = new Quaternion();
	}

	isOnline(): boolean {
		return this.online;
	}

	setOnline(online: boolean): void {
		this.online = online;
	}

	getPosition(): any {
		return {
			'x': this.position.x,
			'y': this.position.y,
			'z': this.position.z
		};
	}

	setPosition(position: number[]): void {
		this.position.fromArray(position);
	}

	getRotation(): any {
		return {
			'x': this.rotation.x,
			'y': this.rotation.y,
			'z': this.rotation.z,
			'w': this.rotation.w
		};
	}

	setRotation(rotation: number[]) {
		this.rotation.fromArray(rotation);
	}

	setGender(gender: string): void {
		this.gender = gender === 'm' ? 'm' : 'w';
	}

	getName(): string {
		return this.name;
	}

	setName(name: string): void {
		this.name = name.substring(0, 10);
	}

	getState(): string {
		return this.state;
	}

	setState(state: string): void {
		this.state = state;
	}

	getNetworkPackage(): any {
		return {
			'id': this.id,
			'gender': this.gender,
			'name': this.name,
			'position': this.getPosition(),
			'rotation': this.getRotation(),
			'state': this.getState()
		};
	}
}

export = User;