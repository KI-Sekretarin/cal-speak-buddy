import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CompanyProfile } from '@/types/profile';
import { Clock, Globe, CreditCard, Truck, Award, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import GoogleCalendarConnect from '@/components/GoogleCalendarConnect';
import EmailSyncButton from '@/components/EmailSyncButton';

interface AdditionalFeaturesTabProps {
  profile: CompanyProfile | null;
  onUpdate: (field: string, value: any) => void;
}

export function AdditionalFeaturesTab({ profile, onUpdate }: AdditionalFeaturesTabProps) {
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newDeliveryArea, setNewDeliveryArea] = useState('');
  const [newService, setNewService] = useState('');

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames: Record<string, string> = {
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag'
  };

  const updateBusinessHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const hours = profile?.business_hours ? { ...profile.business_hours } : {};
    if (!hours[day]) {
      hours[day] = { open: '09:00', close: '17:00' };
    }

    if (field === 'closed') {
      hours[day].closed = value as boolean;
    } else {
      hours[day][field] = value as string;
    }

    onUpdate('business_hours', hours);
  };

  const addItem = (field: string, value: string, setter: (val: string) => void) => {
    if (value.trim()) {
      const items = [...(profile?.[field as keyof CompanyProfile] as string[] || []), value.trim()];
      onUpdate(field, items);
      setter('');
    }
  };

  const removeItem = (field: string, index: number) => {
    const items = [...(profile?.[field as keyof CompanyProfile] as string[] || [])];
    items.splice(index, 1);
    onUpdate(field, items);
  };

  return (
    <div className="space-y-6">
      {/* Integrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Integrationen</CardTitle>
          </div>
          <CardDescription>
            Verbinden Sie externe Dienste mit Ihrem Account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-4">
            <GoogleCalendarConnect onTokenChange={() => { }} />
            <EmailSyncButton />
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Öffnungszeiten</CardTitle>
          </div>
          <CardDescription>
            Wann ist Ihr Unternehmen erreichbar?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {daysOfWeek.map((day) => {
            const hours = profile?.business_hours?.[day];
            const isClosed = hours?.closed || false;

            return (
              <div key={day} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Label className="text-sm">{dayNames[day]}</Label>
                </div>
                <div className="col-span-3">
                  <Input
                    type="time"
                    value={hours?.open || '09:00'}
                    onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                    disabled={isClosed}
                    className="h-9"
                  />
                </div>
                <div className="col-span-1 text-center text-sm text-muted-foreground">
                  bis
                </div>
                <div className="col-span-3">
                  <Input
                    type="time"
                    value={hours?.close || '17:00'}
                    onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                    disabled={isClosed}
                    className="h-9"
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    variant={isClosed ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => updateBusinessHours(day, 'closed', !isClosed)}
                    className="w-full h-9"
                  >
                    {isClosed ? 'Geschlossen' : 'Offen'}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Services Offered */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <CardTitle>Angebotene Dienstleistungen</CardTitle>
          </div>
          <CardDescription>
            Welche Dienstleistungen bieten Sie generell an?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="z.B. Beratung, Installation, Wartung..."
              onKeyPress={(e) => e.key === 'Enter' && addItem('services_offered', newService, setNewService)}
            />
            <Button onClick={() => addItem('services_offered', newService, setNewService)} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.services_offered?.map((service, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {service}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeItem('services_offered', index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Unterstützte Sprachen</CardTitle>
          </div>
          <CardDescription>
            In welchen Sprachen können Sie kommunizieren?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="z.B. Deutsch, Englisch, Französisch..."
              onKeyPress={(e) => e.key === 'Enter' && addItem('languages_supported', newLanguage, setNewLanguage)}
            />
            <Button onClick={() => addItem('languages_supported', newLanguage, setNewLanguage)} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.languages_supported?.map((lang, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {lang}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeItem('languages_supported', index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Zahlungsmethoden</CardTitle>
          </div>
          <CardDescription>
            Welche Zahlungsarten akzeptieren Sie?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              placeholder="z.B. Rechnung, Kreditkarte, PayPal..."
              onKeyPress={(e) => e.key === 'Enter' && addItem('payment_methods', newPaymentMethod, setNewPaymentMethod)}
            />
            <Button onClick={() => addItem('payment_methods', newPaymentMethod, setNewPaymentMethod)} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.payment_methods?.map((method, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {method}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeItem('payment_methods', index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Areas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            <CardTitle>Liefergebiete</CardTitle>
          </div>
          <CardDescription>
            Wohin liefern oder bieten Sie Ihre Dienste an?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newDeliveryArea}
              onChange={(e) => setNewDeliveryArea(e.target.value)}
              placeholder="z.B. Österreich, Deutschland, EU..."
              onKeyPress={(e) => e.key === 'Enter' && addItem('delivery_areas', newDeliveryArea, setNewDeliveryArea)}
            />
            <Button onClick={() => addItem('delivery_areas', newDeliveryArea, setNewDeliveryArea)} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.delivery_areas?.map((area, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {area}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeItem('delivery_areas', index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <CardTitle>Zertifizierungen & Auszeichnungen</CardTitle>
          </div>
          <CardDescription>
            Welche Zertifikate oder Auszeichnungen hat Ihr Unternehmen?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              placeholder="z.B. ISO 9001, ÖCERT, Auszeichnungen..."
              onKeyPress={(e) => e.key === 'Enter' && addItem('certifications', newCertification, setNewCertification)}
            />
            <Button onClick={() => addItem('certifications', newCertification, setNewCertification)} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.certifications?.map((cert, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {cert}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeItem('certifications', index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
