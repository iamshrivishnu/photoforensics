import cv2
import numpy as np
import os
import sys
from tqdm import tqdm
import tensorflow as tf
import tflearn
from tflearn.layers.conv import conv_2d, max_pool_2d
from tflearn.layers.core import input_data, dropout, fully_connected
from tflearn.layers.estimator import regression
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.logging.set_verbosity(tf.logging.ERROR)
IMG_SIZE = 256
LR = 1e-3
MODEL_NAME = 'fakeimagedetect-{}-{}.model'.format(LR, 'CNN')

convnet = input_data(shape=[None, IMG_SIZE, IMG_SIZE, 1], name='input')
convnet = conv_2d(convnet, 32, 5, activation='relu')
convnet = max_pool_2d(convnet, 5)
convnet = conv_2d(convnet, 64, 5, activation='relu')
convnet = max_pool_2d(convnet, 5)
convnet = fully_connected(convnet, 1024, activation='relu')
convnet = dropout(convnet, 0.8)
convnet = fully_connected(convnet, 2, activation='softmax')
convnet = regression(convnet, optimizer='adam', learning_rate=LR, loss='categorical_crossentropy', name='targets')
model = tflearn.DNN(convnet, tensorboard_dir='log')
if os.path.exists('./{}.meta'.format(MODEL_NAME)):
    model.load(MODEL_NAME, weights_only=False)

path = os.path.join('../upload',sys.argv[1])
img = cv2.imread(path,cv2.IMREAD_GRAYSCALE)
img = cv2.resize(img, (IMG_SIZE,IMG_SIZE))
data = np.array(img).reshape(IMG_SIZE,IMG_SIZE,1)
model_out = model.predict([data])[0]
if np.argmax(model_out) == 1: 
    str_label='Modified'
else: 
    str_label='Orginal'
f= open("output.txt","w+")
f.write(str_label)
f.close()
print("Prediction : {}".format(str_label))