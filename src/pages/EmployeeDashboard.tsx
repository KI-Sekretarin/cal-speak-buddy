import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCcw, User, Globe } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Inquiry = Database['public']['Tables']['inquiries']['Row'] & {
    assigned_to?: string | null;
};

type EmployeeProfile = Database['public']['Tables']['employee_profiles']['Row'];

export default function EmployeeDashboard() {
    const { user, signOut } = useAuth();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);

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
        setLoading(true);
        const { data, error } = await supabase
            .from("inquiries")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setInquiries(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchEmployeeProfile();
        fetchInquiries();
    }, [fetchEmployeeProfile, fetchInquiries]);

    const myTickets = inquiries.filter(i => i.assigned_to === user?.id);
    const unassignedTickets = inquiries.filter(i => !i.assigned_to);
    const otherTickets = inquiries.filter(i => i.assigned_to && i.assigned_to !== user?.id);

    const renderTicketList = (tickets: Inquiry[], emptyMsg: string) => (
        tickets.length === 0 ? (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    {emptyMsg}
                </CardContent>
            </Card>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tickets.map((inquiry) => (
                    <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg line-clamp-1">{inquiry.subject}</CardTitle>
                                <Badge variant={inquiry.status === 'open' ? 'destructive' : 'secondary'}>
                                    {inquiry.status}
                                </Badge>
                            </div>
                            <CardDescription>From: {inquiry.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80 line-clamp-3 mb-4">
                                {inquiry.message}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                                <Badge variant="outline">{inquiry.category}</Badge>
                                {inquiry.ai_category && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-none">
                                        AI: {inquiry.ai_category}
                                    </Badge>
                                )}
                            </div>
                            {inquiry.ai_response && (
                                <div className="mt-4 pt-4 border-t text-sm bg-muted/50 p-2 rounded">
                                    <strong>AI Vorschlag:</strong>
                                    <p className="line-clamp-3 italic text-muted-foreground">{inquiry.ai_response}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    );

    return (
        <div className="min-h-screen bg-background p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Mitarbeiter Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        {employeeProfile ? `Willkommen, ${employeeProfile.full_name} (${employeeProfile.role})` : "Lade Profil..."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchInquiries}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Aktualisieren
                    </Button>
                    <Button variant="outline" size="sm" onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" /> Abmelden
                    </Button>
                </div>
            </header>

            <main>
                <Tabs defaultValue="my-tickets" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="my-tickets" className="gap-2">
                            <User className="h-4 w-4" />
                            Meine Tickets
                            <Badge variant="secondary" className="ml-1">{myTickets.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="unassigned" className="gap-2">
                            <Globe className="h-4 w-4" />
                            Nicht zugewiesen
                            <Badge variant="secondary" className="ml-1">{unassignedTickets.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="all" className="gap-2">
                            Alle Tickets
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-tickets" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Mir zugewiesen</h2>
                        </div>
                        {renderTicketList(myTickets, "Keine Tickets zugewiesen.")}
                    </TabsContent>

                    <TabsContent value="unassigned" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Offene Tickets (Nicht zugewiesen)</h2>
                        </div>
                        {renderTicketList(unassignedTickets, "Keine offenen, nicht zugewiesenen Tickets.")}
                    </TabsContent>

                    <TabsContent value="all" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Alle Tickets</h2>
                        </div>
                        {renderTicketList([...myTickets, ...unassignedTickets, ...otherTickets], "Keine Tickets gefunden.")}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
