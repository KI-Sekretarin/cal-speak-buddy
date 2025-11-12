import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Send, CheckCircle2 } from 'lucide-react';

interface ContactFormSettings {
  userId: string;
  title: string;
  description: string;
}

export default function PublicContactForm() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ContactFormSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    loadContactFormSettings();
  }, [slug]);

  const loadContactFormSettings = async () => {
    if (!slug) {
      navigate('/404');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, contact_form_title, contact_form_description')
        .eq('contact_form_slug', slug)
        .single();

      if (error || !data) {
        toast.error('Kontaktformular nicht gefunden');
        navigate('/404');
        return;
      }

      setSettings({
        userId: data.id,
        title: data.contact_form_title || 'Kontaktformular',
        description: data.contact_form_description || 'Bitte füllen Sie das Formular aus, um eine Anfrage zu stellen.',
      });
    } catch (error) {
      console.error('Error loading contact form:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings) return;

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('inquiries').insert({
        user_id: settings.userId,
        contact_form_slug: slug,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
        status: 'neu',
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Ihre Anfrage wurde erfolgreich gesendet!');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Fehler beim Senden der Anfrage. Bitte versuchen Sie es später erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Anfrage erfolgreich gesendet!</h2>
            <p className="text-muted-foreground">
              Vielen Dank für Ihre Nachricht. Wir werden uns so schnell wie möglich bei Ihnen melden.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="mt-4"
            >
              Weitere Anfrage senden
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{settings.title}</h1>
            <p className="text-muted-foreground">{settings.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Max Mustermann"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  E-Mail <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="max@beispiel.de"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+49 123 456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Betreff <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Worum geht es?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                Nachricht <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Beschreiben Sie Ihr Anliegen..."
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={submitting}
              size="lg"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Wird gesendet...' : 'Anfrage senden'}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            <span className="text-destructive">*</span> Pflichtfelder
          </p>
        </div>
      </Card>
    </div>
  );
}
