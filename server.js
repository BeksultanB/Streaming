const { exec } = require('child_process');
const ffmpegPath = "D:\\ffmpeg-6.0-full_build\\bin\\ffmpeg.exe";  // Замените на путь к вашему исполняемому файлу ffmpeg

function startRecording() {
    const command = `${ffmpegPath} -rtsp_transport tcp -i rtsp://admin:Microret8@80.20.1.64:554 -codec copy -f segment -segment_time 10 -segment_format mpegts -segment_list public/videos/playlist.m3u8 -segment_list_type m3u8 public/videos/video-%03d.ts`;
    const process = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

startRecording();
