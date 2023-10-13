const Stream = require('node-rtsp-stream');
const path = require('path');
const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/stream', (req, res) => {
    res.status = "200"
    res.send()
});
const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
const stream = new Stream({
    name: 'name',
    streamUrl: 'rtsp://admin:Microret8@80.20.1.64:554',
    wsPort: 9999,
    ffmpegOptions: {
        '-stats': '',
        '-r': 30
    }
});
