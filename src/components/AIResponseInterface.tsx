import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, Check } from 'lucide-react';

export default function AIResponseInterface({ inquiryId, onUpdate }: { inquiryId: string; onUpdate: () => void }) {
  const [suggestedResponse, setSuggestedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      const response = await fetch('https://bqwfcixtbnodxuoixxkk.supabase.co/functions/v1/ai-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          inquiry_id: inquiryId,
          suggested_response: suggestedResponse,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success('Antwort gespeichert');
      setSuggestedResponse('');
      onUpdate();
    } catch (error) {
      toast.error('Fehler beim Speichern');
      console.error(error);
    } finally {
      setIsSaving(false);
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

      <Card className="p-4 bg-muted/30 border-border/50">
        <Textarea
          value={suggestedResponse}
          onChange={(e) => setSuggestedResponse(e.target.value)}
          placeholder="KI-generierte Antwort wird hier angezeigt..."
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