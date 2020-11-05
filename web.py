import sys
import flask
from flask import abort, redirect, url_for
from flask_ngrok import run_with_ngrok
from ganimator import *
import project


try:
    import google.colab  # Check Colab
    IN_COLAB = True
except:
    IN_COLAB = False

if len(sys.argv) < 2:
    exit("Missing project dir.\n\nUsage:\n\tpython web.py \"/path/to/my project\"")

project = project.Project(sys.argv[1])  # The first command line argument
app = flask.Flask(__name__, static_url_path='', static_folder=project.data_dir)


# Homepage
@app.route("/")
def main():
    return flask.render_template('index.html', title="Homepage")


# Referenční obrázky
@app.route("/images")
def images():
    return flask.render_template('seeds.html', type="images", seeds=project.image_seeds, title="Images")


# Stylovací obrázky
@app.route("/styles")
def styles():
    return flask.render_template('seeds.html', type="styles", seeds=project.style_seeds, title="Styles")


# System info
@app.route("/sysinfo")
def sysinfo():
    sysinfo_data = {
        'cpu_cores': 2,
        'cpu_threads': 4,
        'ram': 24,
        'gpu_ram': 16,
        'gpu_name': "V100",
        'hdd_space': "100",
        'hdd_space_free': "30",
        'Running in Colab': IN_COLAB,
    }
    return flask.render_template('sysinfo.html', sysinfo=sysinfo_data)


@app.route("/api/add-image/<seed>")
def add_image(seed):
    project.add_image(seed)
    return redirect(url_for('images'))


if __name__ == "__main__":
    if IN_COLAB:
        print("Colab: YES")
        run_with_ngrok(app)  # In Google Colab run with Ngrok
    else:
        print("Colab: No")

    app.run()
