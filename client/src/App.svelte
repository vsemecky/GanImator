<script>
	import { onMount } from 'svelte';

	let images = [];
	let current_image = {
		seed: 0,
		url: "",
	};

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
		console.log("Images", images);
		current_image = images[0];
		player = document.getElementById('player');
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
		}, false);

		// Show first video
		player.src = getVideoUrl(images[1].seed, current_image.seed);
		player.autoplay = true;
		player.muted = true;
		player.load();

	});

	function getVideoUrl(seed1, seed2) {
		return '/project/video/' + seed1 + "-" + seed2 + ".mp4";
	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async function zoomIn() {
		console.log("zoomIn()");
		context.scale(1.2, 1.2);
		player.play();
	}

	async function zoomOut() {
		console.log("zoomOut()");
		context.scale(1/1.2, 1/1.2);
		player.play();
	}

	/**
	 * User clicked on the image => Set the new current image.
	 * @param image
	 */
	function seedOnClick(image) {
		// Skip if seed is the same
		if (image.seed === current_image.seed) {
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
		let image1;
		let image2;
		for (image1 of images) {
			for (image2 of images) {
				// Skip interpolation to the same seed
				if (image1.seed === image2.seed) {
					continue;
				}
				console.log("preloadVideos():", image1.seed, image2.seed);
				await sleep(100);
				const response = await fetch(getVideoUrl(image1.seed, image2.seed));
				await response.blob();
			}
		}
	}

	async function preloadSeedVideos(seed) {
		await sleep(1000);
		console.log("preloadSeedVideos(", seed, "): START");
		let image;
		for (image of images) {
			// Skip interpolation to the same seed
			if (seed === image.seed) {
				continue;
			}
			// Stop preloading if current_image has been changed
			if (seed !== current_image.seed) {
				console.log("preloadSeedVideos(", seed, "): STOPPED");
				return;
			}
			// Wait a while
			await sleep(100);
			// Stop preloading if current_image has been changed
			if (seed !== current_image.seed) {
				console.log("preloadSeedVideos(", seed, "): STOPPED");
				return;
			}
			// Preload video to the browser cache
			const response = await fetch(getVideoUrl(seed, image.seed));
			await response.blob();
		}
		console.log("preloadSeedVideos(", seed, "): FINISHED");
	}
</script>

<style>
	/* Hide video element*/
	video#player {
		/* display: none; */
		visibility: hidden;
		width: 0;
		height: 0;
		padding: 0;
	}

	/**
 	 * Sidebar
 	 */
	aside {
		padding-top: 1em;
	}
	aside div.thumb {
		display:inline-block;
		position:relative;
	}
	aside div.thumb img {
		cursor: pointer;
		min-width: 77px;
		min-height: 77px;
		max-width: 128px;
		max-height: 128px;
		margin: 0 1em 1em 0;
	}
	#sidebar img {
		border: 3px solid #000;
	}
	#sidebar img.active {
		border-color: #fff;
	}
</style>

<div class="row">
	<section class="col-9">
		<!--		<video id="player" width="288" height="480"></video>-->
		<video id="player" width="384" height="640"></video>
		<canvas id="canvas" width="384" height="640" title="Canvas"></canvas>
		<!--		<img id="image" width="384" height="640" src={current_image.url}/>-->
		<!--		<canvas id="canvas" width="576" height="960"></canvas>-->
		<br>
		<div class="btn-group">
			<button type="button" class="btn btn-outline-light" on:click={removeImageClick(current_image.seed)}>Delete image</button>
			<button type="button" class="btn btn-outline-light">Add tag</button>
		</div>
	</section>
	<aside id="sidebar" class="col-3">
		<div class="btn-group">
			<button type="button" class="btn btn-outline-light" on:click={addImageClick}>+ Add random seed</button>
			<button type="button" class="btn btn-outline-light" on:click={preloadVideos}>Preload</button>
			<button type="button" class="btn btn-outline-light" on:click={zoomIn}>Zoom +</button>
			<button type="button" class="btn btn-outline-light" on:click={zoomOut}>Zoom -</button>
		</div>

		<hr>
		{#each images as image}
		<div class="thumb">
			<img class="img-fluid" class:active="{current_image.seed === image.seed}" src={image.url} title={image.seed} alt={image.seed} on:click={seedOnClick(image)} />
		</div>
		{/each}
	</aside>
</div>
