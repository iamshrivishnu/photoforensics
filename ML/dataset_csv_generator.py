import os
path_orig = './casia-dataset/CASIA2/Au/'
path_modif = './casia-dataset/CASIA2/Tp/'

folder_orig = os.listdir()
folder_modif = os.listdir()

strings = []

for file in os.listdir(path_orig):
  try:
    if file.endswith('jpg'):
        line =  path_orig + file  + ',1\n'
        strings.append(line)     
  except Exception as e: 
      print(e)


for file in os.listdir(path_modif):
    try:
      if file.endswith('jpg'):
        line =  path_modif + file + ',0\n'
        strings.append(line)
    except Exception as e: 
      print(e)
      
for line in strings:
      with open('dataset.csv', 'a') as f:
            f.write(line)