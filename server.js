const Stream = require('node-rtsp-stream');
const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
let stream = {};
const PORT = prompt("Введите порт", 82);

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use('/', cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/start_stream/:cameraId', (req, res) => {
  const cameraId = +req.params.cameraId;
  let PORT;
  if (cameraId < 10) PORT = "700" + cameraId;
  else if (cameraId < 100) PORT = "70" + cameraId;
  else PORT = "7" + cameraId;

  if (!stream[cameraId]) {
    stream[cameraId] = new Stream({
      name: 'name',
      streamUrl: `rtsp://admin:Microret8@80.20.1.${cameraId}:554`,
      wsPort: PORT,
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
  res.send(`Starting stream for camera ${cameraId}`);
});
app.get('/stop_stream/:cameraId', (req, res) => {
  const cameraId = req.params.cameraId;
  if (stream[cameraId]) {
    stream[cameraId].stop();
    delete stream[cameraId];
    res.send(`Stopped stream for camera ${cameraId}`);
  } else {
    res.send(`Camera with ${cameraId} isn't exist`);
  }

});
const responseSent = {};

app.post('/get_frame', (req, res) => {
  const rtspURL = req.body["rtsp_url"];
  console.log(rtspURL);

  const ffmpegProcess = spawn('ffmpeg', [
    '-rtsp_transport', 'tcp',
    '-i', `rtsp://${rtspURL}`,
    '-frames:v', '1', // Получить только один кадр
    '-f', 'image2', // Формат изображения
    'pipe:1', // Вывод в pipe
    '-err_detect', 'explode', // Прервать выполнение при ошибке
    '-f', 'json', // Формат вывода ошибок в JSON
  ]);

  ffmpegProcess.stdout.on('data', (data) => {
    if (!responseSent[rtspURL]) {
      console.log("Trying to send second response")
      res.set('Content-Type', 'image/jpeg');
      res.status(200).send(data);
      ffmpegProcess.kill('SIGINT');
      clearTimeout(ffmpegTimeout);
      responseSent[rtspURL] = true;
      console.log("Файл отдан");
    }
  });
  ffmpegProcess.stderr.on('data', (data) => {
    if ((data + "").includes("Server returned 401 Unauthorized (authorization failed)")) {
      res.status(401).json({ error: 'Problems with authorization' });
      ffmpegProcess.kill('SIGINT');
      clearTimeout(ffmpegTimeout);
    }
    else if ((data + "").includes("Invalid argument")) {
      res.status(400).json({ error: "Received URL isn't valid" });
      ffmpegProcess.kill('SIGINT');
      clearTimeout(ffmpegTimeout);
    }
    console.log(data + "")
  });

  ffmpegProcess.on('close', () => {
    clearTimeout(ffmpegTimeout);
    console.log('Процесс ffmpeg get frame завершился');
    responseSent[rtspURL] = false;
  });
  const ffmpegTimeout = setTimeout(() => {
    ffmpegProcess.kill('SIGINT');
    res.status(500).json({ error: 'Timeout exceeded' }); // Отправляем ответ с ошибкой таймаута
  }, 10000);
});
const server = app.listen(PORT, () => {
  console.log('Server is running on port' + PORT);
});
