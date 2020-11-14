const e = React.createElement;

class Animator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            is_loaded: false,
            images: [],
            styles: [],
            current_image: {
                ready: false
            },
        };
        this.render();
    }

    componentDidMount() {
        fetch("/api/project")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log("componentDidMount() RESULT", result);
                    // Enrich result
                    result.current_image = result.images[0];
                    result.is_loaded = true;
                    this.setState(result);
                    console.log("componentDidMount() STATE", this.state);
                },
                (error) => {
                    console.log("componentDidMount() ERROR", error);
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    /**
     * User clicked on the image => Set the new current image.
     * @param image
     */
    seedOnClick(image) {
        console.log("seedOnClick:", image);
        this.setState({current_image: image});
    }

    addImageClick() {
        console.log("Add image");
        let seed = Math.floor(Math.random() * 1000) + 1;  // Random number 1-1000
        fetch("/api/add-image/" + seed)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log("addImage() RESULT", result);
                    this.setState(result);
                    console.log("addImage() STATE", this.state);
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    removeImageClick(seed) {
        if (confirm("Delete image seed #" + seed + " ?")) {
            fetch("/api/remove-image/" + seed)
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log("Image #", seed, " removed.");
                        this.setState(result);
                        // If we just deleted current_image, reset current_image to the first one
                        if (seed == this.state.current_image.seed) {
                            this.setState({current_image: this.state.images[0]});
                        }
                    },
                    (error) => {
                        this.setState({isLoaded: true, error});
                    }
                )
        }
    }

    getImageUrl(image) {
        return image.ready
            ? "/project/seeds/" + image.seed + ".jpg"
            : "https://picsum.photos/id/" + image.seed + "/768/1280"; // Placeholder if image is not ready yet
    }

    render() {
        if (!this.state.is_loaded) return (<h1>Loading...</h1>);

        return (
            <div className="row">
                <main id="player" className="col-9">
                    <img className="img-fluid" src={this.getImageUrl(this.state.current_image)} title={this.state.current_image.seed} />
                </main>
                <aside className="col-3">
                    {this.state.images.map(image => {
                        return (
                            <div key={image.seed} className="thumb">
                                <img className="img-fluid" src={this.getImageUrl(image)} title={image.seed} onClick={() => this.seedOnClick(image)} />
                                <button type="button" className="btn btn-sm btn-outline-light" onClick={() => this.removeImageClick(image.seed)}>X</button>
                            </div>
                        );
                    })}
                    <br />
                    <button type="button" className="btn btn-outline-light" onClick={() => this.addImageClick()}>+ Add random seed</button>
                </aside>
            </div>);
    }
}

// ... the starter code you pasted ...

const domContainer = document.querySelector('#react-animator');
ReactDOM.render(e(Animator), domContainer);
