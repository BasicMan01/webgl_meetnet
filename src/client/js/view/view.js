import {
	AmbientLight,
	Clock,
	Color,
	DirectionalLight,
	DirectionalLightHelper,
	Fog,
	GridHelper,
	HemisphereLight,
	MathUtils,
	MOUSE,
	PerspectiveCamera,
	Quaternion,
	Scene,
	ShaderMaterial,
	sRGBEncoding,
	Vector3,
	WebGLRenderer
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

		this._directionalLight = null;
		this._hemisphereLight = null;
		this._directionalLight = null;

		this._clock = new Clock();
		this._scene = new Scene();
		this._scene.background = new Color(0x87CEFA);
		this._scene.fog = new Fog(0x87CEFA, 10, 50);

		this._camera = new PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 2.5, -3.0);

		this._renderer = new WebGLRenderer({antialias: true});
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
		this._renderer.outputEncoding = sRGBEncoding;

		this._stats = new Stats();

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);
		this._canvas.appendChild(this._stats.dom);

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);
		this._controls.enablePan = false;
		this._controls.enableZoom = true;
		this._controls.minDistance = 1.5;
		this._controls.maxDistance = 10.0;
		this._controls.minPolarAngle = 0.1;
		this._controls.maxPolarAngle = 1.7;
		this._controls.mouseButtons = {
			LEFT: MOUSE.ROTATE,
			RIGHT: MOUSE.ROTATE
		};
		this._controls.target = new Vector3(0, 1.7, 0);
		this._controls.update();

		this._users = {};
		this._objectManager = new ObjectManager();
		this._objectManager.add('world', 'resources/model/house_001.glb');
		this._objectManager.add('character.female', 'resources/model/character/character_female.fbx');
		this._objectManager.add('character.male', 'resources/model/character/character_male.fbx');
		this._objectManager.add('character.animation.idle', 'resources/model/character/animation/idle.fbx');
		this._objectManager.add('character.animation.walk', 'resources/model/character/animation/walk.fbx');

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
		this._sunRotation = 0.0;

		Ammo().then(lib => {
			Ammo = lib;

			this._load();
			this._createGui();
		});
	}

	destroy() {
		if (this._character) {
			this._character.destroy();
		}

		this._musicManager.stop();
	}

	init(data) {
		this._musicManager.play('bg_001');

		this._character = new Character(data.id, data.name, this._inputManager, this._camera, this._controls, this._scene);
		this._character.setPosition(new Vector3(data.position.x, data.position.y, data.position.z));
		this._character.setRotation(new Quaternion(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w));
		this._character.initCameraPosition();
		this._character.load(this._objectManager, data.gender === 'm' ? 'character.male' : 'character.female');

		this._users[data.id] = this._character;
	}

	update(data) {
		const activeUser = {};
		const inactiveUsers = [];

		// add local user if active
		if (this._character) {
			activeUser[this._character.getId()] = this._users[this._character.getId()];
		}

		for (let user of data.user) {
			if (this._users.hasOwnProperty(user.id)) {
				// ignore current user
				if (!this._users[user.id].isLocalUser()) {
					this._users[user.id].setPosition(new Vector3(user.position.x, user.position.y, user.position.z));
					this._users[user.id].setRotation(new Quaternion(user.rotation.x, user.rotation.y, user.rotation.z, user.rotation.w));
					this._users[user.id].setAnimationState(user.state);
				}
			} else {
				this._users[user.id] = new Character(user.id, user.name, null, null, null, this._scene);

				this._users[user.id].setPosition(new Vector3(user.position.x, user.position.y, user.position.z));
				this._users[user.id].setRotation(new Quaternion(user.rotation.x, user.rotation.y, user.rotation.z, user.rotation.w));
				this._users[user.id].load(this._objectManager, user.gender === 'm' ? 'character.male' : 'character.female');
			}

			activeUser[user.id] = this._users[user.id];
		}

		// find inactive users
		for (let userId in this._users) {
			if (!activeUser.hasOwnProperty(userId)) {
				inactiveUsers.push(this._users[userId]);
			}
		}

		// apply only active users
		this._users = activeUser;

		// remove inactive users
		for (let inactiveUser of inactiveUsers) {
			inactiveUser.destroy();
		}
	}

	_load() {
		this._gridHelper = new GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._ambientLight = new AmbientLight(0x303030, 0.3);
		this._scene.add(this._ambientLight);

		this._hemisphereLight = new HemisphereLight(0x87CEFA, 0x303030, 0.8);
		this._scene.add(this._hemisphereLight);

		this._directionalLight = new DirectionalLight(0xFFFFFF, 0.8);
		this._directionalLight.position.set(20, 100, 0);
		this._scene.add(this._directionalLight);

		this._directionalLightHelper = new DirectionalLightHelper(this._directionalLight, 5);
		this._scene.add(this._directionalLightHelper);

		this._objectManager.load('world', (key, object) => {
			this._scene.add(object);
			this._shaderMaterial = new ShaderMaterial(ShaderUtil.wafeAnimation);

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

		/*
		this._sunRotation += timeDelta * 0.1;

		this._directionalLight.position.x = Math.sin(this._sunRotation) * 100.0;
		this._directionalLight.position.y = Math.cos(this._sunRotation) * 100.0;

		this._hemisphereLight.intensity = MathUtils.clamp(this._directionalLight.position.y / 100, 0, 1);

		this._scene.background.setRGB(
			200 * this._hemisphereLight.intensity / 255,
			200 * this._hemisphereLight.intensity / 255,
			255 * this._hemisphereLight.intensity / 255
		);

		this._scene.fog.color = this._scene.background;

		this._directionalLightHelper.parent.updateMatrixWorld();
		this._directionalLightHelper.update();
		*/

		for (let userId in this._users) {
			this._users[userId].update(timeDelta);
		}

		this._stats.update();

		this._renderer.render(this._scene, this._camera);
	};

	_createGui() {
		const properties = {
			'sceneBackground': this._scene.background,
			'sceneFogColor': this._scene.fog.color,
			'sceneFogNear': this._scene.fog.near,
			'sceneFogFar': this._scene.fog.far,

			'ambientColor': this._ambientLight.color,
			'ambientIntensity': this._ambientLight.intensity,

			'hemisphereSkyColor': this._hemisphereLight.color,
			'hemisphereGroundColor': this._hemisphereLight.groundColor,
			'hemisphereIntensity': this._hemisphereLight.intensity,

			'directionalColor': this._directionalLight.color,
			'directionalIntensity': this._directionalLight.intensity,
			'diretionalPosX': this._directionalLight.position.x,
			'diretionalPosY': this._directionalLight.position.y,
			'diretionalPosZ': this._directionalLight.position.z
		}

		const gui = new GUI({ width: 310 });
		const folderScene = gui.addFolder('Scene');
		const folderAmbientLight = gui.addFolder('AmbientLight');
		const folderHemisphereLight = gui.addFolder('HemisphereLight');
		const folderDirectionalLight = gui.addFolder('DirectionalLight');

		folderScene.addColor(properties, 'sceneBackground').onChange(function(value) {
			this._scene.background.set(value);
		}.bind(this));

		folderScene.addColor(properties, 'sceneFogColor').onChange(function(value) {
			this._scene.fog.color.set(value);
		}.bind(this));

		folderScene.add(properties, 'sceneFogNear', 0, 50).step(0.5).onChange(function(value) {
			this._scene.fog.near = value;
		}.bind(this));

		folderScene.add(properties, 'sceneFogFar', 0, 50).step(0.5).onChange(function(value) {
			this._scene.fog.far = value;
		}.bind(this));


		folderAmbientLight.addColor(properties, 'ambientColor').onChange(function(value) {
			this._ambientLight.color.set(value);
		}.bind(this));

		folderAmbientLight.add(properties, 'ambientIntensity', 0, 2).step(0.01).onChange(function(value) {
			this._ambientLight.intensity = value;
		}.bind(this));


		folderHemisphereLight.addColor(properties, 'hemisphereSkyColor').onChange(function(value) {
			this._hemisphereLight.color.set(value);
		}.bind(this));

		folderHemisphereLight.addColor(properties, 'hemisphereGroundColor').onChange(function(value) {
			this._hemisphereLight.groundColor.set(value);
		}.bind(this));

		folderHemisphereLight.add(properties, 'hemisphereIntensity', 0, 2).step(0.01).onChange(function(value) {
			this._hemisphereLight.intensity = value;
		}.bind(this));


		folderDirectionalLight.addColor(properties, 'directionalColor').onChange(function(value) {
			this._directionalLight.color.set(value);
		}.bind(this));

		folderDirectionalLight.add(properties, 'directionalIntensity', 0, 2).step(0.01).onChange(function(value) {
			this._directionalLight.intensity = value;
		}.bind(this));

		folderDirectionalLight.add(properties, 'diretionalPosX', -50, 50).step(0.5).onChange(function(value) {
			this._directionalLight.position.x = value;
		}.bind(this));

		folderDirectionalLight.add(properties, 'diretionalPosY', 1, 50).step(0.5).onChange(function(value) {
			this._directionalLight.position.y = value;
		}.bind(this));

		folderDirectionalLight.add(properties, 'diretionalPosZ', -50, 50).step(0.5).onChange(function(value) {
			this._directionalLight.position.z = value;
		}.bind(this));

		gui.close();
	}


	_getCanvasHeight() { return this._canvas.offsetHeight; };
	_getCanvasWidth() { return this._canvas.offsetWidth; };

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); };


	_onKeyDownHandler(event) {
		this._inputManager.setKeyState(event.keyCode, true);
	};

	_onKeyUpHandler(event) {
		this._inputManager.setKeyState(event.keyCode, false);

		if (event.keyCode === InputManager.KEY_1) {
			this._soundManager.play('crows');
		}

		if (event.keyCode === InputManager.KEY_2) {
			this._soundManager.play('owl');
		}

		if (event.keyCode === InputManager.KEY_3) {
			this.emit('addChatMessageAction', {
				'userName': 'SYSTEM',
				'message': `
					<br>
					===== Memory =====<br>
					<table>
						<tr>
							<td>Programs:</td>
							<td>${this._renderer.info.memory.programs}</td>
						</tr>
						<tr>
							<td>Geometries:</td>
							<td>${this._renderer.info.memory.geometries}</td>
						</tr>
						<tr>
							<td>Textures:</td>
							<td>${this._renderer.info.memory.textures}</td>
						</tr>
					</table>
					===== Render =====<br>
					<table>
						<tr>
							<td>Calls:</td>
							<td>${this._renderer.info.render.calls}</td>
						</tr>
						<tr>
							<td>Vertices:</td>
							<td>${this._renderer.info.render.vertices}</td>
						</tr>
						<tr>
							<td>Faces:</td>
							<td>${this._renderer.info.render.faces}</td>
						</tr>
						<tr>
							<td>Points:</td>
							<td>${this._renderer.info.render.points}</td>
						</tr>
					</table>
				`
			});
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
