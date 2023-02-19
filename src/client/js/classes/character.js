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
	constructor(id, name, inputManager, camera, controls, scene) {
		this._camera = camera;
		this._controls = controls;
		this._scene = scene;
		this._inputManager = inputManager;

		this._id = id;
		this._name = name;
		this._localUser = inputManager ? true : false;
		this._model = null;
		this._object = new Group();
		this._animations = {};

		this._mixer = null;
		this._currentAnimation = null;

		this._scene.add(this._object);
	}

	destroy() {
		if (this._model) {
			this._model.traverse(child => {
				if (child.material) {
					child.material.dispose();
				}

				if (child.geometry) {
					child.geometry.dispose();
				}
			});

			this._model = null;
		}

		this._scene.remove(this._object);
	}

	isLocalUser() {
		return this._localUser;
	}

	getAnimationStateName() {
		return this._currentAnimation ? this._currentAnimation.name : 'character.animation.idle';
	}

	setAnimationState(state) {
		const previewAction = this._currentAnimation;

		if (previewAction) {
			if (previewAction.name === state) {
				return;
			}
		}

		if (!Object.prototype.hasOwnProperty.call(this._animations, state)) {
			return;
		}

		this._currentAnimation = this._animations[state];

		switch (state) {
			case 'character.animation.idle':
				this._setIdle(previewAction);
				break;

			case 'character.animation.walk':
				this._setWalk(previewAction);
				break;
		}
	}

	getId() {
		return this._id;
	}

	getPosition() {
		return this._object.position;
	}

	setPosition(vector3) {
		this._object.position.copy(vector3);
	}

	getRotation() {
		return this._object.quaternion;
	}

	setRotation(quaternion) {
		this._object.quaternion.copy(quaternion);
	}

	load(objectManager, key) {
		objectManager.load(key, (key, object) => {
			object.scale.setScalar(0.01);

			this._setModel(object);

			objectManager.loadAll(
				[
					'character.animation.idle',
					'character.animation.walk'
				],
				(key, object) => {
					this._addAnimation(key, object.animations[0]);
				},
				() => {
					this.setAnimationState('character.animation.idle');
				}
			);
		});
	}

	update(timeDelta) {
		if (this._inputManager) {
			if (this._inputManager.getKeyState(InputManager.KEY_W)) {
				this.setAnimationState('character.animation.walk');
			} else {
				this.setAnimationState('character.animation.idle');
			}

			if (this._inputManager.getMouseState(InputManager.MOUSE_LEFT)) {
				const rotation = new Euler().setFromQuaternion(this._camera.quaternion, 'YXZ');

				this._object.rotation.y = rotation.y + Math.PI;
			}

			if (this._inputManager.getKeyState(InputManager.KEY_W)) {
				const forward = new Vector3(0, 0, 1);

				forward.applyQuaternion(this._object.quaternion);
				forward.normalize();

				// for walk: timeDelta * 1.5
				// for run: timeDelta * 3.0
				forward.multiplyScalar(timeDelta * 1.5);

				this._object.position.add(forward);
				this._camera.position.add(forward);

				// orbit controls rotate around new position
				this._controls.target.copy(new Vector3(this._object.position.x, 1.7, this._object.position.z));
				this._controls.update();
			}
		} else {
			if (this.getAnimationStateName() === 'character.animation.walk') {
				const forward = new Vector3(0, 0, 1);

				forward.applyQuaternion(this._object.quaternion);
				forward.normalize();

				// for walk: timeDelta * 1.5
				// for run: timeDelta * 3.0
				forward.multiplyScalar(timeDelta * 1.5);

				this._object.position.add(forward);
			}
		}

		if (this._mixer) {
			this._mixer.update(timeDelta);
		}
	}

	initCameraPosition() {
		this._camera.position.copy(this._calculateCameraOffset());
	}

	_addAnimation(key, animation) {
		this._animations[key] = {
			'name': key,
			'action': this._mixer.clipAction(animation)
		};
	}

	_calculateCameraOffset() {
		const cameraOffset = new Vector3(0, 2.5, -3.0);

		cameraOffset.applyQuaternion(this._object.quaternion);
		cameraOffset.add(this._object.position);

		return cameraOffset;
	}

	_createNameSprite() {
		const box3 = new Box3();
		const size = new Vector3();
		const sprite = SpriteUtil.createSprite(this._name);

		box3.setFromObject(this._model).getSize(size);

		sprite.scale.set(1, 0.5, 1);
		sprite.position.y += size.y + 0.2;

		return sprite;
	}

	_setModel(model) {
		this._model = model;

		this._mixer = new AnimationMixer(this._model);

		this._object.add(this._model);
		this._object.add(this._createNameSprite());
	}

	// TODO - State Machine
	_setIdle(previewAction) {
		const currentAction = this._animations['character.animation.idle'].action;

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

	_setWalk(previewAction) {
		const currentAction = this._animations['character.animation.walk'].action;

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