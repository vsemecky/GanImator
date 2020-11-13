const e = React.createElement;

class Animator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            is_loaded: false,
            images: [],
            styles: [],
            current_seed: 0,
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
                    result.current_seed = result.images[0].seed;
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

    seedOnClick(seed) {
        console.log("seedOnClick", seed);
        this.setState({ current_seed: seed});
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
            console.log("Remove image...", seed);
            fetch("/api/remove-image/" + seed)
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log("...delete image Done.", seed);
                        this.setState(result);
                    },
                    (error) => {
                        this.setState({isLoaded: true, error});
                    }
                )
        }
    }

    render() {
        if (!this.state.is_loaded) return (<h1>Loading...</h1>);

        return (
            <div className="row">
                <main id="player" className="col-9">
                    <img className="img-fluid" src={"/project/seeds/" + this.state.current_seed + ".jpg"} title={this.state.current_seed} />
                </main>
                <aside className="col-3">
                    {this.state.images.map(image => {
                        const imageUrl = (image.ready) ? "/project/seeds/" + image.seed + ".jpg" : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
                        return (
                            <div key={image.seed} className="thumb">
                                <img className="img-fluid" src={imageUrl} title={image.seed} onClick={() => this.seedOnClick(image.seed)} />
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
