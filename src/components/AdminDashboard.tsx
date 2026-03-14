import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmailSyncButton from '@/components/EmailSyncButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import {
  Eye, RefreshCw, Sparkles, Archive, Inbox, Mail, Trash2,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Filter, Users,
  BarChart3, ArrowUpRight, Search, MailOpen, Globe
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
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
import { Input } from '@/components/ui/input';

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
  ai_response?: string | null;
  source?: string;
  assigned_to?: string | null;
}

interface Employee {
  id: string;
  full_name: string;
  role: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 8, transition: { duration: 0.2 } }
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  ];
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export default function AdminDashboard({ onSelectInquiry }: { onSelectInquiry: (id: string) => void }) {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueCategories = Array.from(new Set(inquiries.map(i => i.ai_category))).filter(Boolean).sort();

  const filterByCategory = (inqs: Inquiry[]) => {
    if (selectedCategory === 'all') return inqs;
    return inqs.filter(i => i.ai_category === selectedCategory);
  };

  const filterByDate = (inqs: Inquiry[]) => {
    if (dateRange === 'all') return inqs;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (dateRange === '7d' ? 7 : 30));
    return inqs.filter(i => new Date(i.created_at) >= cutoff);
  };

  const filterBySearch = (inqs: Inquiry[]) => {
    if (!searchQuery.trim()) return inqs;
    const q = searchQuery.toLowerCase();
    return inqs.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.email?.toLowerCase().includes(q) ||
      i.subject?.toLowerCase().includes(q)
    );
  };

  const applyFilters = (inqs: Inquiry[]) => filterBySearch(filterByCategory(filterByDate(inqs)));

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [inquiriesRes, employeesRes] = await Promise.all([
        supabase
          .from('inquiries')
          .select(`
            *,
            ai_responses(id, suggested_response, is_approved, sent_at)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('employee_profiles')
          .select('id, full_name, role')
          .eq('employer_id', user.id)
      ]);

      if (inquiriesRes.error) throw inquiriesRes.error;
      if (employeesRes.error) throw employeesRes.error;

      setInquiries(inquiriesRes.data || []);
      setEmployees(employeesRes.data || []);
    } catch (error) {
      toast.error('Fehler beim Laden der Daten');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('admin-inquiries')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inquiries', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newInquiry = payload.new as Inquiry;
          setInquiries(prev => [newInquiry, ...prev]);
          toast.info(`Neue Anfrage von ${newInquiry.name || 'Unbekannt'}`);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inquiries', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as Inquiry;
          setInquiries(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAssignInquiry = async (inquiryId: string, employeeId: string | 'unassigned') => {
    try {
      const assignedTo = employeeId === 'unassigned' ? null : employeeId;

      const { error } = await supabase
        .from('inquiries')
        .update({ assigned_to: assignedTo })
        .eq('id', inquiryId);

      if (error) throw error;

      setInquiries(inquiries.map(i =>
        i.id === inquiryId ? { ...i, assigned_to: assignedTo } : i
      ));
      toast.success('Zuweisung aktualisiert');
    } catch (error) {
      toast.error('Fehler bei der Zuweisung');
      console.error(error);
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
    loadData();
  }, [user]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; icon: typeof Clock; className: string; dotColor: string }> = {
      open: {
        label: 'Offen',
        icon: AlertCircle,
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        dotColor: 'bg-blue-500',
      },
      in_progress: {
        label: 'In Bearbeitung',
        icon: Clock,
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        dotColor: 'bg-amber-500',
      },
      closed: {
        label: 'Erledigt',
        icon: CheckCircle2,
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dotColor: 'bg-emerald-500',
      },
    };
    return configs[status] || configs.open;
  };

  const hasAIResponse = (inquiry: Inquiry) => {
    return !!inquiry.ai_response || (inquiry.ai_responses && inquiry.ai_responses.length > 0);
  };

  const getSourceIcon = (source?: string) => {
    if (source === 'email') return <MailOpen className="h-3.5 w-3.5" />;
    return <Globe className="h-3.5 w-3.5" />;
  };

  const inboxInquiries = useMemo(() => applyFilters(inquiries.filter(i => i.status === 'open' || i.status === 'in_progress')), [inquiries, selectedCategory, dateRange, searchQuery]);
  const archivedInquiries = useMemo(() => applyFilters(inquiries.filter(i => i.status === 'closed')), [inquiries, selectedCategory, dateRange, searchQuery]);

  const filteredAll = useMemo(() => applyFilters(inquiries), [inquiries, selectedCategory, dateRange, searchQuery]);
  const stats = useMemo(() => ({
    total: filteredAll.length,
    open: filteredAll.filter(i => i.status === 'open').length,
    in_progress: filteredAll.filter(i => i.status === 'in_progress').length,
    closed: filteredAll.filter(i => i.status === 'closed').length,
  }), [filteredAll]);

  const completionRate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;

  const statCards = [
    {
      label: 'Gesamt',
      value: stats.total,
      icon: BarChart3,
      gradient: 'from-slate-500/10 to-slate-600/5',
      iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
      border: 'border-slate-500/10',
    },
    {
      label: 'Offen',
      value: stats.open,
      icon: AlertCircle,
      gradient: 'from-blue-500/10 to-blue-600/5',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/10',
    },
    {
      label: 'In Bearbeitung',
      value: stats.in_progress,
      icon: Clock,
      gradient: 'from-amber-500/10 to-amber-600/5',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/10',
    },
    {
      label: 'Erledigt',
      value: stats.closed,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/10',
      extra: (
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>Abschlussrate</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-1.5 bg-emerald-500/10 [&>div]:bg-emerald-500" />
        </div>
      ),
    },
  ];

  const renderInquiryTable = (filteredInquiries: Inquiry[]) => (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 pl-4">Absender</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Betreff</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Kategorie</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Status</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Zugewiesen</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 text-right pr-4">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {filteredInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-24">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto"
                  >
                    <div className="relative">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Mail className="h-9 w-9 text-primary/40" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground/50" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold">Keine Anfragen</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Sobald Anfragen eingehen, erscheinen sie hier automatisch.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadData} className="gap-2 mt-2">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Aktualisieren
                    </Button>
                  </motion.div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInquiries.map((inquiry) => {
                const statusConfig = getStatusConfig(inquiry.status);
                const StatusIcon = statusConfig.icon;
                const assignedEmployee = employees.find(e => e.id === inquiry.assigned_to);

                return (
                  <motion.tr
                    key={inquiry.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="group border-border/30 hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => onSelectInquiry(inquiry.id)}
                  >
                    <TableCell className="pl-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-9 w-9 ${getAvatarColor(inquiry.name || 'U')}`}>
                          <AvatarFallback className="text-xs font-semibold bg-transparent">
                            {getInitials(inquiry.name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{inquiry.name}</p>
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-muted-foreground/50 flex-shrink-0">
                                    {getSourceIcon(inquiry.source)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">{inquiry.source === 'email' ? 'Per E-Mail' : 'Per Kontaktformular'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{inquiry.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm truncate max-w-[280px]">{inquiry.subject}</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true, locale: de })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                      {inquiry.ai_category ? (
                        <Badge variant="outline" className="bg-purple-500/8 text-purple-600 dark:text-purple-400 border-purple-500/20 font-medium text-xs">
                          {inquiry.ai_category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">Unkategorisiert</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`gap-1.5 font-medium text-xs ${statusConfig.className}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
                          {statusConfig.label}
                        </Badge>
                        {hasAIResponse(inquiry) && (
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="gap-1 bg-violet-500/8 text-violet-600 dark:text-violet-400 border-violet-500/20 px-1.5">
                                  <Sparkles className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">KI-Antwortvorschlag vorhanden</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={inquiry.assigned_to || 'unassigned'}
                        onValueChange={(val) => handleAssignInquiry(inquiry.id, val)}
                      >
                        <SelectTrigger className="w-[150px] h-8 text-xs border-dashed border-border/50 bg-transparent hover:bg-muted/50">
                          {assignedEmployee ? (
                            <div className="flex items-center gap-2">
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ${getAvatarColor(assignedEmployee.full_name)}`}>
                                {getInitials(assignedEmployee.full_name)}
                              </div>
                              <span className="truncate">{assignedEmployee.full_name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">Zuweisen...</span>
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            <span className="text-muted-foreground">Nicht zugewiesen</span>
                          </SelectItem>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              <div className="flex items-center gap-2">
                                <span>{emp.full_name}</span>
                                <span className="text-muted-foreground text-[10px]">{emp.role}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right pr-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 flex">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => onSelectInquiry(inquiry.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-xs">Details anzeigen</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <AlertDialog>
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Anfrage loschen</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Anfrage endgueltig loschen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Diese Aktion kann nicht rueckgaengig gemacht werden. Die Anfrage von <strong>{inquiry.name}</strong> wird dauerhaft entfernt.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteInquiry(inquiry.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Endgueltig loschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-elegant">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    {stats.open > 0
                      ? `${stats.open} offene Anfrage${stats.open !== 1 ? 'n' : ''} warten auf Bearbeitung`
                      : 'Alle Anfragen sind bearbeitet'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EmailSyncButton />
              <Button
                onClick={loadData}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
            </div>
          </motion.div>

          {/* Stat Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, gradient, iconBg, border, extra }) => (
              <Card key={label} className={`relative overflow-hidden border ${border} bg-gradient-to-br ${gradient} backdrop-blur-sm`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
                    </div>
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  {extra}
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Contact Form Link */}
          <motion.div variants={itemVariants}>
            <ContactFormLink />
          </motion.div>

          {/* Filter Bar + Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="inbox" className="space-y-4">
              {/* Combined filter row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <TabsList className="h-10 p-1 bg-muted/50">
                  <TabsTrigger value="inbox" className="gap-2 data-[state=active]:shadow-sm">
                    <Inbox className="h-4 w-4" />
                    Posteingang
                    {inboxInquiries.length > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                        {inboxInquiries.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="archive" className="gap-2 data-[state=active]:shadow-sm">
                    <Archive className="h-4 w-4" />
                    Archiv
                    {archivedInquiries.length > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-muted-foreground/10 text-muted-foreground text-[11px] font-semibold">
                        {archivedInquiries.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                    <Input
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-[180px] pl-8 text-sm bg-background/50"
                    />
                  </div>
                  <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                    <SelectTrigger className="h-9 w-[140px] text-xs bg-background/50">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/50" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Zeitraume</SelectItem>
                      <SelectItem value="7d">Letzte 7 Tage</SelectItem>
                      <SelectItem value="30d">Letzte 30 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-9 w-[160px] text-xs bg-background/50">
                      <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/50" />
                      <SelectValue placeholder="Kategorie" />
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
                </div>
              </div>

              <TabsContent value="inbox" className="mt-0">
                <Card className="overflow-hidden border-border/40 shadow-elegant">
                  <CardContent className="p-0">
                    {renderInquiryTable(inboxInquiries)}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="archive" className="mt-0">
                <Card className="overflow-hidden border-border/40 shadow-elegant">
                  <CardContent className="p-0">
                    {renderInquiryTable(archivedInquiries)}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
