import sys
import keras
import numpy as np
from PIL import Image, ImageChops, ImageEnhance, ImageFilter
import os
from tqdm import tqdm

CATEGORIES = ["Original", "Modified"]
TEMP = './temp.jpg'
IMG_SIZE = 64

model = keras.models.load_model("./python/CNN.model")

original = Image.open(os.path.join('./uploads',sys.argv[1])).convert('RGB').resize((IMG_SIZE,IMG_SIZE))
original.save(TEMP,'JPEG', quality=100)
original = ImageEnhance.Color(ImageEnhance.Sharpness(Image.open(os.path.join('./uploads',sys.argv[1]))).enhance(0.1)).enhance(0.5).convert('RGB').resize((IMG_SIZE,IMG_SIZE))
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
prediction = model.predict([ela_array])
print(CATEGORIES[int(prediction[0][0])])
# file_handler = open("./python/output.txt","w+")
# file_handler.write(CATEGORIES[int(prediction[0][0])])
# file_handler.close()
