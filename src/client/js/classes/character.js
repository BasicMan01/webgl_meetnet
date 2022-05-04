import {
	AnimationMixer,
	Euler,
	Vector3
} from 'three';

import InputManager from './inputManager.js';

class Character {
	constructor(inputManager, camera, controls) {
		this._camera = camera;
		this._controls = controls;
		this._inputManager = inputManager;

		this._name = '';
		this._model = null;
		this._animations = {};
		//this._position = new Vector3();

		this._mixer = null;
		this._currentAnimation = null;

		// test
		this.id = 0;
		this.loaded = false;
		this.localUser = false;
	}

	getAnimationStateName() {
		return this._currentAnimation.name;
	}

	setAnimationState(state) {
		let previewAction = this._currentAnimation;

		if (previewAction) {
			if (previewAction.name === state) {
				return;
			}
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

		if (this.localUser) {
			this._camera.position.copy(this._calculateCameraOffset());
		}

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
	}

	getPosition() {
		return this._model.position;
	}

	setPosition(vector3) {
		this._model.position.copy(vector3);
	}

	getRotation() {
		return this._model.quaternion;
	}

	setRotation(quaternion) {
		this._model.quaternion.copy(quaternion);
	}

	update(timeDelta) {
		if (!this.loaded) {
			return;
		}

		if (this.localUser) {
			if (this._inputManager.getKeyState(InputManager.KEY_W)) {
				this.setAnimationState('walk');
			} else {
				this.setAnimationState('idle');
			}


			let forward = new Vector3(0, 0, 1);
			forward.applyQuaternion(this._model.quaternion);
			forward.normalize();

			// for walk: timeDelta * 1.5
			// for run: timeDelta * 3.0
			forward.multiplyScalar(timeDelta * 1.5);

			if (this._inputManager.getMouseState(InputManager.MOUSE_LEFT)) {
				let rotation = new Euler().setFromQuaternion(this._camera.quaternion, 'YXZ');

				this._model.rotation.y = rotation.y + Math.PI;
			}

			if (this._inputManager.getKeyState(InputManager.KEY_W)) {
				this._model.position.add(forward);
				this._camera.position.add(forward);
			}

			// orbit controls rotate around new position
			this._controls.target.copy(new Vector3(this._model.position.x, 1.7, this._model.position.z));
			this._controls.update();
		} else {
			/*
			let forward = new Vector3(0, 0, 1);
			forward.applyQuaternion(this._model.quaternion);
			forward.normalize();

			// for walk: timeDelta * 1.5
			// for run: timeDelta * 3.0
			forward.multiplyScalar(timeDelta * 1.5);

			this._model.position.add(forward);
			*/
		}

		this._mixer.update(timeDelta);
	}

	_calculateCameraOffset() {
		let cameraOffset = new Vector3(0, 2.5, -3.0);

		cameraOffset.applyQuaternion(this._model.quaternion);
		cameraOffset.add(this._model.position);

		return cameraOffset;
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