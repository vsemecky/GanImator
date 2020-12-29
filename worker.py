import os
from pprint import pprint
from threading import Thread
import time
from flask import Blueprint, Flask, render_template, redirect, url_for, abort, send_from_directory, jsonify
from flask_ngrok import run_with_ngrok
from termcolor import colored
from tinydb import Query

from project import Project


# Load ganimator lib only in Colab
try:
    import google.colab  # Check Colab
    from ganimator import *
    IN_COLAB = True
except Exception:
    IN_COLAB = False


class BackgroundWorker(object):
    """ Background worker running in thread """

    # Video render options
    video_options = {
        'preset':  "veryslow",  # veryslow / ultrafast
        'codec':   "libx264",
        'bitrate': '24M',
        'fps':     30,
        'threads': 8,
    }

    def __init__(self, project: Project):
        self.que = []  # array of {'action': string, 'seed': int}  """ Que of jobs should be done by worker """
        self.project = project
        self.images = project.images
        self.duration = 1  # Duration of interpolation videos [seconds]
        thread = Thread(target=self.run, args=())
        thread.daemon = True
        thread.start()

    def get_seed_filename(self, seed):
        return "{}/{}.jpg".format(self.project.image_dir, seed)

    def get_interpolation_filename(self, seed1, seed2):
        return "{}/{}-{}.mp4".format(self.project.video_dir, seed1, seed2)

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
                return
            image_pil = generate_image(pkl=self.project.pkl, seed=int(seed), psi=self.project.psi)
            image_pil.save(filename)
            print("generate_image", seed, colored("OK", 'green'), filename)
        except Exception as e:
            print("generate_image", seed, colored("ERROR", 'red'), e)

    def generate_missing_images(self):
        """ Generate all missing images """
        print(colored("Worker:", "green"), "Generating missing images")
        for image in self.images.all():
            try:
                filename = self.get_seed_filename(image['seed'])
                if os.path.isfile(filename):
                    continue
                else:
                    image_pil = generate_image(pkl=self.project.pkl, seed=int(image['seed']), psi=self.project.psi)
                    image_pil.save(filename)
                    print("Generating image", image['seed'], colored("OK", 'green'), filename)
            except Exception as e:
                print("Generating image", image['seed'], colored("ERROR", 'red'), e)

    def generate_missing_videos(self):
        """ Generate all missing interpolation videos """
        print(colored("Worker:", "green"), "Generate all missing interpolation videos")
        images_count = len(self.images.all())
        for image1 in self.images.all():
            for image2 in self.images.all():
                try:
                    # Stop video generating on images count change
                    if images_count != len(self.images.all()):
                        print(colored("Worker:", "green"), "Images count change: Generating videos STOPPED ")
                        return

                    # Skip interpolation between identical seeds
                    if image1['seed'] == image2['seed']:
                        continue
                    filename = self.get_interpolation_filename(image1['seed'], image2['seed'])
                    # Skip if video already exists
                    if os.path.isfile(filename):
                        continue

                    print("Generating video", image1['seed'], "=>", image2['seed'])
                    clip = latent_interpolation_clip(
                        pkl=self.project.pkl,
                        psi=self.project.psi,
                        mp4_fps=30,
                        duration=self.duration,
                        seeds=[image1['seed'], image2['seed']]
                    )
                    clip.write_videofile(
                        filename=filename,
                        **self.video_options
                    )
                except Exception as e:
                    print("Generating video", image1['seed'], "=>", image2['seed'], colored("ERROR", 'red'), e)

    def run(self):
        """ Start background worker """

        def log(message): print(colored("Worker:", "green"), colored(message, "yellow"), " ")
        log("start")

        # Preload neurals (force ganimator to load pkl and store in memory cache)
        preload_pkl(pkl=self.project.pkl)

        # Generate missing images and videos
        self.generate_missing_images()
        self.generate_missing_videos()

        # Background loop
        while True:
            try:
                task = self.que.pop(0)
                log(task)
                if task['action'] == 'generate_images':
                    self.generate_missing_images()
                elif task['action'] == 'generate_videos':
                    self.generate_missing_videos()
                elif task['action'] == 'generate_all':
                    self.generate_missing_images()
                    self.generate_missing_videos()
                else:
                    log("Uknown task")
            except IndexError:
                time.sleep(2)  # Wait a second, que is empty
            except Exception as e:
                pprint(e)
                log(e)
