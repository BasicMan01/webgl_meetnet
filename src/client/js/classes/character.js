import {
	AnimationMixer,
	Box3,
	Euler,
	Group,
	Vector3
} from 'three';

import InputManager from './inputManager.js';
import SpriteUtil from '../util/spriteUtil.js';

class Character {
	#camera;
	#controls;
	#scene;
	#inputManager;
	#physicManager;

	#id;
	#name;
	#localUser;
	#model = null;
	#object = new Group();
	#velocity = new Vector3(3.0, 9.81, 3.0); // for walk: 1.5 | for run: 3.0
	#animations = {};

	#mixer = null;
	#currentAnimation = null;


	constructor(id, name, inputManager, physicManager, camera, controls, scene) {
		this.#camera = camera;
		this.#controls = controls;
		this.#scene = scene;
		this.#inputManager = inputManager;
		this.#physicManager = physicManager;

		this.#id = id;
		this.#name = name;
		this.#localUser = inputManager ? true : false;

		this.#scene.add(this.#object);

		if (this.#physicManager) {
			this.#physicManager.createCharacterCollider(this.#object);
		}
	}

	destroy() {
		if (this.#model) {
			this.#model.traverse((child) => {
				if (child.material) {
					child.material.dispose();
				}

				if (child.geometry) {
					child.geometry.dispose();
				}
			});

			this.#model = null;
		}

		this.#scene.remove(this.#object);
	}

	isLocalUser() {
		return this.#localUser;
	}

	getAnimationStateName() {
		return this.#currentAnimation ? this.#currentAnimation.name : 'character.animation.idle';
	}

	setAnimationState(state) {
		const previewAction = this.#currentAnimation;

		if (previewAction) {
			if (previewAction.name === state) {
				return;
			}
		}

		if (!Object.prototype.hasOwnProperty.call(this.#animations, state)) {
			return;
		}

		this.#currentAnimation = this.#animations[state];

		switch (state) {
			case 'character.animation.idle':
				this.#setIdle(previewAction);
				break;

			case 'character.animation.run':
				this.#setRun(previewAction);
				break;
		}
	}

	getId() {
		return this.#id;
	}

	getPosition() {
		return this.#object.position;
	}

	setPosition(vector3) {
		this.#object.position.copy(vector3);
	}

	getRotation() {
		return this.#object.quaternion;
	}

	setRotation(quaternion) {
		this.#object.quaternion.copy(quaternion);
	}

	load(objectManager, key) {
		objectManager.load(key, (key, object) => {
			object.scale.setScalar(0.01);

			this.#setModel(object);

			objectManager.loadAll(
				[
					'character.animation.idle',
					'character.animation.run'
				],
				(key, object) => {
					this.#addAnimation(key, object.animations[0]);
				},
				() => {
					this.setAnimationState('character.animation.idle');
				}
			);
		});
	}

	update(timeDelta) {
		if (this.#inputManager) {
			if (this.#inputManager.getKeyState(InputManager.KEY_W)) {
				this.setAnimationState('character.animation.run');
			} else {
				this.setAnimationState('character.animation.idle');
			}

			if (this.#inputManager.getMouseState(InputManager.MOUSE_RIGHT)) {
				const rotation = new Euler().setFromQuaternion(this.#camera.quaternion, 'YXZ');

				this.#object.rotation.y = rotation.y + Math.PI;
			}

			const isForward = this.#inputManager.getKeyState(InputManager.KEY_W);
			const direction = new Vector3(0, -1, isForward ? 1 : 0);

			direction.applyQuaternion(this.#object.quaternion);
			direction.normalize();
			direction.multiply(this.#velocity);
			direction.multiplyScalar(timeDelta);

			const correctedMovement = this.#physicManager.getNextMovement(this.#object.userData.collider, direction);
			const translation = this.#object.userData.rigidBody.translation();

			this.#object.userData.rigidBody.setNextKinematicTranslation({
				x: translation.x + correctedMovement.x,
				y: translation.y + correctedMovement.y,
				z: translation.z + correctedMovement.z
			});

			this.#object.position.add(correctedMovement);
			this.#camera.position.add(correctedMovement);

			const characterTarget = new Vector3(
				this.#object.position.x,
				this.#object.position.y + 1.7,
				this.#object.position.z
			);

			// orbit controls rotate around new position
			this.#controls.target.copy(characterTarget);
			this.#controls.update();


			// camera collision
			const rayDiff = characterTarget.clone().sub(this.#camera.position);
			const rayDirection = rayDiff.clone().normalize();

			const maxToi = rayDiff.length();
			const ray = this.#physicManager.createRay(this.#camera.position, rayDirection);

			const hit = this.#physicManager.castRay(ray, maxToi);
			if (hit != null) {
				this.#camera.position.add(rayDirection.multiplyScalar(hit.toi));
			}

		} else {
			if (this.getAnimationStateName() === 'character.animation.run') {
				const direction = new Vector3(0, 0, 1);

				direction.applyQuaternion(this.#object.quaternion);
				direction.normalize();
				direction.multiply(this.#velocity);
				direction.multiplyScalar(timeDelta);

				this.#object.position.add(direction);
			}
		}

		if (this.#mixer) {
			this.#mixer.update(timeDelta);
		}
	}

	initCameraPosition() {
		this.#camera.position.copy(this.#calculateCameraOffset());
	}


	#addAnimation(key, animation) {
		this.#animations[key] = {
			'name': key,
			'action': this.#mixer.clipAction(animation)
		};
	}

	#calculateCameraOffset() {
		const cameraOffset = new Vector3(0, 2.5, -3.0);

		cameraOffset.applyQuaternion(this.#object.quaternion);
		cameraOffset.add(this.#object.position);

		return cameraOffset;
	}

	#createNameSprite() {
		const box3 = new Box3();
		const size = new Vector3();
		const sprite = SpriteUtil.createSprite(this.#name);

		box3.setFromObject(this.#model).getSize(size);

		sprite.scale.set(1, 0.5, 1);
		sprite.position.y += size.y + 0.2;

		return sprite;
	}

	#setModel(model) {
		this.#model = model;

		this.#mixer = new AnimationMixer(this.#model);

		this.#object.add(this.#model);
		this.#object.add(this.#createNameSprite());
	}

	// TODO - State Machine
	#setIdle(previewAction) {
		const currentAction = this.#animations['character.animation.idle'].action;

		if (previewAction) {
			currentAction.time = 0.0;
			currentAction.enabled = true;
			currentAction.setEffectiveTimeScale(1.0);
			currentAction.setEffectiveWeight(1.0);
			currentAction.crossFadeFrom(previewAction.action, 0.3, true);
			currentAction.play();
		} else {
			// initial start
			currentAction.play();
		}
	}

	#setRun(previewAction) {
		const currentAction = this.#animations['character.animation.run'].action;

		if (previewAction) {
			currentAction.time = 0.0;
			currentAction.enabled = true;
			currentAction.setEffectiveTimeScale(1.0);
			currentAction.setEffectiveWeight(1.0);
			currentAction.crossFadeFrom(previewAction.action, 0.3, true);
			currentAction.play();
		} else {
			// initial start
			currentAction.play();
		}
	}
}

export default Character;