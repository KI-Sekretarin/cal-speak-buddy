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

      const response = await fetch('https://kisekretaerin.app.n8n.cloud/webhook-test/f0448e5d-e777-4286-ab19-8afee6bb5cfc', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      toast({
        title: "Upload erfolgreich",
        description: "Audio wurde zum Webhook gesendet",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Audio-Recorder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            {!isRecording ? (
              <Button
                variant="voice"
                size="voice-large"
                onClick={startRecording}
                disabled={isUploading}
                className="relative group"
              >
                <Mic className="h-8 w-8" />
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            ) : (
              <Button
                variant="voice-listening"
                size="voice-large"
                onClick={stopRecording}
                className="relative"
              >
                <Square className="h-6 w-6" />
                <div className="absolute inset-0 border-2 border-voice-listening rounded-full animate-ping" />
              </Button>
            )}

            <p className="text-center font-semibold">
              {isRecording 
                ? "Aufnahme läuft..." 
                : audioBlob 
                  ? "Aufnahme bereit" 
                  : "Klicken Sie, um aufzunehmen"
              }
            </p>
          </div>

          {audioBlob && (
            <div className="space-y-4">
              <audio 
                controls 
                src={URL.createObjectURL(audioBlob)}
                className="w-full"
              />
              
              <Button
                onClick={uploadAudio}
                disabled={isUploading}
                className="w-full"
                size="lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                {isUploading ? "Wird hochgeladen..." : "Zum Webhook hochladen"}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center space-y-1 pt-4 border-t">
            <p>Webhook URL:</p>
            <p className="font-mono text-[10px] break-all">
              kisekretaerin.app.n8n.cloud/webhook-test/...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalSpeakBuddy;