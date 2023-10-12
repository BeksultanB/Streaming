const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const ffmpegPath = "D:\\ffmpeg-6.0-full_build\\bin\\ffmpeg.exe";  // Замените на путь к вашему исполняемому файлу ffmpeg

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
    startRecording();
});

function startRecording() {
    const command = `${ffmpegPath} -rtsp_transport tcp -i rtsp://admin:Microret8@80.20.1.64:554 -codec copy -f segment -segment_time 1 -segment_format mpegts -segment_list_flags live -segment_list_size 1 -segment_list public/videos/playlist.m3u8 -segment_list_type m3u8 public/videos/video-%03d.ts`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}
