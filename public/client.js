import JSMpeg from 'https://cdn.jsdelivr.net/npm/jsmpeg-player@3.0.3/+esm'
console.log(JSMpeg)

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.style.display = "none"
const player = new JSMpeg.Player('ws://localhost:9999', { canvas: canvas });
console.log(player)
const video = document.getElementById('video');
video.srcObject = canvas.captureStream();

fetch("http://localhost:3000/stream").then(body => console.log(body))