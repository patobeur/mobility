import * as THREE from "three";

const camLerp = 0.08;

export function updateCamera(dt, player, camRig) {
	const t = 1 - Math.pow(1 - camLerp, dt * 60);
	camRig.position.lerp(
		new THREE.Vector3(player.root.position.x, 0, player.root.position.z),
		t
	);
}
