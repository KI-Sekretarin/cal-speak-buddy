import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { RotateCcw, Mic, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { executeVoiceCommand } from '@/services/whisperService';
import { useVoice } from '@/contexts/VoiceContext';

interface ActivityLog {
  id: string;
  voice_command: string | null;
  action: string;
  entity_type: string;
  details: any;
  created_at: string;
}

export default function VoiceCommandHistory() {
  const { user } = useAuth();
  const { googleToken, setEvents, setLastUpdated } = useVoice();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_id', user.id)
        .eq('action', 'voice_command')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      toast.error('Fehler beim Laden des Verlaufs');
    } finally {
      setIsLoading(false);
    }
  };

  const replayCommand = async (log: ActivityLog) => {
    if (!log.voice_command) return;
    setReplayingId(log.id);
    try {
      const data = await executeVoiceCommand(log.voice_command, googleToken, false);
      if (data?.status === 'success') {
        toast.success('Befehl wiederholt: ' + data.message);
        if (data.intent === 'list_events' && Array.isArray(data.data)) {
          setEvents(data.data);
          setLastUpdated(new Date());
        }
      } else {
        toast.error('Befehl fehlgeschlagen: ' + (data?.message || 'Unbekannter Fehler'));
      }
    } catch {
      toast.error('Server nicht erreichbar');
    } finally {
      setReplayingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Clock className="h-5 w-5 animate-spin mr-2" />
        Lade Verlauf...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-3">
        <div className="p-4 rounded-full bg-muted/50">
          <Mic className="h-10 w-10 opacity-30" />
        </div>
        <p className="font-medium">Noch keine Sprachbefehle</p>
        <p className="text-sm">Hier erscheinen Ihre ausgeführten Sprachbefehle</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Mic className="h-4 w-4 text-primary shrink-0" />
              <p className="font-medium truncate">{log.voice_command || '(kein Text)'}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
              {log.details?.intent && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {log.details.intent}
                </Badge>
              )}
            </div>
            {log.details?.summary && (
              <p className="text-sm text-muted-foreground mt-1 truncate">{log.details.summary}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={!log.voice_command || replayingId === log.id}
            onClick={() => replayCommand(log)}
            className="shrink-0 gap-1.5"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${replayingId === log.id ? 'animate-spin' : ''}`} />
            Wiederholen
          </Button>
        </div>
      ))}
    </div>
  );
}
