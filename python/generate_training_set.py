from PIL import Image, ImageChops, ImageEnhance, ImageFilter
import os
from tqdm import tqdm
import numpy as np
import pickle
import random

IMG_SIZE = 64
TRAIN_DIR = ".\\train"
LOW_QUAL_DIR = ".\\low_qual"
CATEGORIES = ["original","modified"]

training_set = []

for category in CATEGORIES:  # do for original and modified
    org_path = os.path.join(TRAIN_DIR,category)  # create path variable for original images
    low_qual_path = os.path.join(LOW_QUAL_DIR,category) # create path variable for low quality images
    for img in tqdm(os.listdir(org_path)):  # iterate over each image within the category
        original = Image.open(os.path.join(org_path,img)).convert('RGB').resize((IMG_SIZE,IMG_SIZE)) # opening original file
        low_qual = os.path.join(low_qual_path,img.split('.')[0]+'.jpg') # path of corresponding low quality image
        original.save(low_qual,'JPEG', quality=100) # resave the original image
        # Enhance the orginal image
        original = ImageEnhance.Color(ImageEnhance.Sharpness(Image.open(os.path.join(org_path,img))).enhance(0.1)).enhance(0.5).convert('RGB').resize((IMG_SIZE,IMG_SIZE))
        original = original.filter(ImageFilter.EDGE_ENHANCE_MORE).filter(ImageFilter.DETAIL).filter(ImageFilter.GaussianBlur(1))
        # Enhance the resaved image
        temporary = ImageEnhance.Color(ImageEnhance.Sharpness(Image.open(low_qual)).enhance(0.1)).enhance(0.5).convert('RGB')
        temporary = temporary.filter(ImageFilter.EDGE_ENHANCE_MORE).filter(ImageFilter.DETAIL).filter(ImageFilter.GaussianBlur(1))
        # find the difference between the 2 images
        ela_image = ImageChops.difference(original, temporary)
        extrema = ela_image.getextrema()
        # enhance the ela image
        max_difference = max([ex[1] for ex in extrema])
        if max_difference == 0:
            max_difference = 1
        ela_image = ImageEnhance.Color(ImageEnhance.Brightness(ela_image).enhance(255.0 / max_difference)).enhance(1.0).filter(ImageFilter.EDGE_ENHANCE)
        bw_ela_image = ImageEnhance.Color(ela_image).enhance(0.0)
        ela_image = ImageChops.difference(ela_image, bw_ela_image)
        # convert the image into numpy array
        ela_array = np.array(ela_image)
        training_set.append([ela_array,CATEGORIES.index(category)])

random.shuffle(training_set)

X = []
Y = []

for features,label in training_set:
    X.append(features)
    Y.append(label)
X = np.array(X).reshape(-1, IMG_SIZE, IMG_SIZE, 3) # resize the image

# save the X and Y into pickle files
pickle_out = open("X.pickle","wb")
pickle.dump(X, pickle_out)
pickle_out.close()

pickle_out = open("Y.pickle","wb")
pickle.dump(Y, pickle_out)
pickle_out.close()