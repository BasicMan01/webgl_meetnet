import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class ObjectManager {
	constructor() {
		this._fbxLoader = new FBXLoader();
		this._gltfLoader = new GLTFLoader();
	}

	load(path, callback) {
		if (path.endsWith('.fbx')) {
			this._loadFBX(path, callback);
		} else if (path.endsWith('.glb')) {
			this._loadGLB(path, callback);
		}
	}

	_loadFBX(path, callback) {
		this._fbxLoader.load(path, function (object) {
			if (typeof callback === 'function') {
				callback(object);
			}

			/*
			this._fbxLoader.load('resources/model/animation/idle.fbx', function (animation) {
				console.log('animation', animation);
				this._mixer.clipAction(animation.animations[0]).play();

				console.log('mixer', this._mixer);
			}.bind(this));
			*/
		}.bind(this),
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		function ( error ) {
			console.log('An error happened', error);
		});
	}

	_loadGLB(path, callback) {
		this._gltfLoader.load(path, function (object) {
			if (typeof callback === 'function') {
				callback(object.scene);
			}
		}.bind(this),
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		function ( error ) {
			console.log( 'An error happened' );
		});
	}
}

export default ObjectManager;