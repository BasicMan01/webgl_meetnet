import {
	AmbientLight,
	BufferGeometry,
	Clock,
	Color,
	DirectionalLight,
	DirectionalLightHelper,
	Fog,
	GridHelper,
	HemisphereLight,
	LineBasicMaterial,
	LineSegments,
	// MathUtils,
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
import PhysicManager from '../classes/physicManager.js';
import SoundManager from '../classes/soundManager.js';
import ObjectManager from '../classes/objectManager.js';

import ShaderUtil from '../util/shaderUtil.js';

import Chat from './partial/chat.js';
import Connect from './partial/connect.js';
import Login from './partial/login.js';
import Timer from './partial/timer.js';

/*
//https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera/blob/main/main.js

First of all, the Controls were designed to be controlling a camera, and not an object. And since by default,
objects look "up" the z-axis, and cameras look "down" the z-axis, it is unlikely that the Controls will work
as expected when applied to something other than a camera.

Secondly, the Controls are part of the examples, and not the library, so they are not officially supported.
You are free to hack away at them.

One way to achieve what you want is to make the camera a child of your player. Something like this:

player.add( camera );
camera.position.set( 0, 50, 100 );
You may, in your render loop, need to set:

camera.lookAt( player.position );
Then you want to control the player with the mouse or keyboard.
Your best bet is to write your own controller to do that. There are plenty of examples on the net.
*/

class View extends Observable {
	#canvas;

	#camera = null;
	#clock = null;
	#controls = null;
	#renderer = null;
	#scene = null;
	#stats = null;

	#debugHelper = null;
	#gridHelper = null;
	#ambientLight = null;
	#directionalLight = null;
	#directionalLightHelper = null;
	#hemisphereLight = null;

	#objectManager;
	#inputManager;
	#musicManager;
	#physicManager;
	#soundManager;

	#character = null;
	#users = {};

	// test vars
	#timeToSendTransformData = 0.0;
	#shaderMaterial = null;
	#sunRotation = 0.0;


	constructor() {
		super();

		// partial views (public)
		this.chatView = new Chat();
		this.connectView = new Connect();
		this.loginView = new Login();
		this.timerView = new Timer();

		this.#canvas = document.getElementById('webGlCanvas');

		this.#clock = new Clock();
		this.#scene = new Scene();
		this.#scene.background = new Color(0x87CEFA);
		this.#scene.fog = new Fog(0x87CEFA, 10, 50);

		this.#camera = new PerspectiveCamera(70, this.#getCameraAspect(), 0.1, 500);
		this.#camera.position.set(0, 2.5, -3.0);

		this.#renderer = new WebGLRenderer({ antialias: true });
		this.#renderer.setPixelRatio(window.devicePixelRatio);
		this.#renderer.setSize(this.#getCanvasWidth(), this.#getCanvasHeight());
		this.#renderer.outputEncoding = sRGBEncoding;

		this.#stats = new Stats();

		// add renderer to the DOM-Tree
		this.#canvas.appendChild(this.#renderer.domElement);
		this.#canvas.appendChild(this.#stats.dom);

		this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
		this.#controls.enablePan = false;
		this.#controls.enableZoom = true;
		this.#controls.minDistance = 1.5;
		this.#controls.maxDistance = 10.0;
		this.#controls.minPolarAngle = 0.1;
		this.#controls.maxPolarAngle = 1.7;
		this.#controls.mouseButtons = {
			LEFT: MOUSE.ROTATE,
			RIGHT: MOUSE.ROTATE
		};
		this.#controls.target = new Vector3(0, 1.7, 0);
		this.#controls.update();

		this.#objectManager = new ObjectManager();
		this.#objectManager.add('world', 'resources/model/world/world.glb');
		this.#objectManager.add('character.female', 'resources/model/character/character_female.fbx');
		this.#objectManager.add('character.male', 'resources/model/character/character_male.fbx');
		this.#objectManager.add('character.animation.idle', 'resources/model/character/animation/idle.fbx');
		this.#objectManager.add('character.animation.walk', 'resources/model/character/animation/walk.fbx');

		this.#inputManager = new InputManager();

		this.#musicManager = new MusicManager();
		this.#musicManager.add('bg_001', 'resources/music/bg_music_001.mp3');

		this.#physicManager = new PhysicManager();

		this.#soundManager = new SoundManager();
		this.#soundManager.add('crows', 'resources/sound/crows-and-other-birds.wav');
		this.#soundManager.add('owl', 'resources/sound/owl-hoot.wav');

		this.#renderer.domElement.addEventListener('pointerdown', this.#onPointerDownHandler.bind(this), false);
		this.#renderer.domElement.addEventListener('pointerup', this.#onPointerUpHandler.bind(this), false);

		window.addEventListener('keydown', this.#onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this.#onKeyUpHandler.bind(this), false);
		window.addEventListener('resize', this.#onResizeHandler.bind(this), false);

		this.#physicManager.init(() => {
			this.#load();
			this.#createGui();

			this.connectView.show();
		});
	}

	connect() {
		this.connectView.hide();
		this.loginView.show();
	}

	destroy() {
		if (this.#character) {
			this.#character.destroy();
		}

		this.#musicManager.stop();

		this.chatView.hide();
		this.loginView.hide();
		this.timerView.hide();
		this.connectView.show();
	}

	init(data) {
		this.loginView.hide();
		this.chatView.show();
		this.timerView.show();

		this.#musicManager.play('bg_001');

		this.#character = new Character(
			data.id, data.name, this.#inputManager, this.#physicManager, this.#camera, this.#controls, this.#scene
		);
		this.#character.setPosition(new Vector3(data.position.x, data.position.y, data.position.z));
		this.#character.setRotation(new Quaternion(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w));
		this.#character.initCameraPosition();
		this.#character.load(this.#objectManager, data.gender === 'm' ? 'character.male' : 'character.female');

		this.#users[data.id] = this.#character;
	}

	update(data) {
		const activeUser = {};
		const inactiveUsers = [];

		// add local user if active
		if (this.#character) {
			activeUser[this.#character.getId()] = this.#users[this.#character.getId()];
		}

		for (const user of data.user) {
			if (Object.prototype.hasOwnProperty.call(this.#users, user.id)) {
				// ignore current user
				if (!this.#users[user.id].isLocalUser()) {
					this.#users[user.id].setPosition(new Vector3(user.position.x, user.position.y, user.position.z));
					this.#users[user.id].setRotation(
						new Quaternion(user.rotation.x, user.rotation.y, user.rotation.z, user.rotation.w)
					);
					this.#users[user.id].setAnimationState(user.state);
				}
			} else {
				this.#users[user.id] = new Character(user.id, user.name, null, null, null, null, this.#scene);

				this.#users[user.id].setPosition(new Vector3(user.position.x, user.position.y, user.position.z));
				this.#users[user.id].setRotation(
					new Quaternion(user.rotation.x, user.rotation.y, user.rotation.z, user.rotation.w)
				);
				this.#users[user.id].load(
					this.#objectManager,
					user.gender === 'm' ? 'character.male' : 'character.female'
				);
			}

			activeUser[user.id] = this.#users[user.id];
		}

		// find inactive users
		for (const userId in this.#users) {
			if (!Object.prototype.hasOwnProperty.call(activeUser, userId)) {
				inactiveUsers.push(this.#users[userId]);
			}
		}

		// apply only active users
		this.#users = activeUser;

		// remove inactive users
		for (const inactiveUser of inactiveUsers) {
			inactiveUser.destroy();
		}
	}


	#load() {
		this.#gridHelper = new GridHelper(50, 50);
		this.#scene.add(this.#gridHelper);

		this.#debugHelper = new LineSegments(
			new BufferGeometry(),
			new LineBasicMaterial({
				color: 0xFFFFFF,
				vertexColors: true
			})
		);
		this.#scene.add(this.#debugHelper);

		this.#ambientLight = new AmbientLight(0x303030, 0.4);
		this.#scene.add(this.#ambientLight);

		this.#hemisphereLight = new HemisphereLight(0xFFFFFF, 0x080820, 0.5);
		this.#scene.add(this.#hemisphereLight);

		this.#directionalLight = new DirectionalLight(0xFFFFFF, 0.5);
		this.#directionalLight.position.set(20, 100, 0);
		this.#scene.add(this.#directionalLight);

		this.#directionalLightHelper = new DirectionalLightHelper(this.#directionalLight, 5);
		this.#scene.add(this.#directionalLightHelper);

		this.#objectManager.load('world', (key, object) => {
			const shaderTarget = object.getObjectByName('GatewayShader');

			if (shaderTarget) {
				this.#shaderMaterial = new ShaderMaterial(ShaderUtil.wafeAnimation);

				shaderTarget.material = this.#shaderMaterial;
			}

			this.#physicManager.addCollider(object);
			this.#scene.add(object);
		});

		this.#render();
	}

	#render() {
		requestAnimationFrame(this.#render.bind(this));

		const timeDelta = this.#clock.getDelta();

		if (this.#shaderMaterial) {
			this.#shaderMaterial.uniforms.time.value += timeDelta;
		}

		if (this.#character) {
			this.#timeToSendTransformData += timeDelta;

			if (this.#timeToSendTransformData >= 0.1) {
				this.#timeToSendTransformData = 0.0;

				this.emit('sendTransformDataAction', {
					'position': this.#character.getPosition().toArray(),
					'rotation': this.#character.getRotation().toArray(),
					'state': this.#character.getAnimationStateName()
				});
			}
		}

		/*
		this.#sunRotation += timeDelta * 0.1;

		this.#directionalLight.position.x = Math.sin(this.#sunRotation) * 100.0;
		this.#directionalLight.position.y = Math.cos(this.#sunRotation) * 100.0;

		this.#hemisphereLight.intensity = MathUtils.clamp(this.#directionalLight.position.y / 100, 0, 1);

		this.#scene.background.setRGB(
			200 * this.#hemisphereLight.intensity / 255,
			200 * this.#hemisphereLight.intensity / 255,
			255 * this.#hemisphereLight.intensity / 255
		);

		this.#scene.fog.color = this.#scene.background;

		this.#directionalLightHelper.parent.updateMatrixWorld();
		this.#directionalLightHelper.update();
		*/

		for (const userId in this.#users) {
			this.#users[userId].update(timeDelta);
		}

		this.#physicManager.update(this.#debugHelper);

		this.#stats.update();

		this.#renderer.render(this.#scene, this.#camera);
	}

	#createGui() {
		const properties = {
			'sceneBackground': this.#scene.background,
			'sceneFogColor': this.#scene.fog.color,
			'sceneFogNear': this.#scene.fog.near,
			'sceneFogFar': this.#scene.fog.far,

			'ambientColor': this.#ambientLight.color,
			'ambientIntensity': this.#ambientLight.intensity,

			'hemisphereSkyColor': this.#hemisphereLight.color,
			'hemisphereGroundColor': this.#hemisphereLight.groundColor,
			'hemisphereIntensity': this.#hemisphereLight.intensity,

			'directionalColor': this.#directionalLight.color,
			'directionalIntensity': this.#directionalLight.intensity,
			'diretionalPosX': this.#directionalLight.position.x,
			'diretionalPosY': this.#directionalLight.position.y,
			'diretionalPosZ': this.#directionalLight.position.z
		};

		const gui = new GUI({ width: 310 });
		const folderScene = gui.addFolder('Scene');
		const folderAmbientLight = gui.addFolder('AmbientLight');
		const folderHemisphereLight = gui.addFolder('HemisphereLight');
		const folderDirectionalLight = gui.addFolder('DirectionalLight');

		folderScene.addColor(properties, 'sceneBackground').onChange((value) => {
			this.#scene.background.set(value);
		});

		folderScene.addColor(properties, 'sceneFogColor').onChange((value) => {
			this.#scene.fog.color.set(value);
		});

		folderScene.add(properties, 'sceneFogNear', 0, 50).step(0.5).onChange((value) => {
			this.#scene.fog.near = value;
		});

		folderScene.add(properties, 'sceneFogFar', 0, 50).step(0.5).onChange((value) => {
			this.#scene.fog.far = value;
		});


		folderAmbientLight.addColor(properties, 'ambientColor').onChange((value) => {
			this.#ambientLight.color.set(value);
		});

		folderAmbientLight.add(properties, 'ambientIntensity', 0, 2).step(0.01).onChange((value) => {
			this.#ambientLight.intensity = value;
		});


		folderHemisphereLight.addColor(properties, 'hemisphereSkyColor').onChange((value) => {
			this.#hemisphereLight.color.set(value);
		});

		folderHemisphereLight.addColor(properties, 'hemisphereGroundColor').onChange((value) => {
			this.#hemisphereLight.groundColor.set(value);
		});

		folderHemisphereLight.add(properties, 'hemisphereIntensity', 0, 2).step(0.01).onChange((value) => {
			this.#hemisphereLight.intensity = value;
		});


		folderDirectionalLight.addColor(properties, 'directionalColor').onChange((value) => {
			this.#directionalLight.color.set(value);
		});

		folderDirectionalLight.add(properties, 'directionalIntensity', 0, 2).step(0.01).onChange((value) => {
			this.#directionalLight.intensity = value;
		});

		folderDirectionalLight.add(properties, 'diretionalPosX', -100, 100).step(0.5).onChange((value) => {
			this.#directionalLight.position.x = value;
		});

		folderDirectionalLight.add(properties, 'diretionalPosY', 1, 100).step(0.5).onChange((value) => {
			this.#directionalLight.position.y = value;
		});

		folderDirectionalLight.add(properties, 'diretionalPosZ', -100, 100).step(0.5).onChange((value) => {
			this.#directionalLight.position.z = value;
		});

		gui.close();
	}


	#getCanvasHeight() { return this.#canvas.offsetHeight; }
	#getCanvasWidth() { return this.#canvas.offsetWidth; }

	#getCameraAspect() { return this.#getCanvasWidth() / this.#getCanvasHeight(); }


	#onKeyDownHandler(event) {
		this.#inputManager.setKeyState(event.keyCode, true);
	}

	#onKeyUpHandler(event) {
		this.#inputManager.setKeyState(event.keyCode, false);

		if (event.keyCode === InputManager.KEY_1) {
			this.#soundManager.play('crows');
		}

		if (event.keyCode === InputManager.KEY_2) {
			this.#soundManager.play('owl');
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
							<td>${this.#renderer.info.memory.programs}</td>
						</tr>
						<tr>
							<td>Geometries:</td>
							<td>${this.#renderer.info.memory.geometries}</td>
						</tr>
						<tr>
							<td>Textures:</td>
							<td>${this.#renderer.info.memory.textures}</td>
						</tr>
					</table>
					===== Render =====<br>
					<table>
						<tr>
							<td>Calls:</td>
							<td>${this.#renderer.info.render.calls}</td>
						</tr>
						<tr>
							<td>Vertices:</td>
							<td>${this.#renderer.info.render.vertices}</td>
						</tr>
						<tr>
							<td>Faces:</td>
							<td>${this.#renderer.info.render.faces}</td>
						</tr>
						<tr>
							<td>Points:</td>
							<td>${this.#renderer.info.render.points}</td>
						</tr>
					</table>
				`
			});
		}
	}

	#onPointerDownHandler(event) {
		this.#inputManager.setMouseState(event.button, true);
	}

	#onPointerUpHandler(event) {
		this.#inputManager.setMouseState(event.button, false);
	}

	#onResizeHandler() {
		this.#camera.aspect = this.#getCameraAspect();
		this.#camera.updateProjectionMatrix();

		this.#renderer.setSize(this.#getCanvasWidth(), this.#getCanvasHeight());
	}
}

export default View;