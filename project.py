import os
import glob
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

    def __init__(self, project_dir):
        # Folders
        self.project_dir = project_dir
        self.image_dir = project_dir + "/image"
        self.video_dir = project_dir + "/video"
        os.makedirs(self.image_dir, exist_ok=True)
        os.makedirs(self.video_dir, exist_ok=True)

        # JSON database
        self.db = TinyDB(project_dir + '/project.json', sort_keys=False, indent=4, separators=(',', ': '))
        # tables
        self.images = self.db.table('images')
        self.styles = self.db.table('styles')

        # Network pkl
        self.pkl = self.get_pkl_filename()

    def get_pkl_filename(self):
        pkls = glob.glob(self.project_dir + '/*.pkl')
        if len(pkls) != 1:
            print("There should be exactly one *.pkl file in project directory. Found ", len(pkls))
            exit()
        print("Network (PKL):", pkls[0], "\n")
        return pkls[0]
