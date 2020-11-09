const e = React.createElement;

const images = [420, 123];

// noinspection JSXNamespaceValidation
class Animator extends React.Component {

    // currentSeed = images[0];

    constructor(props) {
        super(props);
        this.state = { currentSeed: 123 };
        // this.currentSeed = images[1];
        this.render();
    }

    seedOnClick(seed) {
        console.log("seedOnClick", seed);
        this.setState({ currentSeed: seed});
        this.state.currentSeed = seed;
    }

    render() {
        console.log(images);
        return (
            <div className="row">
                <article id="screen" className="col">
                    <b>Player</b>
                    <img id="player" className="img-fluid" src={"/project/images/" + this.state.currentSeed + ".jpg"} title={this.state.currentSeed} />
                </article>
                <aside className="col-3">
                    {images.map(seed => {
                        return <img key={seed} className="img-fluid" src={"/project/images/" + seed + ".jpg"} title={seed} onClick={() => this.seedOnClick(seed)} />;
                        // return <img key={seed} className="img-fluid" src={"/project/images/" + seed + ".jpg"} title={seed} onClick={() => this.seedOnClick(seed)} />;
                    })}
                </aside>
            </div>);
    }
}

// ... the starter code you pasted ...

const domContainer = document.querySelector('#react-animator');
ReactDOM.render(e(Animator), domContainer);
