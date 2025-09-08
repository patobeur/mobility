import * as THREE from "three";
import { renderer, camera } from "./scene.js";

const keys = new Set();
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export function initControls(player) {
	window.addEventListener("keydown", (e) => {
		keys.add(e.key.toLowerCase());
		if ([" ", "space"].includes(e.key.toLowerCase())) e.preventDefault();
	});
	window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

	window.addEventListener("mousemove", (e) => {
		const rect = renderer.domElement.getBoundingClientRect();
		mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
	});

	window.addEventListener("click", (e) => {
		raycaster.setFromCamera(mouse, camera);
		const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
		const p = new THREE.Vector3();
		if (raycaster.ray.intersectPlane(plane, p)) {
			player.dest = p.clone();
		}
	});
}

export function getAxis() {
	let x = 0,
		z = 0;
	if (keys.has("arrowup") || keys.has("z") || keys.has("w")) z -= 1;
	if (keys.has("arrowdown") || keys.has("s")) z += 1;
	if (keys.has("arrowleft") || keys.has("q") || keys.has("a")) x -= 1;
	if (keys.has("arrowright") || keys.has("d")) x += 1;
	const len = Math.hypot(x, z) || 1;
	return { x: x / len, z: z / len };
}

export function isShift() {
	return keys.has("shift");
}
export function isCtrl() {
	return keys.has("control");
}
export function isSpace() {
	return keys.has(" ") || keys.has("space");
}

export function updateMouseOrientation(dt, player, rotateModelTowards) {
	if (!player.model) return;
	raycaster.setFromCamera(mouse, camera);
	const hit = raycaster.ray.intersectPlane(
		new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
		new THREE.Vector3()
	);
	if (hit) {
		const dir = new THREE.Vector3().subVectors(hit, player.root.position);
		dir.y = 0;
		dir.normalize();
		if (dir.lengthSq() > 0.0001) {
			player.facing = Math.atan2(dir.x, dir.z);
			rotateModelTowards(player.facing, dt);
		}
	}
}

export { mouse };
