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

	#id;
	#name;
	#localUser;
	#model = null;
	#object;
	#animations = {};

	#mixer = null;
	#currentAnimation = null;


	constructor(id, name, inputManager, camera, controls, scene) {
		this.#camera = camera;
		this.#controls = controls;
		this.#scene = scene;
		this.#inputManager = inputManager;

		this.#id = id;
		this.#name = name;
		this.#localUser = inputManager ? true : false;
		this.#object = new Group();

		this.#scene.add(this.#object);
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

			case 'character.animation.walk':
				this.#setWalk(previewAction);
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
					'character.animation.walk'
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
				this.setAnimationState('character.animation.walk');
			} else {
				this.setAnimationState('character.animation.idle');
			}

			if (this.#inputManager.getMouseState(InputManager.MOUSE_LEFT)) {
				const rotation = new Euler().setFromQuaternion(this.#camera.quaternion, 'YXZ');

				this.#object.rotation.y = rotation.y + Math.PI;
			}

			if (this.#inputManager.getKeyState(InputManager.KEY_W)) {
				const forward = new Vector3(0, 0, 1);

				forward.applyQuaternion(this.#object.quaternion);
				forward.normalize();

				// for walk: timeDelta * 1.5
				// for run: timeDelta * 3.0
				forward.multiplyScalar(timeDelta * 1.5);

				this.#object.position.add(forward);
				this.#camera.position.add(forward);

				// orbit controls rotate around new position
				this.#controls.target.copy(new Vector3(this.#object.position.x, 1.7, this.#object.position.z));
				this.#controls.update();
			}
		} else {
			if (this.getAnimationStateName() === 'character.animation.walk') {
				const forward = new Vector3(0, 0, 1);

				forward.applyQuaternion(this.#object.quaternion);
				forward.normalize();

				// for walk: timeDelta * 1.5
				// for run: timeDelta * 3.0
				forward.multiplyScalar(timeDelta * 1.5);

				this.#object.position.add(forward);
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

	#setWalk(previewAction) {
		const currentAction = this.#animations['character.animation.walk'].action;

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