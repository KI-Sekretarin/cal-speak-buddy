import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Register() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Password strength validation
  const passwordRequirements = [
    { label: 'Mindestens 8 Zeichen', met: password.length >= 8 },
    { label: 'Ein Großbuchstabe', met: /[A-Z]/.test(password) },
    { label: 'Eine Zahl', met: /[0-9]/.test(password) },
    { label: 'Ein Sonderzeichen', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const getPasswordStrength = () => {
    const metCount = passwordRequirements.filter(req => req.met).length;
    if (metCount === 0) return { label: '', color: '' };
    if (metCount <= 2) return { label: 'Schwach', color: 'text-destructive' };
    if (metCount === 3) return { label: 'Mittel', color: 'text-orange-500' };
    return { label: 'Stark', color: 'text-green-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allRequirementsMet) {
      setError('Das Passwort erfüllt nicht alle Anforderungen.');
      return;
    }

    if (!passwordsMatch) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (!acceptTerms) {
      setError('Bitte akzeptiere die Datenschutzerklärung und Nutzungsbedingungen.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, companyName);

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Diese E-Mail-Adresse ist bereits registriert.');
      } else {
        setError('Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      }
      toast({
        title: 'Registrierung fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Registrierung erfolgreich!',
        description: 'Bitte überprüfe deine E-Mails zur Bestätigung.',
      });
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-xl shadow-elegant">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">KI</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Account erstellen</CardTitle>
          <CardDescription className="text-center">
            Registriere dich für dein KI-Sekretärin Dashboard
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="fullName">Vollständiger Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Max Mustermann"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="companyName">Unternehmensname (optional)</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Firma GmbH"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse *</Label>
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
              <Label htmlFor="password">Passwort *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              {password && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Passwort-Stärke:</span>
                    <span className={cn("font-medium", strength.color)}>{strength.label}</span>
                  </div>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort wiederholen *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs mt-1">
                  {passwordsMatch ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">Passwörter stimmen überein</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-destructive" />
                      <span className="text-destructive">Passwörter stimmen nicht überein</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                disabled={loading}
              />
              <Label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ich akzeptiere die{' '}
                <Link to="#" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>{' '}
                und{' '}
                <Link to="#" className="text-primary hover:underline">
                  Nutzungsbedingungen
                </Link>
              </Label>
            </div>

            <div className="text-sm text-center text-muted-foreground">
              Du hast bereits einen Account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Jetzt anmelden
              </Link>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !allRequirementsMet || !passwordsMatch || !acceptTerms}
            >
              {loading ? 'Wird registriert...' : 'Registrieren'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
