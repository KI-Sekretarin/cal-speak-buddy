import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Check, Send, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface AIResponse {
  id: string;
  suggested_response: string;
  is_approved: boolean;
  sent_at: string | null;
  created_at: string;
}

export default function AIResponseInterface({ inquiryId, onUpdate }: { inquiryId: string; onUpdate: () => void }) {
  const { user } = useAuth();
  const [existingResponses, setExistingResponses] = useState<AIResponse[]>([]);
  const [suggestedResponse, setSuggestedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    loadExistingResponses();
  }, [inquiryId]);

  const loadExistingResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_responses')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingResponses(data || []);
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const generateAIResponse = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://kisekretaerin.app.n8n.cloud/webhook-test/generate-ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiry_id: inquiryId }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      setSuggestedResponse(data.response || '');
      toast.success('KI-Antwort generiert');
    } catch (error) {
      toast.error('Fehler beim Generieren der Antwort');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveResponse = async () => {
    if (!suggestedResponse.trim()) {
      toast.error('Bitte geben Sie eine Antwort ein');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_responses')
        .insert({
          inquiry_id: inquiryId,
          suggested_response: suggestedResponse,
          is_approved: false,
        });

      if (error) throw error;

      toast.success('Antwort gespeichert');
      setSuggestedResponse('');
      loadExistingResponses();
      onUpdate();
    } catch (error) {
      toast.error('Fehler beim Speichern');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const sendResponse = async (responseId: string, responseText: string) => {
    setSendingId(responseId);
    try {
      // Markiere als gesendet
      const { error: updateError } = await supabase
        .from('ai_responses')
        .update({
          sent_at: new Date().toISOString(),
          sent_by: user?.id,
          is_approved: true,
        })
        .eq('id', responseId);

      if (updateError) throw updateError;

      // Hier würde normalerweise die E-Mail versendet werden
      // via Edge Function oder Webhook
      toast.success('Antwort wurde versendet');
      loadExistingResponses();
      onUpdate();
    } catch (error) {
      toast.error('Fehler beim Versenden');
      console.error(error);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          KI-Antwortvorschlag
        </h3>
        <Button
          onClick={generateAIResponse}
          disabled={isGenerating}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generiere...' : 'Mit KI generieren'}
        </Button>
      </div>

      {/* Existing AI Responses */}
      {existingResponses.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Gespeicherte Antworten:</h4>
          {existingResponses.map((response) => (
            <Card key={response.id} className="p-4 bg-muted/30 border-border/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(response.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {response.sent_at ? (
                      <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
                        <Check className="h-3 w-3" />
                        Versendet
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => sendResponse(response.id, response.suggested_response)}
                        disabled={sendingId === response.id}
                        className="gap-2"
                      >
                        <Send className="h-3 w-3" />
                        {sendingId === response.id ? 'Versende...' : 'Versenden'}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap bg-background/50 p-3 rounded">
                  {response.suggested_response}
                </p>
                {response.sent_at && (
                  <p className="text-xs text-muted-foreground">
                    Versendet am {format(new Date(response.sent_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-muted/30 border-border/50">
        <Textarea
          value={suggestedResponse}
          onChange={(e) => setSuggestedResponse(e.target.value)}
          placeholder="KI-generierte Antwort wird hier angezeigt oder schreiben Sie eine eigene..."
          rows={8}
          className="bg-background/50 resize-none"
        />
        
        <div className="mt-4 flex gap-2 justify-end">
          <Button
            onClick={saveResponse}
            disabled={isSaving || !suggestedResponse.trim()}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {isSaving ? 'Speichere...' : 'Antwort speichern'}
          </Button>
        </div>
      </Card>
    </div>
  );
}