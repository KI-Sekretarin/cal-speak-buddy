import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCcw, Inbox, CheckCircle2, Clock, AlertCircle, Mail, Sparkles, ArrowRight } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import TicketDetail from "@/components/TicketDetail";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type Inquiry = Database['public']['Tables']['inquiries']['Row'] & {
    assigned_to?: string | null;
};

type EmployeeProfile = Database['public']['Tables']['employee_profiles']['Row'];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    open: { label: "Offen", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertCircle },
    in_progress: { label: "In Bearbeitung", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
    closed: { label: "Erledigt", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
};

export default function EmployeeDashboard() {
    const { user, signOut } = useAuth();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
    const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

    const fetchEmployeeProfile = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from("employee_profiles")
            .select("*")
            .eq("id", user.id)
            .single();
        setEmployeeProfile(data);
    }, [user]);

    const fetchInquiries = useCallback(async () => {
        if (!employeeProfile?.employer_id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("inquiries")
            .select("*")
            .eq("user_id", employeeProfile.employer_id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setInquiries(data);
        }
        setLoading(false);
    }, [employeeProfile?.employer_id]);

    useEffect(() => {
        fetchEmployeeProfile();
        fetchInquiries();
    }, [fetchEmployeeProfile, fetchInquiries]);

    // If a ticket is selected, show TicketDetail
    if (selectedInquiryId) {
        return (
            <TicketDetail
                inquiryId={selectedInquiryId}
                onBack={() => {
                    setSelectedInquiryId(null);
                    fetchInquiries();
                }}
            />
        );
    }

    const myTickets = inquiries.filter(i => i.assigned_to === user?.id);
    const allTickets = inquiries;

    const openCount = inquiries.filter(i => i.status === "open").length;
    const inProgressCount = inquiries.filter(i => i.status === "in_progress").length;
    const closedCount = inquiries.filter(i => i.status === "closed").length;

    const renderTicketCard = (inquiry: Inquiry) => {
        const status = statusConfig[inquiry.status] || statusConfig.open;
        const StatusIcon = status.icon;

        return (
            <Card
                key={inquiry.id}
                className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer border-border/60"
                onClick={() => setSelectedInquiryId(inquiry.id)}
            >
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                {inquiry.subject}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1.5">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{inquiry.email}</span>
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className={`shrink-0 gap-1.5 ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {inquiry.message}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className="text-xs font-normal">
                                {inquiry.category}
                            </Badge>
                            {inquiry.ai_category && (
                                <Badge variant="secondary" className="text-xs font-normal gap-1 bg-violet-500/10 text-violet-600 border-violet-500/20">
                                    <Sparkles className="h-3 w-3" />
                                    {inquiry.ai_category}
                                </Badge>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(inquiry.created_at), "dd. MMM", { locale: de })}
                        </span>
                    </div>

                    {inquiry.ai_response && (
                        <div className="mt-3 pt-3 border-t border-border/40 flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-violet-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                {inquiry.ai_response}
                            </p>
                        </div>
                    )}

                    <div className="mt-3 flex items-center justify-end text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        Details anzeigen <ArrowRight className="h-3 w-3" />
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderTicketList = (tickets: Inquiry[], emptyMsg: string) => (
        tickets.length === 0 ? (
            <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                    <Inbox className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground">{emptyMsg}</p>
                </CardContent>
            </Card>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tickets.map(renderTicketCard)}
            </div>
        )
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-violet-500">
                            Mitarbeiter Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {employeeProfile
                                ? `${employeeProfile.full_name} · ${employeeProfile.role}`
                                : "Lade Profil..."
                            }
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchInquiries} className="gap-2">
                            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Aktualisieren</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground hover:text-foreground">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Abmelden</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-red-500/5 to-red-500/0 border-red-500/10">
                        <CardContent className="py-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{openCount}</p>
                                <p className="text-xs text-muted-foreground">Offen</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/0 border-amber-500/10">
                        <CardContent className="py-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{inProgressCount}</p>
                                <p className="text-xs text-muted-foreground">In Bearbeitung</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 border-emerald-500/10">
                        <CardContent className="py-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{closedCount}</p>
                                <p className="text-xs text-muted-foreground">Erledigt</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tickets */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Inbox className="h-5 w-5 text-primary" />
                            Anfragen
                            {inquiries.length > 0 && (
                                <Badge variant="secondary" className="h-5 min-w-[20px] flex items-center justify-center text-xs">
                                    {inquiries.length}
                                </Badge>
                            )}
                        </h2>
                    </div>
                    {renderTicketList(inquiries, "Keine Tickets gefunden.")}
                </div>
            </main>
        </div>
    );
}
