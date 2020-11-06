import glob
from pprint import pprint
from ganimator import *

class Project:
    """ Web app model for Project"""

    """ Default Psi Truncation """
    psi = 0.75

    def __init__(self, data_dir):
        os.makedirs(data_dir + "/images", exist_ok=True)
        os.makedirs(data_dir + "/styles", exist_ok=True)
        self.data_dir = data_dir
        self.image_seeds = self.get_image_seeds()
        self.style_seeds = self.get_style_seeds()
        self.pkl = self.get_pkl_filename()

    def get_pkl_filename(self):
        pkls = glob.glob(self.data_dir + '/*.pkl')
        print("Pkl files found:")
        pprint(pkls)
        print("Using pkl:", pkls[0])
        return pkls[0]

    def get_seed_url(self, seed):
        return "{}/{}.jpg".format(self.data_dir, seed)

    def get_image_seeds(self):
        seeds = []
        files = glob.glob(self.data_dir + '/images/*.jpg')
        for file in files:
            seeds.append(os.path.splitext(os.path.basename(file))[0])  # Append filename without extension
        return seeds

    def get_style_seeds(self):
        seeds = []
        files = glob.glob(self.data_dir + '/styles/*.jpg')
        for file in files:
            seeds.append(os.path.splitext(os.path.basename(file))[0])  # Append filename without extension
        return seeds

    def add_image(self, seed):
        image_pil = generate_image(pkl=self.pkl, seed=int(seed))
        image_pil.save("%s/images/%s.jpg" % (self.data_dir, seed))
        self._reload_seeds()

    def remove_image(self, seed):
        os.remove("%s/images/%s.jpg" % (self.data_dir, seed))
        self._reload_seeds()

    def add_style(self, seed):
        image_pil = generate_image(pkl=self.pkl, seed=int(seed))
        image_pil.save("%s/style/%s.jpg" % (self.data_dir, seed))
        self._reload_seeds()

    def remove_style(self, seed):
        os.remove("%s/style/%s.jpg" % (self.data_dir, seed))
        self._reload_seeds()

    def _reload_seeds(self):
        self.image_seeds = self.get_image_seeds()
        self.style_seeds = self.get_style_seeds()
