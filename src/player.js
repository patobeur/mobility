import * as THREE from "three";
import { GLTFLoader } from "/node_modules_min/three/examples/jsm/loaders/GLTFLoader.js";
import { logAnims, updateHUD, updateAnimName } from "./ui.js";

const player = {
	root: new THREE.Group(),
	model: null,
	mixer: null,
	actions: {},
	clips: [],
	speed: 6, // m/s marche
	runMult: 1.8,
	y: 0,
	vy: 0,
	onGround: true,
	life: 100,
	lifeMax: 100,
	xp: 0,
	level: 1,
	dest: null,
	facing: 0,
	moving: false,
	lastPlayed: null,
};

const presets = {
	idle: null,
	walk: null,
	run: null,
	jump: null,
	action: null,
};

let currentClip = null;

function playAction(clip, fade = 0.15, loop = true) {
	if (!clip || !player.mixer) return;
	if (currentClip === clip) return;
	const prevAction = player.lastPlayed;
	const action = player.mixer.clipAction(clip);
	action.enabled = true;
	action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
	action.clampWhenFinished = !loop;

	action.reset().fadeIn(fade).play();
	if (prevAction && prevAction !== action) prevAction.fadeOut(fade);

	player.lastPlayed = action;
	currentClip = clip;
	updateAnimName(clip.name);
}

export function initPlayer(scene) {
	scene.add(player.root);
	const loader = new GLTFLoader();
	loader.load(
		"./toon/Kimono_Female.gltf",
		(gltf) => {
			player.model = gltf.scene;
			player.model.traverse((o) => {
				if (o.isMesh) {
					o.castShadow = true;
					o.receiveShadow = true;
				}
			});
			player.model.scale.set(1, 1, 1);
			player.root.add(player.model);

			const box = new THREE.Box3().setFromObject(player.model);
			const center = new THREE.Vector3();
			box.getCenter(center);
			player.model.position.sub(center.setY(0));

			player.mixer = new THREE.AnimationMixer(player.model);
			player.clips = gltf.animations || [];
			logAnims(player);

			const dict = {};
			for (const clip of player.clips) {
				dict[clip.name.toLowerCase()] = clip;
			}

			function findClip(keys) {
				const names = Object.keys(dict);
				for (const k of keys) {
					const hit = names.find((n) => n.includes(k));
					if (hit) return dict[hit];
				}
				return null;
			}

			presets.idle = findClip(["idle", "breath", "stand", "pose"]) || player.clips[0] || null;
			presets.walk = findClip(["walk", "move", "locomotion"]) || presets.idle;
			presets.run = findClip(["run", "sprint"]) || presets.walk;
			presets.jump = findClip(["jump"]) || null;
			presets.action = findClip(["attack", "punch", "kick", "cast", "clap", "dance", "action"]) || null;

			playAction(presets.idle, 0.2, true);
			updateHUD(player);
		},
		undefined,
		(err) => {
			console.error(err);
			alert("Impossible de charger toon/Kimono_Female.gltf — placez le fichier à côté de ce HTML.");
		}
	);
}

const ROT_SPEED = 6;

function shortestAngleDiff(a, b) {
	let d = (b - a + Math.PI) % (2 * Math.PI);
	if (d < 0) d += 2 * Math.PI;
	return d - Math.PI;
}

function rotateModelTowards(targetYaw, dt) {
	if (!player.model) return;
	const cur = player.model.rotation.y;
	const diff = shortestAngleDiff(cur, targetYaw);
	const maxStep = ROT_SPEED * dt;
	const step = Math.abs(diff) < maxStep ? diff : Math.sign(diff) * maxStep;
	player.model.rotation.y = cur + step;
}

function movePlayer(dt, mouse, controls) {
    if (!player.model) return;
	const { getAxis, isShift, isCtrl, isSpace } = controls;
	const ax = getAxis();
	const usingKeyboard = Math.abs(ax.x) + Math.abs(ax.z) > 0;

	if (player.dest && !usingKeyboard) {
		const to = new THREE.Vector3().subVectors(player.dest, player.root.position);
		to.y = 0;
		const dist = to.length();
		if (dist > 0.05) {
			to.normalize();
			player.facing = Math.atan2(to.x, to.z);
			rotateModelTowards(player.facing, dt);
			const spd = player.speed * (isShift() ? player.runMult : 1);
			player.root.position.addScaledVector(to, spd * dt);
			player.moving = true;
		} else {
			player.dest = null;
			player.moving = false;
		}
	} else if (usingKeyboard) {
		const dir = new THREE.Vector3(ax.x, 0, ax.z);
		const spd = player.speed * (isShift() ? player.runMult : 1);
		player.root.position.addScaledVector(dir, spd * dt);
		if (Math.abs(mouse.x) + Math.abs(mouse.y) < 1e-3) {
			player.facing = Math.atan2(dir.x, dir.z);
			rotateModelTowards(player.facing, dt);
		}
		player.moving = true;
		player.dest = null;
	} else {
		player.moving = false;
	}

	if (isSpace() && player.onGround) {
		player.vy = 8;
		player.onGround = false;
		if (presets.jump) playAction(presets.jump, 0.05, false);
	}
	if (!player.onGround) {
		player.vy -= 20 * dt;
		player.y += player.vy * dt;
		if (player.y <= 0) {
			player.y = 0;
			player.vy = 0;
			player.onGround = true;
		}
	}
	player.root.position.y = player.y;

	if (!player.onGround && presets.jump) {
		// jump anim
	} else if (isCtrl() && presets.action) {
		playAction(presets.action, 0.05, true);
		gainXP(10 * dt);
	} else if (player.moving) {
		playAction(isShift() ? presets.run || presets.walk : presets.walk || presets.idle, 0.1, true);
		if (isShift()) gainXP(4 * dt);
	} else {
		playAction(presets.idle, 0.2, true);
	}
}

export function gainXP(v) {
	player.xp += v;
	updateHUD(player);
	if (player.xp >= player.level * 100) {
		player.level++;
		player.lifeMax += 10;
		player.life = Math.min(player.life + 20, player.lifeMax);
	}
}

export function damage(v) {
	player.life = Math.max(0, player.life - v);
	updateHUD(player);
}

export function updatePlayer(dt, mouse, controls) {
    if (player.mixer) player.mixer.update(dt);
    movePlayer(dt, mouse, controls);
}

export { player, rotateModelTowards };
