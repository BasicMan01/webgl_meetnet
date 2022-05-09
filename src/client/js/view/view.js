import * as THREE from 'three';

/*
import {
	AnimationMixer,
	Clock,
	Color,
	Fog,
	GridHelper,
	MOUSE,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	Vector3,
	WebGLRenderer
} from 'three';
*/

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Observable from '../interface/observable.js';

import Character from '../classes/character.js';
import InputManager from '../classes/inputManager.js';
import MusicManager from '../classes/musicManager.js';
import SoundManager from '../classes/soundManager.js';
import ObjectManager from '../classes/objectManager.js';

import ShaderUtil from '../util/shaderUtil.js';



/*
//https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera/blob/main/main.js

First of all, the Controls were designed to be controlling a camera, and not an object. And since by default, objects look "up" the z-axis, and cameras look "down" the z-axis, it is unlikely that the Controls will work as expected when applied to something other than a camera.

Secondly, the Controls are part of the examples, and not the library, so they are not officially supported. You are free to hack away at them.

One way to achieve what you want is to make the camera a child of your player. Something like this:

player.add( camera );
camera.position.set( 0, 50, 100 );
You may, in your render loop, need to set:

camera.lookAt( player.position );
Then you want to control the player with the mouse or keyboard. Your best bet is to write your own controller to do that. There are plenty of examples on the net.
*/

class View extends Observable {
	constructor() {
		super();

		this._canvas = document.getElementById('webGlCanvas');

		this._camera = null;
		this._controls = null;
		this._renderer = null;

		this._gridHelper = null;

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();
		this._scene.background = new THREE.Color(0xA0A0A0);
		this._scene.fog = new THREE.Fog(0xA0A0A0, 10, 50);

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 2.5, -3.0);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
		this._renderer.outputEncoding = THREE.sRGBEncoding;

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);
		this._controls.enablePan = false;
		this._controls.enableZoom = true;
		this._controls.minDistance = 1.5;
		this._controls.maxDistance = 10.0;
		this._controls.minPolarAngle = 0.1;
		this._controls.maxPolarAngle = 1.7;
		this._controls.mouseButtons = {
			LEFT: THREE.MOUSE.ROTATE,
			RIGHT: THREE.MOUSE.ROTATE
		};
		this._controls.target = new THREE.Vector3(0, 1.7, 0);
		this._controls.update();


		this._users = {};
		this._objectManager = new ObjectManager();

		this._inputManager = new InputManager();

		this._musicManager = new MusicManager();
		this._musicManager.add('bg_001', 'resources/music/bg_music_001.mp3');

		this._soundManager = new SoundManager();
		this._soundManager.add('crows', 'resources/sound/crows-and-other-birds.wav');
		this._soundManager.add('owl', 'resources/sound/owl-hoot.wav');

		this._renderer.domElement.addEventListener('pointerdown', this._onPointerDownHandler.bind(this), false);
		this._renderer.domElement.addEventListener('pointerup', this._onPointerUpHandler.bind(this), false);

		window.addEventListener('keydown', this._onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this._onKeyUpHandler.bind(this), false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		// test vars
		this._timeToSendTransformData = 0.0;
		this._shaderMaterial = null;

		this._load();
	}

	destroy() {
		this._musicManager.stop();
	}

	init(data) {
		this._musicManager.play('bg_001');

		this._character = new Character(data.id, data.name, this._inputManager, this._camera, this._controls, this._scene);
		this._character.setPosition(new THREE.Vector3(data.position.x, data.position.y, data.position.z));
		this._character.setRotation(new THREE.Quaternion(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w));
		this._character.initCameraPosition();

		this._objectManager.load('resources/model/character/character_001.fbx', (object) => {
			this._character.setModel(object);
			this._character.setAnimationState(data.state);
		});

		this._users[data.id] = this._character;
	}

	update(data) {
		for (let i = 0; i < data.user.length; ++i) {
			if (this._users.hasOwnProperty(data.user[i].id)) {
				// ignore current user
				if (!this._users[data.user[i].id].isLocalUser()) {
					console.log('update');
					this._users[data.user[i].id].setPosition(new THREE.Vector3(data.user[i].position.x, data.user[i].position.y, data.user[i].position.z));
					this._users[data.user[i].id].setRotation(new THREE.Quaternion(data.user[i].rotation.x, data.user[i].rotation.y, data.user[i].rotation.z, data.user[i].rotation.w));
					this._users[data.user[i].id].setAnimationState(data.user[i].state);
				}
			} else {
				this._users[data.user[i].id] = new Character(data.user[i].id, data.user[i].name, null, null, null, this._scene);

				this._users[data.user[i].id].setPosition(new THREE.Vector3(data.user[i].position.x, data.user[i].position.y, data.user[i].position.z));
				this._users[data.user[i].id].setRotation(new THREE.Quaternion(data.user[i].rotation.x, data.user[i].rotation.y, data.user[i].rotation.z, data.user[i].rotation.w));

				this._objectManager.load('resources/model/character/character_001.fbx', (object) => {
					this._users[data.user[i].id].setModel(object);
					this._users[data.user[i].id].setAnimationState(data.user[i].state);
				});
			}
		}
	}

	_load() {
		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._ambientLight = new THREE.AmbientLight(0x101010);
		this._scene.add(this._ambientLight);

		this._hemisphereLight = new THREE.HemisphereLight(0xDDEEFF, 0x0F0E0D, 0.8);
		this._scene.add(this._hemisphereLight);

		this._directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
		this._directionalLight.position.set(20, 100, 10);
		this._directionalLight.target.position.set(0, 0, 0);
		this._scene.add(this._directionalLight);

		this._objectManager.load('resources/model/house_001.glb', (object) => {
			this._scene.add(object);
			this._shaderMaterial = new THREE.ShaderMaterial(ShaderUtil.wafeAnimation);

			let shaderTarget = object.getObjectByName('GatewayShader');

			shaderTarget.material = this._shaderMaterial;
		});

		this._render();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		let timeDelta = this._clock.getDelta();

		if (this._shaderMaterial) {
			this._shaderMaterial.uniforms.time.value += timeDelta;
		}

		if (this._character) {
			this._timeToSendTransformData += timeDelta;

			if (this._timeToSendTransformData >= 0.1) {
				this._timeToSendTransformData = 0.0;

				this.emit('sendTransformDataAction', {
					'position': this._character.getPosition().toArray(),
					'rotation': this._character.getRotation().toArray(),
					'state':  this._character.getAnimationStateName()
				});
			}
		}

		for (let userId in this._users) {
			this._users[userId].update(timeDelta);
		}

		this._renderer.render(this._scene, this._camera);
	};


	_getCanvasHeight() { return this._canvas.offsetHeight; };
	_getCanvasWidth() { return this._canvas.offsetWidth; };

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); };


	_onKeyDownHandler(event) {
		this._inputManager.setKeyState(event.keyCode, true);
	};

	_onKeyUpHandler(event) {
		this._inputManager.setKeyState(event.keyCode, false);

		if (event.keyCode === 49) {
			this._soundManager.play('crows');
		}

		if (event.keyCode === 50) {
			this._soundManager.play('owl');
		}
	};

	_onPointerDownHandler(event) {
		this._inputManager.setMouseState(event.button, true);
	};

	_onPointerUpHandler(event) {
		this._inputManager.setMouseState(event.button, false);
	};

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	};
}

export default View;
