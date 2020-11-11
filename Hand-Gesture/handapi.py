from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import cv2
import numpy as np
import time
import sys


app = Flask(__name__)

socketio = SocketIO()
socketio.init_app(app, cors_allowed_origins="*")
CORS(app)
point_selected = False


@app.route('/')
def index():
    return 'True'


@socketio.on('run')
def connect(msg):
    global old_gray, point, point_selected, old_points
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  512)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 512)
    _, frame = cap.read()
    old_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    lk_params = dict(winSize=(20, 20),
                     maxLevel=5,
                     criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03))  # lukas params

    cv2.namedWindow("Frame")
    cv2.setMouseCallback("Frame", select_point)

    while True:
        _, frame = cap.read()
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if point_selected is True:
            cv2.circle(frame, point, 5, (0, 0, 255), 2)

            new_points, status, error = cv2.calcOpticalFlowPyrLK(
                old_gray, gray_frame, old_points, None, **lk_params)
            old_gray = gray_frame.copy()

            old_points = new_points
            # print(new_points)
            x, y = new_points.ravel()   # getting position in x,y
            #print(x, y)
        #    x, y = round(x, 2), round(y, 2)
            cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)
            #cv2.line(frame, (z, w), (x, y), (255, 255, 255), 8)
            emit('data points', {'x': float(x), 'y': float(y)})
            # x = x.astype('str')
            # y = y.astype('str')
            #fh = open('Coordinates.txt', 'a+')
            #x, y = x.tostring(), y.tostring()
            # fh.write(x + ',' + y + '\n')

        #first_level = cv2.pyrDown(frame)
        #second_level = cv2.pyrDown(first_level)
        cv2.imshow("Frame", frame)
        key = cv2.waitKey(1)
        if key == 113:
            cap.release()
            cv2.destroyAllWindows()
            #emit('close connection', {'close': True})
            socketio.stop()
            sys.exit()
            break
        #cv2.imshow("First ", first_level)
        #cv2.imshow("Second", second_level)

        # time.sleep(0.1)
        #emit('close connection', {'close': True})
    socketio.stop()
    sys.exit()


def select_point(event, x, y, flags, params):
    global point, point_selected, old_points
    if event == cv2.EVENT_LBUTTONDOWN:
        point = (x, y)
        point_selected = True
        old_points = np.array([[x, y]], dtype=np.float32)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=True)
    sys.exit()
