<script>
	import { onMount } from 'svelte';
	export let name;

	let images = [];
	let current_image = {
		seed: 0,
		url: "",
	};
	let current_video = "";
	let player;

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
		current_video = '/project/video/' + images[0].seed + "-" + images[1].seed + ".mp4";
		player = document.getElementById("player");
	});

	function fetchVideoAndPlay() {
		const url = '/project/video/639-1.mp4';
		fetch(url)
			.then(response => response.blob())
			.then(blob => {
				console.log("fetchVideoAndPlay:", url);
				console.log("#player", player);
				console.log("blob", blob);
				player.onloadeddata = function() {
					player.srcObject = blob;
				}
				return player.play();
			})
			.then(_ => {
				console.log("fetchVideoAndPlay:", "Video playback started ;)");
			})
			.catch(e => {
				console.log("fetchVideoAndPlay:", "Video playback failed ;(", e);
			})
	}

	/**
	 * User clicked on the image => Set the new current image.
	 * @param image
	 */
	function seedOnClick(image) {
		console.log("seedOnClick:", image);
		let video_url = '/project/video/' + current_image.seed + "-" + image.seed + ".mp4";
		player.load();
		player.src = video_url;
		player.onloadeddata = function() {
			player.play();
		}
		current_image = image;
		// fetchVideoAndPlay();
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
</script>

<style>

</style>

<div class="row">
	<section class="col-9">
		<video id="player" width="576" height="960"></video>
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
	</aside>
</div>
