<script>
	import { onMount } from 'svelte';
	export let name;

	let images = [];
	let current_image = {
		seed: 0,
		url: "",
	};
	// let current_video = "";

	// Elements
	let player;
	let canvas;
	let context;

	/**
	 * Fetch Project data
	 */
	onMount(async () => {
		const res = await fetch('/api/project');
		let project = await res.json();
		console.log("Project", project);
		images = project.images;
		console.log("Images", project.images);
		current_image = images[0];
		// current_video = '/project/video/' + images[0].seed + "-" + images[1].seed + ".mp4";
		player = document.getElementById("player");
		canvas = document.getElementById('canvas');
		context = canvas.getContext('2d');
		context.scale(0.5, 0.5);

		player.addEventListener('play', function() {
			(function loop() {
				if (!player.paused && !player.ended) {
					context.drawImage(player, 0, 0);
					setTimeout(loop, 1000 / 30); // drawing at 30fps
				}
			})();
		}, 0);
	});

	function getVideoUrl(seed1, seed2) {
		return '/project/video/' + seed1 + "-" + seed2 + ".mp4";
	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * User clicked on the image => Set the new current image.
	 * @param image
	 */
	function seedOnClick(image) {
		// Skip if seed is the same
		if (image.seed == current_image.seed) {
			return false;
		}
		document.body.style.cursor = "progress";
		console.log("seedOnClick:", image);
		player.src = getVideoUrl(current_image.seed, image.seed);
		player.load();
		player.onloadeddata = function() {
			player.play();
			document.body.style.cursor = "default";
		}
		current_image = image;
		preloadSeedVideos(current_image.seed);
	}

	async function addImageClick() {
		console.log("addImageClick()");
		let seed = prompt("Enter seed (number 1..1000):", (Math.floor(Math.random() * 1000) + 1).toString());
		if (seed != null) {
			const res = await fetch("/api/add-image/" + seed);
			let project = await res.json();
			images = project.images;
			console.log("addImage() RESULT", images);
		}
	}

	async function removeImageClick(seed) {
		console.log("removeImageClick()");
		if (confirm("Delete image seed #" + seed + " ?")) {
			const res = await fetch("/api/remove-image/" + seed);
			let project = await res.json();
			images = project.images;
		}
	}

	async function preloadVideos() {
		console.log("preloadVideos()", images);
		var image1;
		var image2;
		for (image1 of images) {
			for (image2 of images) {
				console.log(image1.seed, image2.seed);
				const res = await fetch(getVideoUrl(image1.seed, image2.seed));
			}
		}
	}

	async function preloadSeedVideos(seed) {
		console.log("preloadSeedVideos()", seed);
		await sleep(1500);
		var image;
		for (image of images) {
			if (seed != image.seed) {
				const res = await fetch(getVideoUrl(seed, image.seed));
			}
		}
	}
</script>

<style>
	/* Hide video element*/
	video {
		visibility: hidden;
		display: none;
	}
</style>

<div class="row">
	<section class="col-9">
		<video id="player" width="3" height="5"></video>
		<canvas id="canvas" width="576" height="960"></canvas>
	</section>
	<aside id="sidebar" class="col-3">
		{#each images as image}
		<div  class="thumb">
			<img class="img-fluid" src={image.url} title={image.seed} on:click={seedOnClick(image)} />
			<button type="button" class="btn btn-sm btn-outline-light" on:click={removeImageClick(image.seed)}>X</button>
		</div>
		{/each}
		<br />
		<button type="button" class="btn btn-outline-light" on:click={addImageClick}>+ Add random seed</button>
		<button type="button" class="btn btn-outline-light" on:click={preloadVideos}>Preload</button>
	</aside>
</div>
