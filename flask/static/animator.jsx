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

    render() {
        if (!this.state.is_loaded) return (<h1>Loading...</h1>);

        return (
            <div className="row">
                <article id="screen" className="col">
                    <img id="player" className="img-fluid" src={"/project/seeds/" + this.state.current_seed + ".jpg"} title={this.state.current_seed} />
                </article>
                <aside className="col-3">
                    {this.state.images.map(image => {
                        return <img key={image.seed} className="img-fluid" src={"/project/seeds/" + image.seed + ".jpg"} title={image.seed} onClick={() => this.seedOnClick(image.seed)} />;
                    })}
                    <button type="button" className="btn btn-success" onClick={() => this.addImageClick()}>Add</button>
                </aside>
            </div>);
    }
}

// ... the starter code you pasted ...

const domContainer = document.querySelector('#react-animator');
ReactDOM.render(e(Animator), domContainer);
