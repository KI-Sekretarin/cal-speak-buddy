import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          const base64 = result.split(',')[1];
          if (base64) {
            resolve(base64);
            return;
          }
        }
        reject(new Error('Audio konnte nicht konvertiert werden'));
      };
      reader.onerror = () => reject(new Error('Audio konnte nicht gelesen werden'));
      reader.readAsDataURL(blob);
    });

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
        const base64Audio = await blobToBase64(audioBlob);

        const { data, error } = await supabase.functions.invoke<{ text: string }>('speech-to-text', {
          body: { audio: base64Audio },
        });

        if (error) {
          throw error;
        }

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
          description: 'Spracherkennung fehlgeschlagen',
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
          <div className="flex justify-center mb-4">
            {!isListening ? (
              <Button
                variant="voice"
                size="voice-large"
                onClick={startListening}
                disabled={isProcessing}
                aria-pressed={isListening}
                aria-label="Sprachaufnahme starten"
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
              >
                <Square className="h-5 w-5" />
              </Button>
            )}
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