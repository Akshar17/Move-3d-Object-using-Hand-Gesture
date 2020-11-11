# Move-3d-Object-using-Hand-Gesture

Objective: 	To move the object position according to hand movement.
Description:	Created a Flask API to detect hand movement in python and used that API in WebGL to move the object position. 
The initial goal was to move the object as I move my hand using camera. This didn’t work as then I had to implement Three.js using TensorFlow API but this would require completely new capabilities for the object. So, I decided to go with WebGL with python API to make this work. But I wasn’t successful in implementing the live camera synchronization because of asynchronous socket IO. 
