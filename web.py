import sys
from pprint import pprint
from threading import Thread
import time
from flask import Blueprint, Flask, render_template, redirect, url_for, abort
from flask_ngrok import run_with_ngrok
from termcolor import colored
from tinydb import Query

import project


try:
    import google.colab  # Check Colab
    from ganimator import *  # Load ganimator lib only in Colab
    IN_COLAB = True
except Exception:
    IN_COLAB = False

if len(sys.argv) < 2:
    exit("Missing project dir.\n\nUsage:\n\tpython web.py \"/path/to/my project\"")
project = project.Project(sys.argv[1])  # The first command line argument

""" Que of jobs should be done by worker """
worker_que = []  # array of {'action': string, 'seed': int}


""" Blueprint for serving Project static files """
project_blueprint = Blueprint(
    'project_blueprint',
    __name__,
    static_url_path='/project',
    static_folder=project.data_dir
)

app = Flask(
    __name__,
    static_url_path='/static',
    static_folder="flask/static",
    template_folder="flask/templates"
)
app.register_blueprint(project_blueprint)


# Homepage
@app.route("/")
def main():
    return render_template('index.html', seeds=project.images, title="Homepage")


@app.route("/api/project")
def get_project():
    return {
        'images': project.images.all(),
        'styles': project.styles.all(),
    }


@app.route("/api/add-image/<seed>")
def add_image(seed=None):
    project.images.insert({'seed': seed})
    worker_que.append({'action': 'generate_image', 'seed': seed})
    time.sleep(0)  # Wait 3 seconds if image is already made.
    return get_project()


@app.route("/api/add-style/<seed>")
def add_style(seed):
    project.styles.insert({'seed': seed})
    worker_que.append({'action': 'generate_image', 'seed': seed})
    return get_project()


@app.route("/api/remove-image/<seed>")
def remove_image(seed):
    project.images.remove(Query().seed == seed)
    return get_project()


@app.route("/api/remove-style/<seed>")
def remove_style(seed):
    project.styles.remove(Query().seed == seed)
    return get_project()


def background_worker():
    """ Background worker running in thread """
    def log(message): print(colored("Worker:", "green"), colored(message, "yellow"), " ")
    log("start")

    # Feed que with missing media
    print("Missing seeds:", project.get_missing_seeds())
    for seed in project.get_missing_seeds():
        worker_que.append({'action': 'generate_image', 'seed': seed})

    # Background loop
    while True:
        try:
            task = worker_que.pop(0)
            log(task)
            if task['action'] == 'generate_image':
                project.generate_image(task['seed'])
            else:
                log("Uknown task")
        except IndexError:
            time.sleep(2)  # Wait a second, que is empty
        except Exception as e:
            pprint(e)
            log(e)


if __name__ == "__main__":
    print("Colab:", IN_COLAB)

    Thread(target=background_worker).start()  # Start background worker

    if IN_COLAB:
        run_with_ngrok(app)  # In Google Colab run with Ngrok
        app.run()  # Start app
    else:
        app.run(debug=True)  # Start app
