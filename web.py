from threading import Thread
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
    return flask.render_template('images.html', seeds=project.image_seeds, title="Images")


# Stylovací obrázky
@app.route("/styles")
def styles():
    return flask.render_template('styles.html', seeds=project.style_seeds, title="Styles")


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
    worker_que.append(seed)
    return redirect(url_for('images'))


@app.route("/api/add-style")
@app.route("/api/add-style/")
@app.route("/api/add-style/<seed>")
def add_style(seed=None):
    seed = seed or random.randrange(1, 9999)
    worker_que.append(seed)
    return redirect(url_for('styles'))


@app.route("/api/remove-image/<seed>")
def remove_image(seed):
    project.remove_image(seed)
    return redirect(url_for('images'))


@app.route("/api/remove-style/<seed>")
def remove_style(seed):
    project.remove_image(seed)
    return redirect(url_for('styles'))


def background_worker():
    """ Background worker running in thread """
    def log(message: str): print(colored("Worker:", "green"), colored(message, "yellow"))

    log("start")
    while True:
        try:
            seed = worker_que.pop(0)
            log("seed = %d" % seed)
            project.add_image(seed)
        except Exception as e:
            log("Que is empty")
            time.sleep(2)


if __name__ == "__main__":
    print("Colab:", IN_COLAB)
    if IN_COLAB:
        run_with_ngrok(app)  # In Google Colab run with Ngrok

    Thread(target=background_worker).start()  # Start background worker
    app.run()  # Start app
