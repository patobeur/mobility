import * as THREE from "three";

// --- Rendu de base
const app = document.getElementById("app");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0f);

const camera = new THREE.PerspectiveCamera(
	55,
	window.innerWidth / window.innerHeight,
	0.1,
	2000
);

const camRig = new THREE.Object3D();
scene.add(camRig);
camRig.position.set(0, 0, 0);

camera.position.set(0, 30, 15); // hauteur
camera.rotation.order = "YXZ";
camera.rotation.set(-Math.PI / 3, 0, 0); // regarde vers le bas
camRig.add(camera);

// Lumières
const hemi = new THREE.HemisphereLight(0xffffff, 0x333344, 0.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(30, 60, 10);
sun.castShadow = true;
scene.add(sun);

// Réactivité
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

export { renderer, scene, camera, camRig };
