import {
	Mesh,
	Quaternion,
	Vector3
} from 'three';

class PhysicManager {
	#engine = {};

	#objects = [];
	#world = null;

	#characterController = null;


	constructor() {
	}

	init(callback) {
		import('@dimforge/rapier3d').then(RAPIER => {
			console.info('Physic Engine RAPIER loaded - Version: ' + RAPIER.version());

			this.#engine = RAPIER;
			this.#world = new this.#engine.World({ x: 0.0, y: -9.81, z: 0.0 });

			this.#characterController = this.#world.createCharacterController(0.01);
			this.#characterController.setUp({ x: 0.0, y: 1.0, z: 0.0 });
			this.#characterController.setMaxSlopeClimbAngle(60 * Math.PI / 180);
			// this.#characterController.setMinSlopeSlideAngle(45 * Math.PI / 180);
			this.#characterController.setMinSlopeSlideAngle(60 * Math.PI / 180); // for stairs
			this.#characterController.enableAutostep(0.3, 0.2, true);
			this.#characterController.enableSnapToGround(0.5);

			if (typeof callback === 'function') {
				callback();
			}
		});
	}

	addCollider(model) {
		model.traverse((child) => {
			const worldPosition = new Vector3();
			const worldQuaternion = new Quaternion();

			if (child instanceof Mesh) {
				try {
					if (child.userData.collision) {
						const vertices = child.geometry.attributes.position.array;
						// const indices = [...Array(vertices.length / 3).keys()]; // (FBX)
						const indices = child.geometry.index.array; // (GLB)

						child.getWorldPosition(worldPosition);
						child.getWorldQuaternion (worldQuaternion);
						child.visible = false;

						const rigidBodyDesc = new this.#engine.RigidBodyDesc(this.#engine.RigidBodyType.Fixed);
						const colliderDesc = new this.#engine.ColliderDesc(new this.#engine.TriMesh(vertices, indices));

						rigidBodyDesc.setTranslation(worldPosition.x, worldPosition.y, worldPosition.z);
						rigidBodyDesc.setRotation(worldQuaternion);

						// All done, actually build the rigid-body.
						const rigidBody = this.#world.createRigidBody(rigidBodyDesc);
						this.#world.createCollider(colliderDesc, rigidBody);
					}
				} catch(e) {
					console.error(e, child);
				}
			}
		});
	}

	createCharacterCollider(character) {
		const rigidBodyDesc = new this.#engine.RigidBodyDesc(this.#engine.RigidBodyType.KinematicPositionBased);
		const colliderDesc = new this.#engine.ColliderDesc(new this.#engine.Capsule(0.45, 0.45)); // height / 2 / width

		rigidBodyDesc.setTranslation(character.position.x, character.position.y, character.position.z);
		rigidBodyDesc.setRotation(character.quaternion);

		colliderDesc.translation.y = 0.91;

		const rigidBody = this.#world.createRigidBody(rigidBodyDesc);
		const collider = this.#world.createCollider(colliderDesc, rigidBody);

		character.userData.rigidBody = rigidBody;
		character.userData.rigidBodyDesc = rigidBodyDesc;
		character.userData.collider = collider;
	}

	debugRender() {
		return this.#world.debugRender();
	}

	getNextMovement(collider, direction) {
		const desiredPosition = new this.#engine.Vector3(direction.x, direction.y, direction.z);

		this.#characterController.computeColliderMovement(collider, desiredPosition);

		return this.#characterController.computedMovement();
	}

	update() {
		// Update world
		this.#world.step();

		// Update rigid bodies
		for (let i = 0; i < this.#objects.length; ++i) {
			const obj = this.#objects[i];

			const t = obj.userData.rigidBody.translation();
			const r = obj.userData.rigidBody.rotation();

			obj.position.set(t.x, t.y, t.z);
			obj.quaternion.set(r.x, r.y, r.z, r.w);
		}
	}
}

export default PhysicManager;