import * as THREE from "three";
import { renderer, scene, camera, camRig } from "./scene.js";
import { createWorld } from "./world.js";
import { updateHUD } from "./ui.js";
import { initPlayer, player, updatePlayer, rotateModelTowards, damage, gainXP } from "./player.js";
import { initControls, mouse, updateMouseOrientation, getAxis, isShift, isCtrl, isSpace } from "./controls.js";
import { updateCamera } from "./camera.js";

window.addEventListener("load", () => {
	if (THREE) {
		if (window.Ammo) {
			window.Ammo().then(() => {
				console.log({ Ammo: window.Ammo });
			});
		}
	}
});

createWorld(scene);
initPlayer(scene);
initControls(player);

const clock = new THREE.Clock();

function loop() {
	const dt = Math.min(0.033, clock.getDelta());

    const controls = { getAxis, isShift, isCtrl, isSpace };

	updateMouseOrientation(dt, player, rotateModelTowards);
	updatePlayer(dt, mouse, controls);
	updateCamera(dt, player, camRig);

	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

updateHUD(player);
loop();

Object.assign(window, { scene, camera, player, damage, gainXP });
