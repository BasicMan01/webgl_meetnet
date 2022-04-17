import * as THREE from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Observable from '../classes/observable.js';

import MusicManager from '../classes/musicManager.js';
import SoundManager from '../classes/soundManager.js';



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

		this._musicManager = new MusicManager();
		this._musicManager.add('bg_001', 'resources/music/bg_music_001.mp3');

		this._soundManager = new SoundManager();



		this._canvas = document.getElementById('webGlCanvas');

		this._camera = null;
		this._controls = null;
		this._mixer = null;
		this._renderer = null;

		this._gridHelper = null;

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();
		this._scene.background = new THREE.Color(0xA0A0A0);
		this._scene.fog = new THREE.Fog(0xA0A0A0, 10, 50);

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 2.5, 3.0);

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
		this._controls.target = new THREE.Vector3(0, 1.7, 0);
		this._controls.update();

		//this.userId = 0;
		this._cube = null;
		this._cubes = {};
		this._character = null;
		this._rotateY = new THREE.Vector3();
		this._characterPosition = new THREE.Vector3();

		this.keyStatus = {
			65: false,
			68: false,
			83: false,
			87: false
		}

		window.addEventListener('keydown', this._onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this._onKeyUpHandler.bind(this), false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		document.getElementById('ip').value = location.host;
		document.getElementById('connect').addEventListener('click', (event) => {
			let ip = document.getElementById('ip').value;
			let nickname = document.getElementById('nickname').value;

			this.emit('connectAction', {
				'ip': ip,
				'nickname' : nickname
			});
		});
	}

	init(data) {
		this._characterPosition.set(
			data.personalData.position.x,
			data.personalData.position.y,
			data.personalData.position.z
		);

		this._load();
	}

	showErrorMessage(message) {
		document.getElementById('errorMessage').innerText = message;
	}

	showLogin(value) {
		if (value) {
			document.getElementById('login').style.display = '';

		} else {
			document.getElementById('login').style.display = 'none';
		}
	}



	_load() {
		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._hemisphereLight = new THREE.HemisphereLight('#DDEEFF', '#0F0E0D', 1.0);
		this._scene.add(this._hemisphereLight);


		this._gltfLoader = new GLTFLoader();
		this._gltfLoader.load('resources/model/house_001.glb', function (object) {
			this._scene.add(object.scene);
		}.bind(this),
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		function ( error ) {
			console.log( 'An error happened' );
		});


		this._fbxLoader = new FBXLoader();
		this._fbxLoader.load('resources/model/character/character_001.fbx', function (object) {
			this._character = object;
			this._character.position.copy(this._characterPosition);

			this._scene.add(this._character);

			this._mixer = new THREE.AnimationMixer(this._character);
			this._mixer.clipAction(this._character.animations[2]).play();

			console.log(this._character);
			this._musicManager.play('bg_001');

			this._render();
		}.bind(this),
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		function ( error ) {
			console.log( 'An error happened' );
		});
	}

	/*
	updateData(data) {
		for (let i = 0; i < data.player.length; ++i) {
			let idx = data.player[i][0] - 1;
			let color = data.player[i][1];
			let position = data.player[i][3];

			if (this.cubes.hasOwnProperty(idx)) {
				// update
			} else {
				this.cubes[idx] = this.createCube(color, position);
			}
		}
	}
	*/

	_render() {
		requestAnimationFrame(this._render.bind(this));

		let clockDelta = this._clock.getDelta();


		// TODO: search a better solution
		this._camera.getWorldDirection(this._rotateY);
		this._rotateY.y = 0;

		// for walk: clockDelta * 1.5
		// for run: clockDelta * 3.0
		let n = this._rotateY.normalize().clone().multiplyScalar(clockDelta * 1.5);

		this._rotateY.add(this._character.position);

		// cube look at the same direction as camera
		this._character.lookAt(this._rotateY);

		if (this.keyStatus[87]) {
			this._character.position.add(n);
			this._camera.position.add(n);
		}

		// orbit controls rotate around new cube position
		//this._camera.lookAt(this._character);
		this._controls.target.copy(new THREE.Vector3(this._character.position.x, 1.7, this._character.position.z));
		this._controls.update();

		//if (this.cubes.hasOwnProperty(this.playerId - 1)) {
			//this.camera.lookAt(this.cubes[this.playerId - 1]);
		//}

		//this._camera.position.y = 2.0;
		//this._character.update();



		this._mixer.update(clockDelta);

		this._renderer.render(this._scene, this._camera);
	};

	_getCanvasHeight() { return this._canvas.offsetHeight; };
	_getCanvasWidth() { return this._canvas.offsetWidth; };

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); };


	_onKeyDownHandler(event) {
		switch (event.keyCode) {
			case 87:
				if (!this.keyStatus[event.keyCode]) {
					this._mixer.stopAllAction();

					let action = this._mixer.clipAction(this._character.animations[4]);
					action.play();

					this.keyStatus[event.keyCode] = true;
				}
				break;

			case 65:
			case 68:
			case 83: { // WASD
				this.keyStatus[event.keyCode] = true;
			} break;
		}
	};

	_onKeyUpHandler(event) {
		switch (event.keyCode) {
			case 87:
				if (this.keyStatus[event.keyCode]) {
					this._mixer.stopAllAction();

					let action = this._mixer.clipAction(this._character.animations[2]);
					action.play();

					this.keyStatus[event.keyCode] = false;
				}
				break;

			case 65:
			case 68:
			case 83: { // WASD
				this.keyStatus[event.keyCode] = false;
			} break;
		}
	};

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	};

}

export default View;
