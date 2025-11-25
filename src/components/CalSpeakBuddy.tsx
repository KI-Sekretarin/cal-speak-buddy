import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mic, Square, Upload, Check, X, Edit2, Send, Settings } from 'lucide-react';

const CalSpeakBuddy = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [editedTranscription, setEditedTranscription] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmationPending, setIsConfirmationPending] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [commandResponse, setCommandResponse] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('google_calendar_token');
    if (token) {
      setGoogleToken(token);
    }
  }, []);

  // n8n Webhook URL - kann später in Settings konfigurierbar gemacht werden
  const WEBHOOK_URL = 'https://n8n-service-jm5f.onrender.com/webhook-test/audio-to-transcribe';

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
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"

    // "fmt " sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);

    // "data" sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

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
      setTranscription('');
      setEditedTranscription('');
      setIsConfirmationPending(false);

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

      const response = await fetch('http://localhost:9000/transcribe-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transkription fehlgeschlagen: ${response.statusText}`);
      }

      const result = await response.json();

      setTranscription(result.text);
      setEditedTranscription(result.text);
      setIsConfirmationPending(true);
      setIsEditing(false);

      toast({
        title: "Transkription erfolgreich",
        description: `Audio transkribiert (${result.duration?.toFixed(1)}s)`,
      });

      setAudioBlob(null);
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transkriptions-Fehler",
        description: error instanceof Error ? error.message : "Whisper-Server nicht erreichbar. Läuft er auf Port 9000?",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const confirmCommand = async () => {
    setIsProcessingCommand(true);
    try {
      // Send transcript to local AI Agent
      const response = await fetch('http://localhost:9000/process-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editedTranscription || transcription, // Use edited text if available
          auth_token: googleToken, // Send the user's token
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      setCommandResponse(result.message);
      setIsConfirmationPending(false);

      toast({
        title: "Befehl ausgeführt",
        description: result.message,
      });
    } catch (error) {
      console.error('Command error:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsProcessingCommand(false);
    }
  };

  const discardTranscription = () => {
    setTranscription('');
    setEditedTranscription('');
    setIsConfirmationPending(false);
    setIsEditing(false);
    toast({
      title: "Verworfen",
      description: "Transkript wurde gelöscht",
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Mic className="h-5 w-5 text-primary" />
          </div>
          Sprachsteuerung
        </h2>
        <div className="flex items-center gap-2">
          <Link to="/settings">
            <Button variant="ghost" size="icon" title="Einstellungen">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Recording */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border relative">

          <div className="w-full max-w-md space-y-8 flex flex-col items-center">
            {/* Recording Button */}
            <div className="relative">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isUploading || isProcessingCommand}
                  className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Aufnahme starten"
                >
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-primary via-primary to-accent rounded-full flex items-center justify-center transform transition-all group-hover:scale-110 group-active:scale-95 shadow-2xl">
                    <Mic className="h-16 w-16 text-primary-foreground" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="relative group"
                  aria-label="Aufnahme stoppen"
                >
                  <div className="absolute inset-0 bg-destructive/30 rounded-full blur-2xl opacity-75 animate-pulse" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-destructive to-destructive/80 rounded-full flex items-center justify-center transform transition-all group-hover:scale-110 shadow-2xl animate-pulse">
                    <Square className="h-14 w-14 text-destructive-foreground fill-destructive-foreground" />
                  </div>
                </button>
              )}
            </div>

            {/* Status Text */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-foreground">
                {isRecording
                  ? "🎙️ Aufnahme läuft..."
                  : audioBlob
                    ? "✓ Aufnahme bereit"
                    : "Bereit zur Aufnahme"
                }
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                {isRecording
                  ? "Sprechen Sie jetzt deutlich ins Mikrofon"
                  : audioBlob
                    ? "Ihre Aufnahme wurde erfolgreich gespeichert"
                    : "Klicken Sie auf das Mikrofon, um eine Sprachaufnahme zu starten"
                }
              </p>
            </div>

            {/* Audio Preview & Upload */}
            {audioBlob && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-2xl p-6 border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
                  <audio
                    controls
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={uploadAudio}
                  disabled={isUploading}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300"
                >
                  <Upload className="h-6 w-6 mr-2" />
                  {isUploading ? "Wird transkribiert..." : "Jetzt transkribieren"}
                </Button>
              </div>
            )}
            <p className="text-muted-foreground text-sm text-center font-mono">
              🎤 Lokale Whisper-Transkription (Port 9000) → 🔗 n8n Webhook Integration
            </p>
          </div>
        </div>

        {/* Right Panel: Transcription & Actions */}
        <div className="flex-1 p-6 bg-card/30 flex flex-col overflow-hidden">
          {isConfirmationPending ? (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Edit2 className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Transkript bearbeiten</h3>
                    <p className="text-muted-foreground text-sm">Überprüfen und anpassen vor dem Senden</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  {isEditing ? "Vorschau" : "Bearbeiten"}
                </Button>
              </div>

              {/* Editable Transcript */}
              <div className="flex-1 mb-6 min-h-0">
                {isEditing ? (
                  <Textarea
                    value={editedTranscription}
                    onChange={(e) => setEditedTranscription(e.target.value)}
                    className="h-full text-lg p-6 rounded-2xl border-2 border-primary/20 bg-card resize-none focus:border-accent/50 transition-colors"
                    placeholder="Ihr Transkript erscheint hier..."
                  />
                ) : (
                  <div className="h-full rounded-2xl p-6 border-2 border-primary/20 bg-card overflow-y-auto">
                    <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                      {editedTranscription || "Kein Text vorhanden"}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <Button
                  onClick={discardTranscription}
                  disabled={isProcessingCommand}
                  variant="outline"
                  size="lg"
                  className="h-14 text-lg font-semibold border-2 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all"
                >
                  <X className="h-5 w-5 mr-2" />
                  Verwerfen
                </Button>

                <Button
                  onClick={confirmCommand}
                  disabled={isProcessingCommand || (!editedTranscription && !transcription)}
                  className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessingCommand ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Verarbeite...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Befehl ausführen
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground animate-in fade-in duration-700">
              <div className="p-6 rounded-full bg-muted/50">
                <Edit2 className="h-12 w-12 opacity-20" />
              </div>
              <p>Transkript erscheint hier nach der Aufnahme</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalSpeakBuddy;
