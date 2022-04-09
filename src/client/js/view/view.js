import * as THREE from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Observable from '../classes/observable.js';


//
//
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



/*

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

		this._axesHelper = null;
		this._gridHelper = null;

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 2.0, 0);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		this._controls = new FirstPersonControls(this._camera, this._renderer.domElement);
		this._controls.lookSpeed = 0.1;
		this._controls.lookVertical = true;
		this._controls.noFly = true; // R = UP, F = DOWN
		this._controls.movementSpeed = 2;



		this.userId = 0;
		this._cubes = {};


		/*
		this.gui = null;


		this.keyStatus = {
			65: false,
			68: false,
			83: false,
			87: false
		}


		window.addEventListener('keydown', this.onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this.onKeyUpHandler.bind(this), false);


		*/

		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._hemisphereLight = new THREE.HemisphereLight('#DDEEFF', '#0F0E0D', 1.0);
		this._scene.add(this._hemisphereLight);

		this._loader = new GLTFLoader();
		this._loader.load('resources/model/house_001.glb', function (object) {
			this._scene.add(object.scene);

			this._render();
		}.bind(this),
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		function ( error ) {
			console.log( 'An error happened' );
		});



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

	initData(data) {
		let idx = data.personalData[0] - 1;
		let position = data.personalData[2];

		this._userId = data.personalData[0];

		this._createCube(1, position);
		//this._cubes[idx] = this._createCube(1, position);
		//this._cubes[idx].add(this._camera);

		this._camera.position.set(position.x, position.y, position.z);
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


	showErrorMessage(message) {
		document.getElementById('errorMessage').innerText = message;
	}
	/*
	show(id, value) {
		console.log(arguments);
		document.getElementById(id).style.display = value ? '' : 'none';
	}
*/
	showLogin(value) {
		if (value) {
			document.getElementById('login').style.display = '';

		} else {
			document.getElementById('login').style.display = 'none';
		}
	}



	_createCube(color, position) {
		let geometry = new THREE.BoxGeometry(1, 1, 1);

		this._cube = new THREE.Object3D();
		this._cube.position.set(position.x, position.y, position.z);
		this._scene.add(this._cube);

		this._cube.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( { color: this._getColorById(color) } )
		));

		this._cube.add(new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			new THREE.LineBasicMaterial( { color: '#FFFFFF' } )
		));

		return this.cube;
	}

	_getColorById(id) {
		switch(id) {
			case 1:		return '#FFFF00';	// yellow
			case 2:		return '#FF7700';	// orange
			case 3:		return '#FF0000';	// red
			case 4:		return '#FF0077';	// pink
			case 5:		return '#7700FF';	// purple
			case 6:		return '#0077FF';	// blue
			case 7:		return '#00FFFF';	// cyan
			case 8:		return '#00FF00';	// lime (light green)
		}

		return '';
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		// for FirstPersonControls
		this._controls.update(this._clock.getDelta());

		//if (this.cubes.hasOwnProperty(this.playerId - 1)) {
			//this.camera.lookAt(this.cubes[this.playerId - 1]);
		//}
		this._camera.position.y = 2.0;

		this._renderer.render(this._scene, this._camera);
	};

	_getCanvasHeight() { return this._canvas.offsetHeight; };
	_getCanvasWidth() { return this._canvas.offsetWidth; };

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); };

	/*
	onKeyDownHandler(event) {
		switch (event.keyCode) {
			case 65:
			case 68:
			case 83:
			case 87: { // WASD
				this.keyStatus[event.keyCode] = true;
			} break;
		}
	};

	onKeyUpHandler(event) {
		switch (event.keyCode) {
			case 65:
			case 68:
			case 83:
			case 87: { // WASD
				this.keyStatus[event.keyCode] = false;
			} break;
		}
	};
	*/

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	};

}

export default View;
