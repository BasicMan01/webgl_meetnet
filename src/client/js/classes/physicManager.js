class PhysicManager {
	#engine = {};

	#objects = [];
	#world = null;


	constructor() {
	}

	init(callback) {
		import('@dimforge/rapier3d').then(RAPIER => {
			console.info('Physic Engine RAPIER loaded - Version: ' + RAPIER.version());

			this.#engine = RAPIER;
			this.#world = new this.#engine.World({ x: 0.0, y: -60, z: 0.0 });

			if (typeof callback === 'function') {
				callback();
			}
		});
	}

	addCollider(model) {
		for (let i = 0; i < model.length; ++i) {
			const child = model.children[i];

			const vertices = child.geometry.attributes.position.array;
			const indices = [...Array(vertices.length / 3).keys()];

			const rigidBodyDesc = new this.#engine.RigidBodyDesc(this.#engine.RigidBodyType.Fixed);
			const colliderDesc = new this.#engine.ColliderDesc(new this.#engine.TriMesh(vertices, indices));

			rigidBodyDesc.setTranslation(child.position.x, child.position.y, child.position.z);
			rigidBodyDesc.setRotation(child.quaternion);

			// All done, actually build the rigid-body.
			const rigidBody = this._physicsWorld.createRigidBody(rigidBodyDesc);
			this._physicsWorld.createCollider(colliderDesc, rigidBody);
		}
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

		/*
		if (this._properties.debugHelperActive) {
			const buffers = this._physicsWorld.debugRender();

			this._debugHelper.geometry.setAttribute('position', new THREE.BufferAttribute(buffers.vertices, 3));
			this._debugHelper.geometry.setAttribute('color', new THREE.BufferAttribute(buffers.colors, 4));
		} else {
			this._debugHelper.geometry.deleteAttribute('position');
			this._debugHelper.geometry.deleteAttribute('color');
		}
		*/
	}
}

export default PhysicManager;