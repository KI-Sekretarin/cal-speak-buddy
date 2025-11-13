import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompanyProfile } from '@/types/profile';
import { Brain, Plus, X, Sparkles, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

interface AISettingsTabProps {
  profile: CompanyProfile | null;
  onUpdate: (field: string, value: any) => void;
}

export function AISettingsTab({ profile, onUpdate }: AISettingsTabProps) {
  const [newService, setNewService] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newUSP, setNewUSP] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newFAQQuestion, setNewFAQQuestion] = useState('');
  const [newFAQAnswer, setNewFAQAnswer] = useState('');

  const addService = () => {
    if (newService.trim()) {
      const services = [...(profile?.services_offered || []), newService.trim()];
      onUpdate('services_offered', services);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    const services = [...(profile?.services_offered || [])];
    services.splice(index, 1);
    onUpdate('services_offered', services);
  };

  const addValue = () => {
    if (newValue.trim()) {
      const values = [...(profile?.company_values || []), newValue.trim()];
      onUpdate('company_values', values);
      setNewValue('');
    }
  };

  const removeValue = (index: number) => {
    const values = [...(profile?.company_values || [])];
    values.splice(index, 1);
    onUpdate('company_values', values);
  };

  const addUSP = () => {
    if (newUSP.trim()) {
      const usps = [...(profile?.unique_selling_points || []), newUSP.trim()];
      onUpdate('unique_selling_points', usps);
      setNewUSP('');
    }
  };

  const removeUSP = (index: number) => {
    const usps = [...(profile?.unique_selling_points || [])];
    usps.splice(index, 1);
    onUpdate('unique_selling_points', usps);
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      const categories = [...(profile?.inquiry_categories || []), newCategory.trim()];
      onUpdate('inquiry_categories', categories);
      setNewCategory('');
    }
  };

  const removeCategory = (index: number) => {
    const categories = [...(profile?.inquiry_categories || [])];
    categories.splice(index, 1);
    onUpdate('inquiry_categories', categories);
  };

  const addFAQ = () => {
    if (newFAQQuestion.trim() && newFAQAnswer.trim()) {
      const faqs = [...(profile?.common_faqs || []), {
        question: newFAQQuestion.trim(),
        answer: newFAQAnswer.trim()
      }];
      onUpdate('common_faqs', faqs);
      setNewFAQQuestion('');
      setNewFAQAnswer('');
    }
  };

  const removeFAQ = (index: number) => {
    const faqs = [...(profile?.common_faqs || [])];
    faqs.splice(index, 1);
    onUpdate('common_faqs', faqs);
  };

  return (
    <div className="space-y-6">
      {/* AI Activation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>KI-Funktionen</CardTitle>
          </div>
          <CardDescription>
            Aktivieren Sie KI-gestützte Features für Anfragen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_categorization">Automatische Kategorisierung</Label>
              <p className="text-sm text-muted-foreground">
                Anfragen werden automatisch kategorisiert
              </p>
            </div>
            <Switch
              id="auto_categorization"
              checked={profile?.auto_categorization_enabled || false}
              onCheckedChange={(checked) => onUpdate('auto_categorization_enabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_response">Automatische Antwortvorschläge</Label>
              <p className="text-sm text-muted-foreground">
                KI generiert Antwortvorschläge für Anfragen
              </p>
            </div>
            <Switch
              id="auto_response"
              checked={profile?.auto_response_enabled || false}
              onCheckedChange={(checked) => onUpdate('auto_response_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Services & Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <CardTitle>Leistungen & Produkte</CardTitle>
          </div>
          <CardDescription>
            Welche Hauptleistungen oder Produkte bieten Sie an?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="z.B. Webentwicklung, Beratung..."
              onKeyPress={(e) => e.key === 'Enter' && addService()}
            />
            <Button onClick={addService} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.services_offered?.map((service, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {service}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeService(index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle>Zielgruppe</CardTitle>
          <CardDescription>
            Beschreiben Sie Ihre Hauptzielgruppe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={profile?.target_audience || ''}
            onChange={(e) => onUpdate('target_audience', e.target.value)}
            placeholder="z.B. KMUs in Österreich, Privatkunden, B2B-Bereich..."
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Company Values */}
      <Card>
        <CardHeader>
          <CardTitle>Unternehmenswerte</CardTitle>
          <CardDescription>
            Welche Werte vertritt Ihr Unternehmen?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="z.B. Nachhaltigkeit, Innovation..."
              onKeyPress={(e) => e.key === 'Enter' && addValue()}
            />
            <Button onClick={addValue} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.company_values?.map((value, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {value}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeValue(index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* USPs */}
      <Card>
        <CardHeader>
          <CardTitle>Alleinstellungsmerkmale (USPs)</CardTitle>
          <CardDescription>
            Was macht Sie einzigartig?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newUSP}
              onChange={(e) => setNewUSP(e.target.value)}
              placeholder="z.B. 20+ Jahre Erfahrung..."
              onKeyPress={(e) => e.key === 'Enter' && addUSP()}
            />
            <Button onClick={addUSP} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.unique_selling_points?.map((usp, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {usp}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeUSP(index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Style */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Kommunikationsstil</CardTitle>
          </div>
          <CardDescription>
            Wie soll die KI mit Kunden kommunizieren?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preferred_tone">Tonalität</Label>
            <select
              id="preferred_tone"
              value={profile?.preferred_tone || 'professional'}
              onChange={(e) => onUpdate('preferred_tone', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="formal">Formal (Sie, sehr höflich)</option>
              <option value="professional">Professionell (Sie, sachlich)</option>
              <option value="casual">Locker (Du/Sie, freundlich)</option>
              <option value="friendly">Freundschaftlich (Du, sehr persönlich)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response_template_intro">Begrüßungsvorlage</Label>
            <Textarea
              id="response_template_intro"
              value={profile?.response_template_intro || ''}
              onChange={(e) => onUpdate('response_template_intro', e.target.value)}
              placeholder="z.B. Sehr geehrte/r [Name], vielen Dank für Ihre Anfrage..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response_template_signature">Signaturvorlage</Label>
            <Textarea
              id="response_template_signature"
              value={profile?.response_template_signature || ''}
              onChange={(e) => onUpdate('response_template_signature', e.target.value)}
              placeholder="z.B. Mit freundlichen Grüßen\nIhr Team von [Firma]"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Benutzerdefinierte Kategorien</CardTitle>
          <CardDescription>
            Kategorien für die automatische Einordnung von Anfragen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="z.B. Produktanfrage, Support, Bestellung..."
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <Button onClick={addCategory} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.inquiry_categories?.map((category, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                {category}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeCategory(index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Häufige Fragen (FAQs)</CardTitle>
          <CardDescription>
            Die KI nutzt diese FAQs für bessere Antworten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={newFAQQuestion}
              onChange={(e) => setNewFAQQuestion(e.target.value)}
              placeholder="Frage..."
            />
            <Textarea
              value={newFAQAnswer}
              onChange={(e) => setNewFAQAnswer(e.target.value)}
              placeholder="Antwort..."
              className="min-h-[80px]"
            />
            <Button onClick={addFAQ} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              FAQ hinzufügen
            </Button>
          </div>

          <div className="space-y-3">
            {profile?.common_faqs?.map((faq, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm">{faq.question}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFAQ(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Spezielle KI-Anweisungen</CardTitle>
          <CardDescription>
            Zusätzliche Anweisungen für die KI bei der Antworterstellung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={profile?.ai_instructions || ''}
            onChange={(e) => onUpdate('ai_instructions', e.target.value)}
            placeholder="z.B. 'Immer auf Lieferzeiten von 3-5 Werktagen hinweisen', 'Bei Preisanfragen immer Rückfrage stellen'..."
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Wichtige Hinweise</CardTitle>
          <CardDescription>
            Informationen, die die KI beachten sollte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={profile?.important_notes || ''}
            onChange={(e) => onUpdate('important_notes', e.target.value)}
            placeholder="z.B. 'Keine Lieferung an Postfächer', 'Nur Versand innerhalb Österreichs'..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
