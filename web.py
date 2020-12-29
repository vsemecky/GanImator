import os
import argparse
import time
from flask import Blueprint, Flask, render_template, redirect, url_for, abort, send_from_directory, jsonify
from flask_ngrok import run_with_ngrok
from tinydb import Query
from project import Project
from worker import BackgroundWorker


# Load ganimator lib only in Colab
try:
    import google.colab  # Check Colab
    from ganimator import *
    IN_COLAB = True
except Exception:
    IN_COLAB = False

# Parse commandline parameters
parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--ngrok', nargs='?', const=True, default=False, help='Run Flask with Ngrok')
parser.add_argument('--debug', nargs='?', const=True, default=False, help='Run Flask in debug mode')
parser.add_argument('--project-dir', help='Path to project folder', required=True)
config = parser.parse_args()

project = Project(config.project_dir)

# Start background worker
worker = BackgroundWorker(project)


""" Blueprint for serving Project static files """
project_blueprint = Blueprint(
    'project_blueprint',
    __name__,
    static_url_path='/project',
    static_folder=project.project_dir
)

app = Flask(
    __name__,
    # static_url_path='/static',
    static_url_path='/',
    static_folder="client/public",
    template_folder="flask/templates"
)
app.register_blueprint(project_blueprint)


# Homepage
@app.route("/")
def main():
    return send_from_directory('client/public', 'index.html')


@app.route("/api/project")
def get_project():
    images = []
    for image in project.images.all():
        if os.path.isfile(worker.get_seed_filename(image['seed'])):
            image['url'] = "/project/image/" + str(image['seed']) + ".jpg"
        else:
            image['url'] = "https://via.placeholder.com/768x1280.png?text=" + str(image['seed'])
        images.append(image)

    return jsonify({
        'images': images,
        'pkl': project.pkl,
        'project_dir': project.project_dir,
    })


@app.route("/api/add-image/<int:seed>")
def add_image(seed):
    project.images.insert({
        'seed': int(seed)
    })
    worker.que.append({'action': 'generate_all'})
    time.sleep(2)  # Wait 3 seconds if image is already made.
    return get_project()


@app.route("/api/remove-image/<int:seed>")
def remove_image(seed: int):
    project.images.remove(Query().seed == seed)
    worker.que.append({'action': 'generate_all'})
    return get_project()


if __name__ == "__main__":

    print("Colab:", IN_COLAB)

    if config.ngrok:
        run_with_ngrok(app)
        app.run()  # Start app
    else:
        app.run(debug=config.debug)  # Start app
