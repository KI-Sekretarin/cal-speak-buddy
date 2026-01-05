import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Check, Send, Clock, Edit2, X, RefreshCw, Trash2 } from 'lucide-react';
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

export default function AIResponseInterface({ inquiryId, onUpdate, defaultResponse, isClosed }: { inquiryId: string; onUpdate: () => void; defaultResponse?: string | null; isClosed?: boolean }) {
  const { user } = useAuth();
  const [existingResponses, setExistingResponses] = useState<AIResponse[]>([]);
  const [suggestedResponse, setSuggestedResponse] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    loadExistingResponses();
    setHasInitialized(false); // Reset when inquiryId changes
  }, [inquiryId]);

  useEffect(() => {
    if (defaultResponse && !hasInitialized && existingResponses.length === 0) {
      setSuggestedResponse(defaultResponse);
      setHasInitialized(true);
    }
  }, [defaultResponse, existingResponses, hasInitialized]);

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

  const updateResponse = async (responseId: string) => {
    if (!editedText.trim()) {
      toast.error('Antwort darf nicht leer sein');
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_responses')
        .update({ suggested_response: editedText })
        .eq('id', responseId);

      if (error) throw error;

      toast.success('Antwort aktualisiert');
      setEditingId(null);
      setEditedText('');
      loadExistingResponses();
      onUpdate();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
      console.error(error);
    }
  };

  const startEditing = (response: AIResponse) => {
    setEditingId(response.id);
    setEditedText(response.suggested_response);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedText('');
  };

  const sendResponse = async (responseId: string, responseText: string) => {
    setSendingId(responseId);
    try {
      // Rufe Edge Function auf zum E-Mail-Versand
      const { data, error } = await supabase.functions.invoke('send-inquiry-response', {
        body: { responseId },
      });

      if (error) throw error;

      toast.success('Antwort wurde per E-Mail versendet!');
      loadExistingResponses();
      onUpdate();
    } catch (error) {
      toast.error('Fehler beim Versenden der E-Mail');
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
          Antwortvorschläge
        </h3>
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
                      <>
                        {editingId !== response.id && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(response)}
                              className="gap-2"
                            >
                              <Edit2 className="h-3 w-3" />
                              Bearbeiten
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from('ai_responses')
                                    .delete()
                                    .eq('id', response.id);

                                  if (error) throw error;
                                  toast.success('Antwort gelöscht');
                                  loadExistingResponses();
                                } catch (error) {
                                  toast.error('Fehler beim Löschen');
                                }
                              }}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          onClick={() => sendResponse(response.id, response.suggested_response)}
                          disabled={sendingId === response.id || editingId === response.id}
                          className="gap-2"
                        >
                          <Send className="h-3 w-3" />
                          {sendingId === response.id ? 'Versende...' : 'Versenden'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === response.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={8}
                      className="bg-background/50 resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                        className="gap-2"
                      >
                        <X className="h-3 w-3" />
                        Abbrechen
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateResponse(response.id)}
                        className="gap-2"
                      >
                        <Check className="h-3 w-3" />
                        Speichern
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap bg-background/50 p-3 rounded">
                    {response.suggested_response}
                  </p>
                )}

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

      {!isClosed && (
        <Card className="p-4 bg-muted/30 border-border/50">
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium">Neue Antwort erstellen:</h4>
          </div>
          <Textarea
            value={suggestedResponse}
            onChange={(e) => setSuggestedResponse(e.target.value)}
            placeholder="Schreiben Sie hier Ihre Antwort..."
            rows={8}
            className="bg-background/50 resize-none"
          />

          <div className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('inquiries')
                    .update({
                      ai_category: null,
                      ai_response: null,
                      status: 'open'
                    })
                    .eq('inquiryId', inquiryId);

                  if (error) throw error;

                  toast.info('KI generiert neue Antwort...');
                  onUpdate();
                } catch (error) {
                  toast.error('Fehler beim Zurücksetzen');
                }
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Neu generieren
            </Button>
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
      )}
    </div>
  );
}