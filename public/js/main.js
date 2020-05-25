'use strict';

var url = new URL(window.location.href);
var token = url.searchParams.get("token");


const videoElement = document.querySelector('video');
const videoSelect = document.querySelector('select#videoSource');
const img = document.querySelector('#img');
const canvas = document.createElement('canvas');

var maxW = 640;
var maxH = 360;

function setResolution(w, h) {
    maxW = w;
    maxH = h;
    getStream();
}

function setLowResolution(){
    setResolution(160, 120);
}

function setMedResolution(){
    setResolution(640, 480);
}

function setHiResolution(){
    setResolution(1280, 720);
}

function getDevices() {
    return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
    window.deviceInfos = deviceInfos;
    //console.log('Available input and output devices:', deviceInfos);
    for (const deviceInfo of deviceInfos) {
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    }
}

function getStream() {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const videoSource = videoSelect.value;
    const constraints = {
        video: {
            width: maxW,
            height: maxH,
            deviceId: videoSource ? {
                exact: videoSource
            } : undefined
        }
    };
    return navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotStream(stream) {
    window.stream = stream;
    videoSelect.selectedIndex = [...videoSelect.options].
    findIndex(option => option.text === stream.getVideoTracks()[0].label);
    videoElement.srcObject = stream;
    sendImage();
   
}

function handleError(error) {
    console.error('Error: ', error);
}


videoSelect.onchange = getStream;

getStream().then(getDevices).then(gotDevices);
setLowResolution();

var socket = io('http://localhost:3000')

socket.on('need register', function () {
    socket.emit('register', {"role": "client", "token": token})
})

socket.on('lowres', function (data) {
    console.log('lowres')
    setLowResolution()
})

socket.on('highres', function (data) {
    console.log('highres')
    setMedResolution()
})

socket.on('registerResult', function (data) {
    if (data.result === false) {
        location.href = 'login.html'
    }
})

function logTime() {
    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + "." + today.getMilliseconds();
    console.log(time)
}

function sendImage() {
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;   
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
    let dataURL = canvas.toDataURL('image/jpeg');
    socket.emit('image', dataURL);
    //logTime();
    setTimeout(() => {
        sendImage();  
    }, 200);
}

