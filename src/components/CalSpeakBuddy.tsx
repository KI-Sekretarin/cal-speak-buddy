import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mic, Square, Upload } from 'lucide-react';

const CalSpeakBuddy = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    const audioContext = new AudioContext();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const wavBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // "RIFF" chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // "fmt " sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // SubChunk1Size
    setUint16(1); // AudioFormat (PCM)
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // byte rate
    setUint16(buffer.numberOfChannels * 2); // block align
    setUint16(16); // bits per sample

    // "data" sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // SubChunk2Size

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

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
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const wavBlob = await convertToWav(webmBlob);
        setAudioBlob(wavBlob);
        
        stream.getTracks().forEach(track => track.stop());
        
        toast({
          title: "Aufnahme gespeichert",
          description: "Audio als WAV-Datei bereit zum Hochladen",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioBlob(null);
      
      toast({
        title: "Aufnahme gestartet",
        description: "Sprechen Sie jetzt...",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Mikrofon-Fehler",
        description: "Zugriff auf Mikrofon verweigert",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:5678/webhook-test/audio-to-transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      const result = await response.text();
      setTranscription(result);

      toast({
        title: "Transkription erfolgreich",
        description: "Audio wurde verarbeitet",
      });
      
      setAudioBlob(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload-Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card with Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white">Voice Recorder</h1>
              <p className="text-white/60 text-sm">Aufnahme starten und transkribieren</p>
            </div>

            {/* Recording Interface */}
            <div className="flex flex-col items-center gap-6">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isUploading}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center transform transition-transform group-hover:scale-105 group-active:scale-95">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-75 animate-pulse" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center transform transition-transform group-hover:scale-105">
                    <Square className="h-8 w-8 text-white fill-white" />
                  </div>
                </button>
              )}

              <p className="text-white/80 font-medium text-lg">
                {isRecording 
                  ? "Aufnahme läuft..." 
                  : audioBlob 
                    ? "Aufnahme bereit" 
                    : "Zum Starten klicken"
                }
              </p>
            </div>

            {/* Audio Preview & Upload */}
            {audioBlob && (
              <div className="space-y-4 animate-fade-in">
                <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10">
                  <audio 
                    controls 
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full [&::-webkit-media-controls-panel]:bg-white/10 [&::-webkit-media-controls-panel]:rounded-lg"
                  />
                </div>
                
                <button
                  onClick={uploadAudio}
                  disabled={isUploading}
                  className="w-full relative group overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 transition-transform group-hover:scale-105" />
                  <div className="relative px-6 py-4 flex items-center justify-center gap-2 text-white font-semibold">
                    <Upload className="h-5 w-5" />
                    {isUploading ? "Wird hochgeladen..." : "Transkribieren"}
                  </div>
                </button>
              </div>
            )}

            {/* Transcription Result */}
            {transcription && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Transkription</h3>
                  <button
                    onClick={() => setTranscription('')}
                    className="text-white/60 hover:text-white/80 text-sm transition-colors"
                  >
                    Löschen
                  </button>
                </div>
                <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{transcription}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-white/5 border-t border-white/10">
            <p className="text-white/40 text-xs text-center font-mono">
              kisekretaerin.app.n8n.cloud
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalSpeakBuddy;