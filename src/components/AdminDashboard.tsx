import { useEffect, useState } from 'react';
import EmailSyncButton from '@/components/EmailSyncButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, RefreshCw, Sparkles, Archive, Inbox, Mail, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ContactFormLink from './ContactFormLink';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from 'lucide-react';

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
  ai_category?: string | null;
  source?: string;
}

export default function AdminDashboard({ onSelectInquiry }: { onSelectInquiry: (id: string) => void }) {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const uniqueCategories = Array.from(new Set(inquiries.map(i => i.ai_category))).filter(Boolean).sort();

  const filterByCategory = (inqs: Inquiry[]) => {
    if (selectedCategory === 'all') return inqs;
    return inqs.filter(i => i.ai_category === selectedCategory);
  };

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

  const handleDeleteInquiry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Anfrage gelöscht');
      setInquiries(inquiries.filter(i => i.id !== id));
    } catch (error) {
      toast.error('Fehler beim Löschen der Anfrage');
      console.error(error);
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

  const renderInquiryTable = (filteredInquiries: Inquiry[]) => (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Betreff</TableHead>
            <TableHead>Kategorie</TableHead>
            <TableHead>Quelle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInquiries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Keine Anfragen in diesem Bereich
              </TableCell>
            </TableRow>
          ) : (
            filteredInquiries.map((inquiry) => (
              <TableRow key={inquiry.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-sm">
                  {format(new Date(inquiry.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                </TableCell>
                <TableCell className="font-medium">{inquiry.name}</TableCell>
                <TableCell className="text-muted-foreground">{inquiry.email}</TableCell>
                <TableCell className="max-w-xs truncate">{inquiry.subject}</TableCell>
                <TableCell>
                  {inquiry.ai_category ? (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                      {inquiry.ai_category}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {inquiry.source === 'email' ? (
                    <Badge variant="secondary" className="gap-1.5 bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                      <Mail className="h-3.5 w-3.5" />
                      E-Mail
                    </Badge>
                  ) : inquiry.source === 'chat' ? (
                    <Badge variant="secondary" className="gap-1.5 bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                      <Sparkles className="h-3.5 w-3.5" />
                      Chat
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                      <FileText className="h-3.5 w-3.5" />
                      Formular
                    </Badge>
                  )}
                </TableCell>
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
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectInquiry(inquiry.id)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden. Die Anfrage wird dauerhaft gelöscht.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteInquiry(inquiry.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const inboxInquiries = filterByCategory(inquiries.filter(i => i.status === 'open' || i.status === 'in_progress'));
  const archivedInquiries = filterByCategory(inquiries.filter(i => i.status === 'closed'));

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
          <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] bg-background/50 backdrop-blur-sm">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Kategorie filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category as string}>
                    {category as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <EmailSyncButton />
            <Button onClick={loadInquiries} disabled={isLoading} variant="outline" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
          </div>
        </div>

        <ContactFormLink />

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="inbox" className="gap-2">
              <Inbox className="h-4 w-4" />
              Posteingang
              {inboxInquiries.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-5">
                  {inboxInquiries.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archive" className="gap-2">
              <Archive className="h-4 w-4" />
              Archiv
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-6">
            <Card className="backdrop-blur-sm bg-card/95 border-border/50">
              <CardHeader>
                <CardTitle>Offene Anfragen</CardTitle>
                <CardDescription>Hier sehen Sie alle neuen und in Bearbeitung befindlichen Anfragen.</CardDescription>
              </CardHeader>
              <CardContent>
                {renderInquiryTable(inboxInquiries)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archive" className="mt-6">
            <Card className="backdrop-blur-sm bg-card/95 border-border/50">
              <CardHeader>
                <CardTitle>Archiv</CardTitle>
                <CardDescription>Erledigte und abgeschlossene Anfragen.</CardDescription>
              </CardHeader>
              <CardContent>
                {renderInquiryTable(archivedInquiries)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}