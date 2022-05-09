import {
	DoubleSide
} from 'three';

class ShaderUtil {
	static wafeAnimation = {
		side: DoubleSide,
		transparent: true,
		uniforms: {
			time: { type: "f", value: 0.0 }
		},

		vertexShader: `
			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,

		fragmentShader: `
			uniform float time;
			varying vec2 vUv;

			void main() {
				vec2 position = vUv - 0.5;

				float color = abs(sin(50.0 * (length(position) - time * 0.1)));
				gl_FragColor = vec4(color, 1.0, 1.0, 0.5);
			}
		`
	};
}

export default ShaderUtil;
