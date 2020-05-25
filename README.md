# jsImageStream
a simple nodeJS application to stream webcam Images in 5 fps and JPEG format

most of the webcams does not support lower than 30 fps and when you want to video conference with more than 70+ client the 
bandwidth will become a problem because of the video stream. so to lower the bandwidth i manually take 5 fps from webcam
and send it to server in jpeg format and then broadcast it.

it is a simple sample for nodejs, getusermedia, and image streaming in socket.io

to install run npm install