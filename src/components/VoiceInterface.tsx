import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
        title: "Spracherkennung aktiv",
        description: "Sprechen Sie Ihren Befehl",
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
          title: "Befehl erkannt",
          description: text,
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setTranscript('Fehler bei der Spracherkennung');
      toast({
        title: "Verarbeitungsfehler",
        description: "Spracherkennung fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-elegant">
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          {!isListening ? (
            <Button
              variant="voice"
              size="voice-large"
              onClick={startListening}
              disabled={isProcessing}
              className="relative group"
            >
              <Mic className="h-8 w-8" />
              <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            </Button>
          ) : (
            <Button
              variant="voice-listening"
              size="voice-large"
              onClick={stopListening}
              className="relative"
            >
              <Square className="h-6 w-6" />
              <div className="absolute inset-0 border-2 border-voice-listening rounded-full animate-ping" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg">
            {isListening 
              ? "Sprechen Sie jetzt..." 
              : isProcessing 
                ? "Verarbeite Befehl..." 
                : "Bereit für Sprachbefehle"
            }
          </h3>
          
          {transcript && (
            <div className="p-3 bg-muted rounded-lg min-h-[60px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground italic">
                "{transcript}"
              </p>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Beispiele:</p>
          <p>"Lege ein Meeting mit Frau Huber am Dienstag um 10 Uhr an"</p>
          <p>"Zeige mir meine Termine für morgen"</p>
          <p>"Lösche das Meeting um 14 Uhr"</p>
        </div>
      </CardContent>
    </Card>
  );
};