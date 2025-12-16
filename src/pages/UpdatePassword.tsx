import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Loader2 } from 'lucide-react';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a session (which happens after clicking the reset link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast({
                    variant: "destructive",
                    title: "Ungültiger Link",
                    description: "Bitte fordern Sie einen neuen Link an.",
                });
                navigate('/forgot-password');
            }
        });
    }, [navigate, toast]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast({
                title: "Passwort aktualisiert",
                description: "Ihr Passwort wurde erfolgreich geändert. Sie werden nun weitergeleitet.",
            });

            setTimeout(() => navigate('/login'), 2000);

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Fehler",
                description: error.message || "Ein Fehler ist aufgetreten.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-lg border-primary/10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Neues Passwort setzen</CardTitle>
                    <CardDescription className="text-center">
                        Bitte geben Sie Ihr neues Passwort ein.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Neues Passwort"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Passwort speichern
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
