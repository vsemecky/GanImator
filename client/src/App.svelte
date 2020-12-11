<script>
	import { onMount } from 'svelte';
	export let name;

	let images = [];
	let current_image = {
		seed: 0,
		url: "",
	};

	/**
	 * Fetch Project data
	 */
	onMount(async () => {
		const res = await fetch('/api/project');
		let project = await res.json();
		images = project.images;
		current_image = images[0];
		console.log("Project", project);
		console.log("Images", project.images);
	});

	/**
	 * User clicked on the image => Set the new current image.
	 * @param image
	 */
	function seedOnClick(image) {
		console.log("seedOnClick:", image);
		current_image = image;
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
	<section id="player" class="col-9">
		<img class="img-fluid" src={current_image.url} title={current_image.seed} />
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
