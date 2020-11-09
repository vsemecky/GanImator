const e = React.createElement;

class Animator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            images: [],
            styles: [],
            current_image: 0,
        };
        this.render();
    }

    componentDidMount() {
    fetch("/api/project")
        .then(res => res.json())
        .then(
            (result) => {
                console.log("RESULT", result);
                this.setState(result);
                console.log("STATE", this.state);
            },
            (error) => {
                this.setState({
                    isLoaded: true,
                    error
                });
            }
        )
    }

    seedOnClick(seed) {
        console.log("seedOnClick", seed);
        this.setState({ current_image: seed});
    }

    addImage() {
        var seed = Math.floor(Math.random() * 1000) + 1;  // Random number 1-1000
        fetch("/api/add-image/" + seed)
        .then(res => res.json())
        .then(
            (result) => {
                console.log("RESULT", result);
                this.setState(result);
                console.log("STATE", this.state);
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
        return (
            <div className="row">
                <article id="screen" className="col">
                    <img id="player" className="img-fluid" src={"/project/images/" + this.state.current_image + ".jpg"} title={this.state.current_image} />
                </article>
                <aside className="col-3">
                    {this.state.images.map(seed => {
                        return <img key={seed} className="img-fluid" src={"/project/images/" + seed + ".jpg"} title={seed} onClick={() => this.seedOnClick(seed)} />;
                    })}
                    <button type="button" className="btn btn-success" onClick={this.addImage}>Add</button>
                </aside>
            </div>);
    }
}

// ... the starter code you pasted ...

const domContainer = document.querySelector('#react-animator');
ReactDOM.render(e(Animator), domContainer);
