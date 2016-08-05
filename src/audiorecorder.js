/*!
 AudioRecorder.js
 Recorder for WebAudio API
 (c) 2015 Bartosz Krawczyk
 bartoszkrawczyk.com
 MIT License
*/
export default class AudioRecorder {
    constructor(audioContext, bufferSize = 2048, inputChannels = 2, outputChannels = 2) {
        this.bufferSize     = bufferSize;
        this.inputChannels  = inputChannels;
        this.outputChannels = outputChannels;

        this['isRecording']     = false;
        this['leftChannel']     = [];
        this['rightChannel']    = [];
        this['recordingLength'] = 0;

        if (audioContext instanceof AudioContext) {
            this['audioContext'] = audioContext;
            this['sampleRate']   = audioContext.sampleRate;

            if (this['audioContext'].createScriptProcessor) {
                this.node = this['audioContext'].createScriptProcessor(
                    this.bufferSize,
                    this.inputChannels,
                    this.outputChannels
                );
            } else if (this['audioContext'].createJavaScriptNode) {
                this.node = this['audioContext'].createJavaScriptNode(
                    this.bufferSize,
                    this.inputChannels,
                    this.outputChannels
                );
            }

            this.node.onaudioprocess = (e) => {
                if (this['isRecording']) {
                    let left  = e.inputBuffer.getChannelData(0),
                        right = e.inputBuffer.getChannelData(1);

                    this['leftChannel'].push(new Float32Array(left));
                    this['rightChannel'].push(new Float32Array(right));
                    
                    this['recordingLength'] += this.bufferSize;
                }
            }
        }
    }

    _mergeBuffers(channelBuffer, recordingLength) {
        let result = new Float32Array(recordingLength),
            offset = 0,
            lng    = channelBuffer.length;
        
        for (let i = 0; i < lng; i++){
            let buffer = channelBuffer[i];
            result.set(buffer, offset);
            offset += buffer.length;
        }

        return result;
    }

    _interleave(leftChannel, rightChannel) {
        let length     = leftChannel.length + rightChannel.length,
            result     = new Float32Array(length),
            inputIndex = 0;

        for (let index = 0; index < length; ) {
            result[index++] = leftChannel[inputIndex];
            result[index++] = rightChannel[inputIndex];
            inputIndex++;
        }

        return result;
    }

    _writeUTFBytes(view, offset, str) {
        let lng = str.length;

        for (let i = 0; i < lng; i++){
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    start() {
        this['isRecording'] = true;
    }

    stop() {
        this['isRecording'] = false;
    }

    exportWaveBlob() {
        let leftBuffer  = this._mergeBuffers(this['leftChannel'],  this['recordingLength']),
            rightBuffer = this._mergeBuffers(this['rightChannel'], this['recordingLength']),
            interleaved = this._interleave(leftBuffer, rightBuffer),
            buffer      = new ArrayBuffer(44 + interleaved.length * 2),
            view        = new DataView(buffer);
         
        this._writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + interleaved.length * 2, true);
        this._writeUTFBytes(view, 8, 'WAVE');
        
        this._writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);

        view.setUint16(22, 2, true);
        view.setUint32(24, this['sampleRate'], true);
        view.setUint32(28, this['sampleRate'] * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);

        this._writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);
         
        let lng    = interleaved.length,
            index  = 44,
            volume = 1;

        for (let i = 0; i < lng; i++){
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

        return new Blob ( [ view ], { type : 'audio/wav' } );
    }
}