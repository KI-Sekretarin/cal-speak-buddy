import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const checkRole = async () => {
        const { data } = await supabase
          .from('employee_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (data) {
          navigate('/employee-dashboard');
        } else {
          navigate('/admin');
        }
      };
      checkRole();
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Ungültige Zugangsdaten. Bitte überprüfe deine E-Mail und Passwort.');
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: 'Ungültige Zugangsdaten',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Willkommen zurück!',
        description: 'Du wurdest erfolgreich angemeldet.',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">KI</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Willkommen zurück</CardTitle>
          <CardDescription className="text-center">
            Melde dich bei deinem KI-Sekretärin Dashboard an
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@firma.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/register" className="text-primary hover:underline">
                Noch kein Account?
              </Link>
              <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">
                Passwort vergessen?
              </Link>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
