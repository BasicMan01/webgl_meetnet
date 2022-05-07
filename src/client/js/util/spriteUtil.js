import {
	CanvasTexture,
	Sprite,
	SpriteMaterial
} from 'three';

class SpriteUtil {
	static createSprite(text) {
		let element = document.createElement('canvas');
		let context2d = element.getContext('2d');

		context2d.canvas.width = 256;
		context2d.canvas.height = 128;
		context2d.fillStyle = '#FFF';
		context2d.strokeStyle = '#000';
		context2d.font = "bold 22pt Arial";
		context2d.textAlign = 'center';

		/*
			context2d.shadowOffsetX = 3;
			context2d.shadowOffsetY = 3;
			context2d.shadowColor = "rgba(0,0,0,0.3)";
			context2d.shadowBlur = 3;
		*/

		context2d.fillText(text, 128, 64);
		context2d.strokeText(text, 128, 64);

		let map = new CanvasTexture(context2d.canvas);
		let sprite = new Sprite(
			new SpriteMaterial({map: map, color: 0xffffff})
		);

		return sprite;
	}
}

export default SpriteUtil;