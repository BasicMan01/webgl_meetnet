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

	isLocalUser() {
		return this._localUser;
	}

	getAnimationStateName() {
		return this._currentAnimation ? this._currentAnimation.name : 'idle';
	}

	setAnimationState(state) {
		let previewAction = this._currentAnimation;

		if (previewAction) {
			if (previewAction.name === state) {
				return;
			}
		}

		if (!this._animations.hasOwnProperty(state)) {
			return;
		}

		this._currentAnimation = this._animations[state];

		switch (state) {
			case 'idle':
				this._setIdle(previewAction);
				break;

			case 'walk':
				this._setWalk(previewAction);
				break;
		}
	}

	setModel(model) {
		this._model = model;

		// original wrong scale and animations
		//this._character.scale.setScalar(0.01);

		this._mixer = new AnimationMixer(this._model);

		this._animations['idle'] = {
			'name': 'idle',
			'action': this._mixer.clipAction(this._model.animations[2])
		};
		this._animations['walk'] = {
			'name': 'walk',
			'action': this._mixer.clipAction(this._model.animations[4])
		};

		this.setAnimationState('idle');

		this._object.add(this._model);
		this._object.add(this._createNameSprite());
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

	update(timeDelta) {
		if (this._inputManager) {
			if (this._inputManager.getKeyState(InputManager.KEY_W)) {
				this.setAnimationState('walk');
			} else {
				this.setAnimationState('idle');
			}


			let forward = new Vector3(0, 0, 1);
			forward.applyQuaternion(this._object.quaternion);
			forward.normalize();

			// for walk: timeDelta * 1.5
			// for run: timeDelta * 3.0
			forward.multiplyScalar(timeDelta * 1.5);

			if (this._inputManager.getMouseState(InputManager.MOUSE_LEFT)) {
				let rotation = new Euler().setFromQuaternion(this._camera.quaternion, 'YXZ');

				this._object.rotation.y = rotation.y + Math.PI;
			}

			if (this._inputManager.getKeyState(InputManager.KEY_W)) {
				this._object.position.add(forward);
				this._camera.position.add(forward);
			}

			// orbit controls rotate around new position
			this._controls.target.copy(new Vector3(this._object.position.x, 1.7, this._object.position.z));
			this._controls.update();
		} else {
			/*
			let forward = new Vector3(0, 0, 1);
			forward.applyQuaternion(this._object.quaternion);
			forward.normalize();

			// for walk: timeDelta * 1.5
			// for run: timeDelta * 3.0
			forward.multiplyScalar(timeDelta * 1.5);

			this._model.position.add(forward);
			*/
		}

		if (this._mixer) {
			this._mixer.update(timeDelta);
		}
	}

	initCameraPosition() {
		this._camera.position.copy(this._calculateCameraOffset());
	}

	_calculateCameraOffset() {
		let cameraOffset = new Vector3(0, 2.5, -3.0);

		cameraOffset.applyQuaternion(this._object.quaternion);
		cameraOffset.add(this._object.position);

		return cameraOffset;
	}

	_createNameSprite() {
		let box3 = new Box3();
		let size = new Vector3();
		let sprite = SpriteUtil.createSprite(this._name);

		box3.setFromObject(this._model).getSize(size);

		sprite.scale.set(1, 0.5, 1);
		sprite.position.y += size.y + 0.2;

		return sprite;
	}

	// TODO - State Machine
	_setIdle(previewAction) {
		let currentAction = this._animations['idle'].action;

		if (previewAction) {
			currentAction.time = 0.0;
			currentAction.enabled = true;
			currentAction.crossFadeFrom(previewAction.action, 0.3, true);
			currentAction.play();
		} else {
			// initial start
			currentAction.play();
		}
	}

	_setWalk(previewAction) {
		let currentAction = this._animations['walk'].action;

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