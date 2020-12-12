import os
from pprint import pprint
from threading import Thread
import time
from flask import Blueprint, Flask, render_template, redirect, url_for, abort, send_from_directory, jsonify
from flask_ngrok import run_with_ngrok
from termcolor import colored
from tinydb import Query

import project


# Load ganimator lib only in Colab
try:
    import google.colab  # Check Colab
    from ganimator import *
    IN_COLAB = True
except Exception:
    IN_COLAB = False


class BackgroundWorker(object):
    """ Background worker running in thread """

    def __init__(self, project):
        self.que = []  # array of {'action': string, 'seed': int}  """ Que of jobs should be done by worker """
        self.project = project
        self.images = project.images
        thread = Thread(target=self.run, args=())
        thread.daemon = True
        thread.start()

    def get_seed_filename(self, seed):
        return "{}/{}.jpg".format(self.project.image_dir, seed)

    def get_missing_seeds(self):
        seeds = []
        for image in self.images.all():
            filename = self.get_seed_filename(image['seed'])
            if not os.path.isfile(filename):
                seeds.append(image['seed'])
        return seeds

    def generate_image(self, seed):
        try:
            filename = self.get_seed_filename(seed)
            if os.path.isfile(filename):
                print("generate_image", seed, colored("EXIST", 'yellow'), filename)
            else:
                image_pil = generate_image(pkl=self.project.pkl, seed=int(seed))
                image_pil.save(filename)
                print("generate_image", seed, colored("OK", 'green'), filename)
            self.images.update({'ready': True}, Query().seed == seed)
        except Exception as e:
            print("generate_image", seed, colored("ERROR", 'red'), e)

    def generate_videos(self, seed):
        """ Generate short interpolation videos between `seed` and all other seeds """
        for image in self.images.all():
            try:
                print("generate_videos", seed, "=>", image['seed'])
            except Exception as e:
                print("generate_videos", seed, "=>", image['seed'], colored("ERROR", 'red'), e)

    def run(self):
        """ Start background worker """

        def log(message): print(colored("Worker:", "green"), colored(message, "yellow"), " ")
        log("start")

        # Feed que with missing media
        missing_seeds = self.get_missing_seeds()
        print("Missing seeds:", missing_seeds)
        for seed in missing_seeds:
            self.que.append({'action': 'generate_image', 'seed': seed})

        # Preload neurals (force ganimator to load pkl and store in memory cache)
        load_network(self.project.pkl)

        # Background loop
        while True:
            try:
                task = self.que.pop(0)
                log(task)
                if task['action'] == 'generate_image':
                    self.generate_image(task['seed'])
                #     Nastavit 'ready'
                elif task['action'] == 'generate_videos':
                    self.generate_videos(task['seed'])
                else:
                    log("Uknown task")
            except IndexError:
                time.sleep(2)  # Wait a second, que is empty
            except Exception as e:
                pprint(e)
                log(e)
