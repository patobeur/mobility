import * as THREE from "three";

const SIZE = 500,
	TILE = 2; // 500x500m, carreaux 2m

function makeCheckerTexture(size = 512, squares = 16) {
	const c = document.createElement("canvas");
	c.width = c.height = size;
	const ctx = c.getContext("2d");
	const step = size / squares;
	for (let y = 0; y < squares; y++) {
		for (let x = 0; x < squares; x++) {
			ctx.fillStyle = (x + y) % 2 === 0 ? "#222" : "#ddd";
			ctx.fillRect(x * step, y * step, step, step);
		}
	}
	return new THREE.CanvasTexture(c);
}

export function createWorld(scene) {
	const checker = makeCheckerTexture(1024, Math.floor(SIZE / TILE));
	checker.wrapS = checker.wrapT = THREE.RepeatWrapping;
	checker.repeat.set(SIZE / TILE, SIZE / TILE);

	const groundMat = new THREE.MeshStandardMaterial({
		map: checker,
		metalness: 0.0,
		roughness: 1.0,
	});
	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(SIZE, SIZE),
		groundMat
	);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add(ground);

	const grid = new THREE.GridHelper(SIZE, SIZE / TILE, 0x666666, 0x444444);
	scene.add(grid);
}
