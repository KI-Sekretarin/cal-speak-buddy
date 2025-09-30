import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Volume2, Square } from 'lucide-react';

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
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Send to Supabase Edge Function for speech-to-text
      const response = await fetch(`https://bqwfcixtbnodxuoixxkk.supabase.co/functions/v1/speech-to-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzMzODgsImV4cCI6MjA3NDQ0OTM4OH0._VAHEgxoMlLCIjxuXsiUpcplXxdbnvIqJYkyjlXHBkQ`
        },
        body: JSON.stringify({ audio: base64Audio }),
      });

      if (!response.ok) {
        throw new Error('Speech-to-text failed');
      }

      const { text } = await response.json();
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