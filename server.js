const Stream = require('node-rtsp-stream');
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
let stream = {};

const corsOptions = {
    origin: '*', // Замените на URL вашего фронтенд-приложения
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use('/', cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/start_stream/:cameraId', (req, res) => {
    const cameraId = req.params.cameraId;

    // Теперь вы можете использовать `cameraId` для создания объекта Stream
    if (!stream[cameraId]) {
        stream[cameraId] = new Stream({
            name: 'name',
            streamUrl: `rtsp://admin:Microret8@80.20.1.${cameraId}:554`,
            wsPort: `7${cameraId}`,
            ffmpegOptions: {
                '-stats': '',
                '-r': 30,
                '-maxrate': '4000k',
            },
            http: {
                port: 8080,
                mediaroot: './media',
                allow_origin: '*',
                bind: '0.0.0.0', // прослушивание всех IP-адресов
            },
        });
    }
    // Далее можно выполнять необходимые действия с объектом `stream`
    res.send(`Starting stream for camera ${cameraId}`);
});
app.get('/stop_stream/:cameraId', (req, res) => {
    const cameraId = req.params.cameraId;
    stream[cameraId].stop();
    delete stream[cameraId]
    res.send(`Stopped stream for camera ${cameraId}`);
});

const server = app.listen(81, () => {
    console.log('Server is running on port 81');
});
