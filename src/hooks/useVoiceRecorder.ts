import { useState, useRef } from 'react';

interface UseVoiceRecorderResult {
  isRecording: boolean;
  audioBlob: Blob | null;
  startRecording: (existingStream?: MediaStream | null) => Promise<void>;
  stopRecording: () => void;
  clearAudio: () => void;
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let pos = 0;
  let offset = 0;

  const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
  const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

  setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
  setUint32(0x20746d66); setUint32(16); setUint16(1);
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
  setUint16(buffer.numberOfChannels * 2); setUint16(16);
  setUint32(0x61746164); setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}

async function convertToWav(webmBlob: Blob): Promise<Blob> {
  const audioContext = new AudioContext();
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const wavBuffer = audioBufferToWav(audioBuffer);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

export function useVoiceRecorder(
  onBlobReady: (blob: Blob) => void
): UseVoiceRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async (existingStream?: MediaStream | null) => {
    const stream = existingStream?.active
      ? existingStream
      : await navigator.mediaDevices.getUserMedia({
          audio: { sampleRate: 44100, channelCount: 1, echoCancellation: true, noiseSuppression: true },
        });

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const wavBlob = await convertToWav(webmBlob);
      setAudioBlob(wavBlob);
      onBlobReady(wavBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setAudioBlob(null);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => setAudioBlob(null);

  return { isRecording, audioBlob, startRecording, stopRecording, clearAudio };
}
