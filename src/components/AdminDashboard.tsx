import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, RefreshCw, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ContactFormLink from './ContactFormLink';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  ai_responses?: {
    id: string;
    suggested_response: string;
    is_approved: boolean;
  }[];
}

export default function AdminDashboard({ onSelectInquiry }: { onSelectInquiry: (id: string) => void }) {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadInquiries = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          ai_responses(id, suggested_response, is_approved, sent_at)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInquiries(data || []);
    } catch (error) {
      toast.error('Fehler beim Laden der Anfragen');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      closed: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    
    const labels = {
      open: 'Offen',
      in_progress: 'In Bearbeitung',
      closed: 'Erledigt',
    };

    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      general: 'Allgemein',
      technical: 'Technisch',
      billing: 'Abrechnung',
      feedback: 'Feedback',
      other: 'Sonstiges',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const hasAIResponse = (inquiry: Inquiry) => {
    return inquiry.ai_responses && inquiry.ai_responses.length > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Verwalten Sie alle Kundenanfragen</p>
          </div>
          <Button onClick={loadInquiries} disabled={isLoading} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>

        <ContactFormLink />

        <Card className="backdrop-blur-sm bg-card/95 border-border/50">
          <CardHeader>
            <CardTitle>Alle Anfragen</CardTitle>
            <CardDescription>Übersicht über alle eingegangenen Kundenanfragen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Betreff</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm">
                        {format(new Date(inquiry.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </TableCell>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell className="text-muted-foreground">{inquiry.email}</TableCell>
                      <TableCell className="max-w-xs truncate">{inquiry.subject}</TableCell>
                      <TableCell>{getCategoryLabel(inquiry.category)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(inquiry.status)}
                          {hasAIResponse(inquiry) && (
                            <Badge variant="outline" className="gap-1 bg-purple-500/10 text-purple-500 border-purple-500/20">
                              <Sparkles className="h-3 w-3" />
                              KI
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSelectInquiry(inquiry.id)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}