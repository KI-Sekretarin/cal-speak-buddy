import React, { useState, useRef, useEffect } from 'react';
import { useVoice } from '@/contexts/VoiceContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mic, Square, Upload, Check, X, Edit2, Send, Settings, Clock, Calendar, Volume2, Sparkles } from 'lucide-react';
import { useVAD } from '@/hooks/useVAD';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const { events, setEvents, lastUpdated, setLastUpdated } = useVoice();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [pendingCommandText, setPendingCommandText] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isNaturalMode, setIsNaturalMode] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // VAD Implementation
  const { isSpeaking, startVAD, stopVAD, volume } = useVAD({
    minVolume: 0.03, // Slightly more sensitive
    silenceDelay: 1000, // Very fast response for high-performance usage
    onSpeechStart: () => {
      if (isNaturalMode && !isRecording && !isProcessingCommand && !isSynthesizing) {
        console.log("🗣️ Speech started - Auto-recording...");
        startRecording(true);
      }
    },
    onSpeechEnd: () => {
      if (isNaturalMode && isRecording) {
        console.log("🤫 Silence detected - Stopping recording...");
        stopRecording();
      }
    }
  });

  // Effect to manage VAD based on mode
  useEffect(() => {
    if (isNaturalMode) {
      // Create a persistent stream for VAD listening
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        streamRef.current = stream;
        startVAD(stream);
        toast({
          title: "Natural Mode Aktiv",
          description: "Ich höre zu. Sprechen Sie einfach drauf los!",
          className: "bg-green-500/10 border-green-500/50"
        });
      }).catch(err => {
        console.error("Failed to start VAD stream", err);
        setIsNaturalMode(false);
        toast({ title: "Fehler", description: "Mikrofonzugriff fehlgeschlagen", variant: "destructive" });
      });
    } else {
      stopVAD();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isNaturalMode, startVAD, stopVAD]);

  const speakText = (text: string) => {
    if (!text) return;
    setIsSynthesizing(true);

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 1.1; // Slightly faster for more natural flow
    utterance.pitch = 1.0;

    // Try to find a better German voice
    const voices = window.speechSynthesis.getVoices();
    const germanVoices = voices.filter(v => v.lang.startsWith('de'));

    // Priority: Google Deutsch -> Anna (Mac) -> Any German
    const preferredVoice = germanVoices.find(v => v.name.includes("Google") || v.name.includes("Anna")) || germanVoices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log("Using Voice:", preferredVoice.name);
    }

    utterance.onend = () => {
      setIsSynthesizing(false);
    };

    utterance.onerror = () => {
      setIsSynthesizing(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Load token from localStorage on mount
  // Load token from localStorage on mount
  useEffect(() => {
    const loadToken = () => {
      const token = localStorage.getItem('google_calendar_token');
      if (token) {
        setGoogleToken(token);
      }
    };

    loadToken();

    // Listen for token updates from settings page
    window.addEventListener('google_token_updated', loadToken);

    // Also listen for storage events (if changed in another tab)
    window.addEventListener('storage', loadToken);

    return () => {
      window.removeEventListener('google_token_updated', loadToken);
      window.removeEventListener('storage', loadToken);
    };
  }, []);

  // Countdown Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const futureEvents = events
        .filter(e => {
          const start = e.start.dateTime ? new Date(e.start.dateTime) : new Date(e.start.date);
          return start > now;
        })
        .sort((a, b) => {
          const startA = a.start.dateTime ? new Date(a.start.dateTime) : new Date(a.start.date);
          const startB = b.start.dateTime ? new Date(b.start.dateTime) : new Date(b.start.date);
          return startA.getTime() - startB.getTime();
        });

      if (futureEvents.length > 0) {
        const next = futureEvents[0];
        const start = next.start.dateTime ? new Date(next.start.dateTime) : new Date(next.start.date);
        const diff = start.getTime() - now.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining("");
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [events]);

  const getNextEvent = () => {
    const now = new Date();
    const futureEvents = events
      .filter(e => {
        const start = e.start.dateTime ? new Date(e.start.dateTime) : new Date(e.start.date);
        return start > now;
      })
      .sort((a, b) => {
        const startA = a.start.dateTime ? new Date(a.start.dateTime) : new Date(a.start.date);
        const startB = b.start.dateTime ? new Date(b.start.dateTime) : new Date(b.start.date);
        return startA.getTime() - startB.getTime();
      });
    return futureEvents[0] || null;
  };

  // n8n Webhook URL removed
  // const WEBHOOK_URL = '...';

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

  const startRecording = async (autoStart = false) => {
    try {
      // If we already have a stream from VAD, use it (clone it?), otherwise get new one
      // Actually standard mediaRecorder needs its own stream or we reuse the key one.
      // To be safe and simple, let's get a fresh stream or use the existing one if active.
      let stream = streamRef.current;

      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          }
        });
      }

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

        // Do NOT stop tracks if in Natural Mode, we need them for VAD!
        if (!isNaturalMode && stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        if (isNaturalMode) {
          // Auto-Upload in Natural Mode
          uploadAudio(wavBlob);
        } else {
          toast({
            title: "Aufnahme gespeichert",
            description: "Audio als WAV-Datei bereit zum Hochladen",
          });
        }
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

  // Modified uploadAudio to accept blob argument for auto-upload
  const uploadAudio = async (blobToUpload?: Blob) => {
    const blob = blobToUpload || audioBlob;
    if (!blob) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'recording.wav');

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

      if (isNaturalMode) {
        // Auto-Execute in Natural Mode
        if (result.text.trim().length > 2) { // Minimal length check
          executeCommand(result.text, false); // FALSE = NO DRY RUN = IMMEDIATE EXECUTION
        } else {
          toast({ title: "Ignoriert", description: "Keine Sprache erkannt." });
        }
      } else {
        setIsConfirmationPending(true);
        setIsEditing(false);
      }

      // Cleanup
      if (!isNaturalMode) {
        toast({
          title: "Transkription erfolgreich",
          description: `Audio transkribiert (${result.duration?.toFixed(1)}s)`,
        });
      }

      setAudioBlob(null);
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transkriptions-Fehler",
        description: error instanceof TypeError && error.message.includes("Failed to fetch")
          ? "Server nicht erreichbar. Startet er noch (großes Modell)?"
          : (error instanceof Error ? error.message : "Whisper-Server nicht erreichbar."),
        variant: "destructive",
      });
      if (isNaturalMode) speakText("Fehler bei der Transkription.");
    } finally {
      setIsUploading(false);
    }
  };

  const executeCommand = async (text: string, dryRun: boolean, silent: boolean = false) => {
    if (!text) return;

    setIsProcessingCommand(true);
    setCommandResponse(null);
    if (!dryRun && !silent) setEvents([]);

    if (dryRun) {
      setPendingCommandText(text);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      console.log(`Sende Befehl an Backend (DryRun: ${dryRun}):`, text);

      const response = await fetch('http://localhost:9000/process-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          auth_token: googleToken || localStorage.getItem('google_calendar_token'),
          dry_run: dryRun
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend Antwort:", data);

      if (data.status === 'confirmation_required') {
        if (isNaturalMode) {
          // In natural mode, we speak the warning and listen for confirmation
          speakText(data.message + " Bitte bestätigen mit Ja oder Nein.");
          // Ideally we would switch to a specific "confirmation listening mode" here
          // For now, let's fall back to manual dialog so they see the importance
          setConfirmationMessage(data.message);
          setShowConfirmationDialog(true);
        } else {
          setConfirmationMessage(data.message);
          setShowConfirmationDialog(true);
        }
        return;
      }

      if (data.status === 'success') {
        if (!silent) setCommandResponse(data.message);

        // Play TTS Success Message
        if (isNaturalMode && data.message) {
          // Clean message for TTS if needed (remove URLs etc) - Backend handles this better but frontend can strip HTML
          const cleanMsg = data.voice_message || data.message.replace(/<[^>]*>?/gm, '');
          speakText(cleanMsg);
        }

        if (data.intent === 'list_events' && Array.isArray(data.data)) {
          setEvents(data.data);
          setLastUpdated(new Date());
          if (!silent) {
            toast({
              title: "Termine geladen",
              description: `${data.data.length} Termine gefunden.`,
            });
          }
        } else {
          if (!silent) {
            toast({
              title: "Erfolg!",
              description: data.message,
            });
          }
        }

        // Reset UI after short delay
        if (!silent) {
          setTimeout(() => {
            setIsConfirmationPending(false);
            setTranscription('');
            setEditedTranscription('');
            setAudioBlob(null);
            audioChunksRef.current = [];
            setIsEditing(false);
          }, 2000);
        }
      } else {
        setCommandResponse(`Fehler: ${data.message}`);
        if (isNaturalMode) speakText("Fehler: " + data.message);
        toast({
          title: "Fehler",
          description: data.message,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Fehler beim Ausführen des Befehls:', error);
      let errorMessage = 'Fehler bei der Kommunikation mit dem Server.';

      if (error.name === 'AbortError') {
        errorMessage = 'Zeitüberschreitung: Der Server antwortet nicht rechtzeitig.';
      }

      setCommandResponse(errorMessage);
      if (isNaturalMode) speakText("Ich konnte den Server nicht erreichen.");
      toast({
        title: "Verbindungsfehler",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingCommand(false);
      clearTimeout(timeoutId);
    }
  };

  const confirmCommand = () => executeCommand(editedTranscription || transcription, true);

  const executeConfirmedCommand = () => {
    setShowConfirmationDialog(false);
    executeCommand(pendingCommandText, false);
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
          <div className={`p-2 rounded-full transition-colors ${isNaturalMode ? 'bg-green-500/20' : 'bg-primary/10'}`}>
            {isNaturalMode ? <Sparkles className="h-5 w-5 text-green-600" /> : <Mic className="h-5 w-5 text-primary" />}
          </div>
          Sprachsteuerung {isNaturalMode && <span className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full">Natural Mode</span>}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNaturalMode(!isNaturalMode)}
            className={isNaturalMode ? "border-green-500 text-green-600 bg-green-50" : ""}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isNaturalMode ? 'Natural Mode Aus' : 'Natural Mode Ein'}
          </Button>
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
                  onClick={() => startRecording(false)}
                  disabled={isUploading || isProcessingCommand || (isNaturalMode && isSpeaking)}
                  className={`relative group disabled:opacity-50 disabled:cursor-not-allowed ${isNaturalMode ? 'cursor-default' : ''}`}
                  aria-label="Aufnahme starten"
                >
                  <div className={`absolute inset-0 rounded-full blur-2xl opacity-75 transition-opacity animate-pulse ${isNaturalMode ? 'bg-green-500/30' : 'bg-primary/30'}`} />
                  <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transform transition-all shadow-2xl ${isNaturalMode
                    ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 scale-105'
                    : 'bg-gradient-to-br from-primary via-primary to-accent group-hover:scale-110 group-active:scale-95'
                    }`}>
                    {isNaturalMode ? (
                      <div className="flex flex-col items-center">
                        <Mic className="h-12 w-12 text-white mb-1" />
                        <span className="text-[10px] text-white/80 font-mono uppercase tracking-widest">{isSpeaking ? 'HÖRE ZU...' : 'BEREIT'}</span>
                      </div>
                    ) : (
                      <Mic className="h-16 w-16 text-primary-foreground" />
                    )}
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
                    {isNaturalMode ? (
                      <div className="flex flex-col items-center">
                        <Volume2 className="h-10 w-10 text-white mb-1 animate-bounce" />
                        <span className="text-[10px] text-white/80 font-mono">AUFNAHME</span>
                      </div>
                    ) : (
                      <Square className="h-14 w-14 text-destructive-foreground fill-destructive-foreground" />
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* Status Text */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-foreground">
                {isRecording
                  ? "🎙️ Aufnahme läuft..."
                  : isNaturalMode
                    ? isSpeaking ? "👂 Ich höre..." : "Waiting for speech..."
                    : audioBlob
                      ? "✓ Aufnahme bereit"
                      : "Bereit zur Aufnahme"
                }
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                {isRecording
                  ? "Sprechen Sie jetzt deutlich ins Mikrofon"
                  : isNaturalMode
                    ? "Starten Sie einfach zu sprechen. Ich höre automatisch zu."
                    : audioBlob
                      ? "Ihre Aufnahme wurde erfolgreich gespeichert"
                      : "Klicken Sie auf das Mikrofon, um eine Sprachaufnahme zu starten"
                }
              </p>
            </div>

            {/* Audio Preview & Upload (Only visible in manual mode) */}
            {audioBlob && !isNaturalMode && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-2xl p-6 border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
                  <audio
                    controls
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={() => uploadAudio()}
                  disabled={isUploading}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300"
                >
                  <Upload className="h-6 w-6 mr-2" />
                  {isUploading ? "Wird transkribiert..." : "Jetzt transkribieren"}
                </Button>
              </div>
            )}

            {isNaturalMode && (transcription || isProcessingCommand) && (
              <div className="w-full p-4 bg-muted/50 rounded-xl animate-in slide-in-from-bottom-2">
                <p className="text-sm font-mono text-muted-foreground mb-1">{isProcessingCommand ? 'VERARBEITE...' : 'ERKANNT:'}</p>
                <p className="text-lg font-medium">{transcription || "..."}</p>
              </div>
            )}

            {!isNaturalMode && (
              <p className="text-muted-foreground text-sm text-center font-mono">
                🎤 Lokale Whisper-Transkription (Port 9000)
              </p>
            )}

            {/* Quick Actions (Only Manual Mode) */}
            {!isNaturalMode && (
              <div className="w-full pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">Quick Actions</h3>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 hover:bg-primary/5 hover:border-primary/30" onClick={() => executeCommand("Zeige meine Termine für heute", false)}>
                    <span className="text-xl">📅</span>
                    <span className="text-xs font-medium">Heute</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 hover:bg-primary/5 hover:border-primary/30" onClick={() => executeCommand("Zeige meine Termine für morgen", false)}>
                    <span className="text-xl">⏭️</span>
                    <span className="text-xs font-medium">Morgen</span>
                  </Button>

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Transcription & Actions & Events */}
        <div className="flex-1 p-6 bg-card/30 flex flex-col overflow-hidden">

          {/* Next Meeting Widget */}
          {getNextEvent() && !isConfirmationPending && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Clock className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Nächstes Meeting</h3>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{getNextEvent().summary || "Kein Titel"}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-mono font-medium text-foreground">
                        {new Date(getNextEvent().start.dateTime || getNextEvent().start.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {timeRemaining && (
                      <span className="text-sm font-medium text-primary animate-pulse">
                        in {timeRemaining}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events List View */}
          {events.length > 0 ? (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  Deine Termine
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setEvents([])}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {events.map((event, index) => {
                  const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
                  const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
                  const isAllDay = !event.start.dateTime;

                  return (
                    <div key={index} className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{event.summary || "Kein Titel"}</h4>
                          <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>
                              {start.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                              {!isAllDay && ` • ${start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
                              {isAllDay && " • Ganztägig"}
                            </span>
                          </div>
                        </div>
                        {event.htmlLink && (
                          <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                            Öffnen
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isConfirmationPending ? (
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

      <AlertDialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktion bestätigen</AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-foreground">
              {confirmationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={executeConfirmedCommand} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Bestätigen & Ausführen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalSpeakBuddy;
