from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation, Flatten, InputLayer, Conv2D, MaxPooling2D
from keras.optimizers import Adam
import keras
import pickle

# opening the pickle files
pickle_in = open("X.pickle","rb")
X = pickle.load(pickle_in)

pickle_in = open("Y.pickle","rb")
Y = pickle.load(pickle_in)
X = X/255.0

# First run - To make model learn without shuffle
model = Sequential()
model.add(Conv2D(128, (3, 3), input_shape=X.shape[1:]))
model.add(Activation('relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Conv2D(64, (3, 3)))
model.add(Activation('relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Flatten())  # Converts our 3D feature maps to 1D feature vectors
model.add(Dense(8))
model.add(Activation('relu'))
model.add(Dense(1))
model.add(Activation('sigmoid'))
model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
model.fit(X, Y,batch_size=32,epochs=15,validation_split=0.3)
model.save('CNN.model')

# Second run - To make model better by shuffle and learn
# model = keras.models.load_model("CNN.model")
# model.fit(X, Y,batch_size=32,epochs=50,validation_split=0.3,shuffle=True)
# model.save('CNN.model')