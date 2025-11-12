import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ContactFormLink() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFormTitle(data.contact_form_title || 'Kontaktformular');
      setFormDescription(data.contact_form_description || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormSettings = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          contact_form_title: formTitle,
          contact_form_description: formDescription,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Einstellungen gespeichert',
        description: 'Ihre Kontaktformular-Einstellungen wurden aktualisiert.',
      });
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/contact/${profile.contact_form_slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link kopiert!',
      description: 'Der Kontaktformular-Link wurde in die Zwischenablage kopiert.',
    });
  };

  const openLink = () => {
    const link = `${window.location.origin}/contact/${profile.contact_form_slug}`;
    window.open(link, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  const contactLink = `${window.location.origin}/contact/${profile.contact_form_slug}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ihr Kontaktformular-Link</CardTitle>
            <CardDescription>
              Teilen Sie diesen Link, damit Kunden Anfragen direkt an Sie senden können
            </CardDescription>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kontaktformular anpassen</DialogTitle>
                <DialogDescription>
                  Passen Sie Titel und Beschreibung Ihres Kontaktformulars an
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Formular-Titel</Label>
                  <Input
                    id="title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="z.B. Kontaktieren Sie uns"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="z.B. Wir freuen uns auf Ihre Nachricht..."
                    rows={3}
                  />
                </div>
                <Button onClick={updateFormSettings} className="w-full">
                  Speichern
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={contactLink}
            readOnly
            className="font-mono text-sm"
          />
          <Button variant="outline" size="icon" onClick={copyLink}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={openLink}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">Vorschau:</p>
          <p className="text-lg font-semibold">{formTitle}</p>
          {formDescription && (
            <p className="text-sm text-muted-foreground">{formDescription}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
