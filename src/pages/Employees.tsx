import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Employee {
    id: string;
    full_name: string;
    role: string;
    skills?: string[];
    max_capacity?: number;
    created_at: string;
}

export default function Employees() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [skills, setSkills] = useState("");
    const [maxCapacity, setMaxCapacity] = useState(10);

    const { data: employees, refetch } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Employee[];
        }
    });

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data } = await supabase.auth.getUser();
            if (!data.user) return null;

            const { data: profile } = await supabase
                .from('profiles')
                .select('inquiry_categories')
                .eq('id', data.user.id)
                .single();

            return profile;
        }
    });

    useEffect(() => {
        if (profile?.inquiry_categories && Array.isArray(profile.inquiry_categories)) {
            setCategories(profile.inquiry_categories.map(String));
        }
    }, [profile]);

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('create-employee', {
                body: {
                    name,
                    email,
                    password,
                    role,
                    skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
                    max_capacity: maxCapacity
                }
            });

            if (error) throw error;

            toast({
                title: "Mitarbeiter erstellt",
                description: `${name} wurde erfolgreich als ${role} hinzugefügt.`,
            });

            // Reset form
            setName("");
            setEmail("");
            setPassword("");
            setRole("");
            refetch();
        } catch (error) {
            console.error('Error creating employee:', error);
            toast({
                title: "Fehler",
                description: (error as Error).message || "Mitarbeiter konnte nicht erstellt werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mitarbeiter & Rollen</h2>
                    <p className="text-muted-foreground">
                        Verwalten Sie Zugänge für Ihre Mitarbeiter und weisen Sie Rollen zu.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Create Employee Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Neuen Mitarbeiter anlegen
                            </CardTitle>
                            <CardDescription>
                                Erstellen Sie einen Zugang für einen Mitarbeiter.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateEmployee} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Voller Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Max Mustermann"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-Mail-Adresse</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="max@firma.at"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Initiales Passwort</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Sicheres Passwort"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Rolle / Zuständigkeit</Label>
                                    <Select value={role} onValueChange={setRole} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wähle eine Kategorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.length > 0 ? (
                                                categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="general">general (Standard)</SelectItem>
                                            )}

                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Basierend auf Ihren eingestellten KI-Kategorien.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="skills">Fähigkeiten (Kommagetrennt)</Label>
                                    <Input
                                        id="skills"
                                        placeholder="Hardware, Netzwerk, Buchhaltung..."
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_capacity">Max. gleichzeitige Tickets (Auslastung)</Label>
                                    <Input
                                        id="max_capacity"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={maxCapacity}
                                        onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 10)}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Mitarbeiter erstellen
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Employee List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mitarbeiter Liste</CardTitle>
                            <CardDescription>
                                Alle registrierten Mitarbeiter Ihrer Organisation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {employees && employees.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Rolle</TableHead>
                                            <TableHead>Skills</TableHead>
                                            <TableHead>Kapazität</TableHead>
                                            <TableHead>Erstellt am</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employees.map((emp) => (
                                            <TableRow key={emp.id}>
                                                <TableCell className="font-medium">{emp.full_name}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                        {emp.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {emp.skills && emp.skills.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {emp.skills.map((skill: string, i: number) => (
                                                                <span key={i} className="inline-flex px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {emp.max_capacity || 10}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(emp.created_at).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Noch keine Mitarbeiter angelegt.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
