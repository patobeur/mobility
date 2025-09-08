const $lifeBar = document.getElementById("lifeBar");
const $lifeVal = document.getElementById("lifeVal");
const $xpBar = document.getElementById("xpBar");
const $xpVal = document.getElementById("xpVal");
const $anim = document.getElementById("animName");
const $anims = document.getElementById("animsList");

export function updateHUD(player) {
	$lifeVal.textContent = Math.round(player.life);
	$lifeBar.style.width =
		((100 * player.life) / player.lifeMax).toFixed(1) + "%";
	$xpVal.textContent = Math.floor(player.xp);
	const xpPct = player.xp % 100;
	$xpBar.style.width = xpPct + "%";
}

export function logAnims(player) {
	$anims.innerHTML = player.clips.map((c) => `${c.name}`);
	// .join("<br>")
	console.log(
		"Animations GLTF:",
		player.clips.map((c) => c.name)
	);
}

export function updateAnimName(clipName) {
    if ($anim) $anim.textContent = clipName;
}
