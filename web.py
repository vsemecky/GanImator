import threading
import time
from random import random
import flask
from flask import abort, redirect, url_for
from flask_ngrok import run_with_ngrok
from termcolor import colored

from ganimator import *
import project
import random


try:
    import google.colab  # Check Colab
    IN_COLAB = True
except:
    IN_COLAB = False

if len(sys.argv) < 2:
    exit("Missing project dir.\n\nUsage:\n\tpython web.py \"/path/to/my project\"")

""" Que of jobs should be done by worker """
worker_que = [654, 879, 654, 654, 654, 6521, 654, 654]

project = project.Project(sys.argv[1])  # The first command line argument
app = flask.Flask(
    __name__,
    static_url_path='',
    static_folder=project.data_dir,
    template_folder='flask/templates'
)


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


@app.route("/api/add-image")
@app.route("/api/add-image/")
@app.route("/api/add-image/<seed>")
def add_image(seed=None):
    seed = seed or random.randrange(1, 9999)

    # if not seed:
    #     seed = random.randrange(1, 9999)  # Random seed
    # project.add_image(seed)
    worker_que.append(seed)
    return redirect(url_for('images'))


def background_worker():
    """ Background worker running in thread """
    title = colored("Thread", "yellow")
    print(title, "start")
    while 1:
        try:
            seed = worker_que.pop(0)
            print(title, "seed =", seed)
            time.sleep(0.1)
        except:
            print(title, "Que is empty")
            time.sleep(1)


if __name__ == "__main__":
    print("Colab:", IN_COLAB)
    if IN_COLAB:
        run_with_ngrok(app)  # In Google Colab run with Ngrok

    threading.Thread(target=background_worker).start()  # Start background worker
    app.run()  # Start app
