# AudioRecorder
Recorder for WebAudio API

## Install

`npm install audiorecorder --save`
  
## API
* `new AudioRecorder(audioContext)` - initialize
* `.node` - WebAudio node
* `.start()` - start capturing audio
* `.stop()` - stop capturing audio
* `.exportWaveBlob()` returns WAVE file

## Usage
Example usage (record 5 seconds of user stream):
```js
import AudioRecorder from 'audiorecorder';
import { saveAs } from 'filesaver.js';

let ctx = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

navigator.getUserMedia({ audio: true }, (e) => {
    let audioInput    = ctx.createMediaStreamSource(e),
        audioRecorder = new AudioRecorder(ctx);

    audioInput.connect(audioRecorder.node);
    audioRecorder.node.connect(ctx.destination);

    audioRecorder.start();

    setTimeout(() => {
        audioRecorder.stop();

        let recorded = audioRecorder.exportWavBlob();
        saveAs(recorded, 'recorded.wav');
    }, 5000);


}, (e) => {
    console.log('error');
});
```
## License

MIT