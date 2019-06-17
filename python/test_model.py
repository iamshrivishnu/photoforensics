import keras
import numpy as np
from PIL import Image, ImageChops, ImageEnhance, ImageFilter
import os
from tqdm import tqdm

CATEGORIES = ["original", "modified"]
TEMP = '.\\temp.jpg'
IMG_SIZE = 64
TEST_DIR = ".\\test"

# loading the pre-trained model
model = keras.models.load_model("CNN.model")

for img in tqdm(os.listdir(TEST_DIR)):  # iterate over each image within the folder and get ela image
    original = Image.open(os.path.join(TEST_DIR,img)).convert('RGB').resize((IMG_SIZE,IMG_SIZE)) 
    original.save(TEMP,'JPEG', quality=100)
    original = ImageEnhance.Color(ImageEnhance.Sharpness(Image.open(os.path.join(TEST_DIR,img))).enhance(0.1)).enhance(0.5).convert('RGB').resize((IMG_SIZE,IMG_SIZE))
    original = original.filter(ImageFilter.EDGE_ENHANCE_MORE).filter(ImageFilter.DETAIL).filter(ImageFilter.GaussianBlur(1))
    temporary = ImageEnhance.Color(ImageEnhance.Sharpness(Image.open(TEMP)).enhance(0.1)).enhance(0.5).convert('RGB')
    temporary = temporary.filter(ImageFilter.EDGE_ENHANCE_MORE).filter(ImageFilter.DETAIL).filter(ImageFilter.GaussianBlur(1))
    ela_image = ImageChops.difference(original, temporary)
    extrema = ela_image.getextrema()
    max_difference = max([ex[1] for ex in extrema])
    if max_difference == 0:
        max_difference = 1
    ela_image = ImageEnhance.Color(ImageEnhance.Brightness(ela_image).enhance(255.0 / max_difference)).enhance(1.0).filter(ImageFilter.EDGE_ENHANCE)
    bw_ela_image = ImageEnhance.Color(ela_image).enhance(0.0)
    ela_image = ImageChops.difference(ela_image, bw_ela_image)
    ela_array = np.array(ela_image).reshape(-1, IMG_SIZE, IMG_SIZE, 3)
    # feeding the image into the model and getting the prediction
    prediction = model.predict([ela_array])
    print("Original : {}, Prediction : {} ".format(img,CATEGORIES[int(prediction[0][0])]))