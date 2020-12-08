<script>
	import { onMount } from 'svelte';
	export let name;

	let images = [];

	/**
	 * Fetch Project data
	 */
	onMount(async () => {
		const res = await fetch('/api/project');
		let project = await res.json();
		images = project.images;
		console.log("Project", project);
		console.log("Images", project.images);
	});

	function getImageUrl(image) {
		return image && image.ready
			? "/project/seeds/" + image.seed + ".jpg"
			: "https://picsum.photos/768/1280"; // Placeholder if image is not ready yet
	}

	/**
	 * User clicked on the image => Set the new current image.
	 * @param image
	 */
	function seedOnClick(image) {
		console.log("seedOnClick:", image);
		this.setState({current_image: image});
	}

</script>

<style>

</style>

<div class="row">
	<section id="player" class="col-9">
		[PLAYER]
	</section>
	<aside id="sidebar" class="col-3">
		{#each images as image}
			<div key={image.seed} class="thumb">
				<img class="img-fluid" src={getImageUrl(image)} title={image.seed} />
				<button type="button" class="btn btn-sm btn-outline-light" onClick={() => this.removeImageClick(image.seed)}>X</button>
			</div>
		{/each}
		<br />
		<button type="button" class="btn btn-outline-light" onClick={() => this.addImageClick()}>+ Add random seed</button>
	</aside>
</div>

