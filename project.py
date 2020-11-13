import glob
import os
from pprint import pprint

from termcolor import colored
from tinydb import TinyDB, Query
try:
    import google.colab  # Check Colab
    from ganimator import *  # Load ganimator lib only in Colab
except Exception:
    pass


class Project:
    """ Web app model for Project"""

    """ Default Psi Truncation """
    psi = 0.75

    def __init__(self, data_dir):
        # Folders
        self.data_dir = data_dir
        self.image_dir = data_dir + "/seeds"
        os.makedirs(self.image_dir, exist_ok=True)

        # JSON database
        self.db = TinyDB(data_dir + '/project.json', sort_keys=False, indent=4, separators=(',', ': '))
        self.images = self.db.table('images')
        self.styles = self.db.table('styles')

        # Network pkl
        self.pkl = self.get_pkl_filename()

    def get_pkl_filename(self):
        pkls = glob.glob(self.data_dir + '/*.pkl')
        print("Network (PKL):", pkls[0], "\n")
        return pkls[0]

    def get_seed_filename(self, seed):
        return "{}/{}.jpg".format(self.image_dir, seed)

    def generate_image(self, seed):
        try:
            filename = self.get_seed_filename(seed)
            image_pil = generate_image(pkl=self.pkl, seed=int(seed))
            image_pil.save(filename)
            print("generate_image", seed, colored("OK", 'green'), filename)
        except Exception as e:
            print("generate_image", seed, colored("ERROR", 'red'), e)

    def generate_videos(self, seed):
        """ Generate short interpolation videos between `seed` and all other seeds """
        for image in self.images.all():
            try:
                print("generate_videos", seed, "=>", image['seed'])
            except Exception as e:
                print("generate_videos", seed, "=>", image['seed'], colored("ERROR", 'red'), e)

    def get_missing_seeds(self):
        seeds = []

        for image in self.images.all():
            filename = self.get_seed_filename(image['seed'])
            if not os.path.isfile(filename):
                seeds.append(image['seed'])

        for style in self.styles.all():
            filename = self.get_seed_filename(style['seed'])
            if not os.path.isfile(filename):
                seeds.append(style['seed'])

        return seeds
