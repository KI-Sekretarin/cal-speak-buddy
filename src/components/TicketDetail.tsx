import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Mail, User, Clock, Tag, MessageSquare, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import AIResponseInterface from './AIResponseInterface';

interface InquiryDetail {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  ai_category: string | null;
  ai_response: string | null;
  created_at: string;
  updated_at: string;
  ai_responses: Array<{
    id: string;
    suggested_response: string;
    is_approved: boolean;
    created_at: string;
  }>;
}

export default function TicketDetail({ inquiryId, onBack }: { inquiryId: string; onBack: () => void }) {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadInquiry = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://bqwfcixtbnodxuoixxkk.supabase.co/functions/v1/inquiries/${inquiryId}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load');

      const data = await response.json();
      setInquiry(data);
    } catch (error) {
      toast.error('Fehler beim Laden der Anfrage');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiry();
  }, [inquiryId]);

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`https://bqwfcixtbnodxuoixxkk.supabase.co/functions/v1/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success('Status aktualisiert');
      loadInquiry();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
      console.error(error);
    }
  };

  if (isLoading || !inquiry) {
    return <div className="flex items-center justify-center min-h-screen">Laden...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button onClick={onBack} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </Button>

        <Card className="backdrop-blur-sm bg-card/95 border-border/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{inquiry.subject}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-base">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {inquiry.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {inquiry.email}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={inquiry.status} onValueChange={updateStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="open">Offen</SelectItem>
                    <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                    <SelectItem value="closed">Erledigt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Erstellt: {format(new Date(inquiry.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
              </span>
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Kategorie: {inquiry.category}
              </span>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Nachricht
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">
                {inquiry.message}
              </div>
            </div>

            {inquiry.ai_category && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  KI-Kategorisierung
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {inquiry.ai_category}
                </Badge>
              </div>
            )}

            <Separator />

            <AIResponseInterface inquiryId={inquiry.id} onUpdate={loadInquiry} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}