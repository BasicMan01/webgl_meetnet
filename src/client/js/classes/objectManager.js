import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class ObjectManager {
	constructor() {
		this._fbxLoader = new FBXLoader();
		this._gltfLoader = new GLTFLoader();

		this._objects = {};
	}

	add(key, path) {
		this._objects[key] = path;
	}

	load(key, callback) {
		if (!this._objects.hasOwnProperty(key)) {
			return;
		}

		let path = this._objects[key];

		if (path.endsWith('.fbx')) {
			return this._loadFBX(key, path, callback);
		} else if (path.endsWith('.glb')) {
			return this._loadGLB(key, path, callback);
		}
	}

	loadAll(keys, itemCallback, endCallback) {
		let promises = [];

		keys.forEach((key) => {
			promises.push(this.load(key, itemCallback));
		});

		Promise.all(promises).then(values => {
			if (typeof endCallback === 'function') {
				endCallback();
			}
		}).catch(err => {
			console.error(err);
		});
	}

	_loadFBX(key, path, callback) {
		return new Promise((resolve, reject) => {
			this._fbxLoader.load(
				path,

				object => {
					if (typeof callback === 'function') {
						callback(key, object);
					}

					console.info(path + ' successfully loaded');
					resolve(object);
				},

				xhr => {
					console.info((xhr.loaded / xhr.total * 10) + '% loaded');
				},

				err => {
					reject(path + ' failed to load');
				}
			);
		});
	}

	_loadGLB(key, path, callback) {
		return new Promise((resolve, reject) => {
			this._gltfLoader.load(
				path,

				object => {
					if (typeof callback === 'function') {
						callback(key, object.scene);
					}

					console.info(path + ' successfully loaded');
					resolve(object);
				},

				xhr => {
					console.info((xhr.loaded / xhr.total * 10) + '% loaded');
				},

				err => {
					reject(path + ' failed to load');
				}
			);
		});
	}
}

export default ObjectManager;