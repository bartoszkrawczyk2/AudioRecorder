# AudioRecorder
Recorder for WebAudio API
  
## API
* `new AudioRecorder(audioContext)` - constructor
* `.node` - WebAudio node
* `.start()` - start capturing audio
* `.stop()` - stop capturing audio
* `.exportWavBlob()` returns WAVE file

## Usage
Example usage:
```js
import AudioRecorder from 'audioRecorder';
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
    }, 5000)


}, (e) => {
    console.log('error');
});
```
