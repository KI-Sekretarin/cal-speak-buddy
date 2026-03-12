import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, Square } from 'lucide-react';

interface VoiceInterfaceProps {
  onVoiceCommand: (command: string) => void;
  isProcessing: boolean;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onVoiceCommand,
  isProcessing
}) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      setTranscript('Ich höre zu...');

      toast({
        title: 'Spracherkennung aktiv',
        description: 'Sprechen Sie jetzt Ihren Befehl',
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Mikrofon-Fehler',
        description: 'Zugriff auf Mikrofon verweigert',
        variant: 'destructive',
      });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setTranscript('Verarbeite...');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch('http://localhost:9000/transcribe-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper server error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.text ?? '';
      setTranscript(text);

      if (text.trim()) {
        onVoiceCommand(text);
        toast({
          title: 'Befehl erkannt',
          description: text,
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setTranscript('Fehler bei der Spracherkennung');
      toast({
        title: 'Verarbeitungsfehler',
        description: 'Lokale Spracherkennung fehlgeschlagen. Ist der Whisper-Server gestartet?',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-elegant">
      <CardHeader>
        <CardTitle>Sprachsteuerung</CardTitle>
        <CardDescription>
          Steuern Sie das Kalender-Interface per Sprachbefehl — drücken Sie auf das Mikrofon und sprechen Sie.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 text-center">
        <div className="flex flex-col items-center justify-center space-y-6 mb-4">
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-1 h-12">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-primary rounded-full"
                      animate={{
                        height: [8, 32, 12, 40, 16, 24, 10][(i + Math.floor(Math.random() * 7)) % 7],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isListening ? (
              <Button
                variant="voice"
                size="voice-large"
                onClick={startListening}
                disabled={isProcessing}
                aria-pressed={isListening}
                aria-label="Sprachaufnahme starten"
                className="relative z-10"
              >
                <Mic className="h-6 w-6" />
              </Button>
            ) : (
              <Button
                variant="voice-listening"
                size="voice-large"
                onClick={stopListening}
                aria-pressed={isListening}
                aria-label="Sprachaufnahme stoppen"
                className="relative z-10"
              >
                <Square className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-base font-medium">
            {isListening
              ? 'Sprechen Sie jetzt...'
              : isProcessing
                ? 'Verarbeite Befehl...'
                : 'Bereit für Sprachbefehle'}
          </h4>

          <div
            className="mt-3 p-3 bg-muted rounded-lg min-h-[60px] flex items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-muted-foreground italic">{transcript ? `"${transcript}"` : '—'}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2">
        <div className="w-full text-sm text-muted-foreground">
          <p className="font-medium mb-1">Beispiele</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Lege ein Meeting mit Frau Huber am Dienstag um 10 Uhr an</li>
            <li>Zeige mir meine Termine für morgen</li>
            <li>Lösche das Meeting um 14 Uhr</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};