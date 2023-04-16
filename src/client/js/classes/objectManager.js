import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class ObjectManager {
	#fbxLoader;
	#gltfLoader;
	#objects = {};


	constructor() {
		this.#fbxLoader = new FBXLoader();
		this.#gltfLoader = new GLTFLoader();
	}

	add(key, path) {
		this.#objects[key] = path;
	}

	load(key, callback) {
		if (!Object.prototype.hasOwnProperty.call(this.#objects, key)) {
			return;
		}

		const path = this.#objects[key];

		if (path.endsWith('.fbx')) {
			return this.#loadFBX(key, path, callback);
		} else if (path.endsWith('.glb')) {
			return this.#loadGLB(key, path, callback);
		}
	}

	loadAll(keys, itemCallback, endCallback) {
		const promises = [];

		keys.forEach((key) => {
			promises.push(this.load(key, itemCallback));
		});

		Promise.all(promises).then(() => {
			if (typeof endCallback === 'function') {
				endCallback();
			}
		}).catch((err) => {
			console.error(err);
		});
	}


	#loadFBX(key, path, callback) {
		return new Promise((resolve, reject) => {
			this.#fbxLoader.load(
				path,

				(object) => {
					if (typeof callback === 'function') {
						callback(key, object);
					}

					console.info(path + ' successfully loaded');
					resolve(object);
				},

				(xhr) => {
					console.info((xhr.loaded / xhr.total * 10) + '% loaded');
				},

				(e) => {
					console.error(e);
					reject(path + ' failed to load');
				}
			);
		});
	}

	#loadGLB(key, path, callback) {
		return new Promise((resolve, reject) => {
			this.#gltfLoader.load(
				path,

				(object) => {
					if (typeof callback === 'function') {
						callback(key, object.scene);
					}

					console.info(path + ' successfully loaded');
					resolve(object);
				},

				(xhr) => {
					console.info((xhr.loaded / xhr.total * 10) + '% loaded');
				},

				(e) => {
					console.error(e);
					reject(path + ' failed to load');
				}
			);
		});
	}
}

export default ObjectManager;