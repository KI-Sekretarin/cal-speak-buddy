import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CompanyProfile } from '@/types/profile';
import { Building2, Globe, MapPin, Phone } from 'lucide-react';

interface CompanyInfoTabProps {
  profile: CompanyProfile | null;
  onUpdate: (field: string, value: any) => void;
}

export function CompanyInfoTab({ profile, onUpdate }: CompanyInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Basic Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Grundlegende Firmendaten</CardTitle>
          </div>
          <CardDescription>
            Allgemeine Informationen über Ihr Unternehmen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Firmenname *</Label>
              <Input
                id="company_name"
                value={profile?.company_name || ''}
                onChange={(e) => onUpdate('company_name', e.target.value)}
                placeholder="Ihre Firma GmbH"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Branche</Label>
              <Input
                id="industry"
                value={profile?.industry || ''}
                onChange={(e) => onUpdate('industry', e.target.value)}
                placeholder="IT & Software, Handel, Dienstleistung..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_size">Unternehmensgröße</Label>
              <select
                id="company_size"
                value={profile?.company_size || ''}
                onChange={(e) => onUpdate('company_size', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Bitte wählen...</option>
                <option value="1-10">1-10 Mitarbeiter</option>
                <option value="11-50">11-50 Mitarbeiter</option>
                <option value="51-200">51-200 Mitarbeiter</option>
                <option value="201-500">201-500 Mitarbeiter</option>
                <option value="501-1000">501-1000 Mitarbeiter</option>
                <option value="1000+">1000+ Mitarbeiter</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded_year">Gründungsjahr</Label>
              <Input
                id="founded_year"
                type="number"
                value={profile?.founded_year || ''}
                onChange={(e) => onUpdate('founded_year', parseInt(e.target.value) || null)}
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_id">USt-IdNr / UID</Label>
              <Input
                id="tax_id"
                value={profile?.tax_id || ''}
                onChange={(e) => onUpdate('tax_id', e.target.value)}
                placeholder="ATU12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number">Firmenbuchnummer</Label>
              <Input
                id="registration_number"
                value={profile?.registration_number || ''}
                onChange={(e) => onUpdate('registration_number', e.target.value)}
                placeholder="FN 123456a"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_description">Firmenbeschreibung</Label>
            <Textarea
              id="company_description"
              value={profile?.company_description || ''}
              onChange={(e) => onUpdate('company_description', e.target.value)}
              placeholder="Beschreiben Sie Ihr Unternehmen in wenigen Sätzen. Diese Information wird von der KI genutzt."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Diese Beschreibung hilft der KI, passende Antworten zu generieren.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            <CardTitle>Kontaktinformationen</CardTitle>
          </div>
          <CardDescription>
            Wie können Kunden Sie erreichen?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={profile?.phone || ''}
                onChange={(e) => onUpdate('phone', e.target.value)}
                placeholder="+43 1 234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobil</Label>
              <Input
                id="mobile"
                type="tel"
                value={profile?.mobile || ''}
                onChange={(e) => onUpdate('mobile', e.target.value)}
                placeholder="+43 664 123 4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                onChange={(e) => onUpdate('email', e.target.value)}
                placeholder="office@firma.at"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={profile?.website || ''}
                onChange={(e) => onUpdate('website', e.target.value)}
                placeholder="https://www.firma.at"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fax">Fax (optional)</Label>
            <Input
              id="fax"
              type="tel"
              value={profile?.fax || ''}
              onChange={(e) => onUpdate('fax', e.target.value)}
              placeholder="+43 1 234 5678-99"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>Adresse</CardTitle>
          </div>
          <CardDescription>
            Wo befindet sich Ihr Unternehmen?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Straße</Label>
              <Input
                id="street"
                value={profile?.street || ''}
                onChange={(e) => onUpdate('street', e.target.value)}
                placeholder="Hauptstraße"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street_number">Hausnummer</Label>
              <Input
                id="street_number"
                value={profile?.street_number || ''}
                onChange={(e) => onUpdate('street_number', e.target.value)}
                placeholder="123"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">PLZ</Label>
              <Input
                id="postal_code"
                value={profile?.postal_code || ''}
                onChange={(e) => onUpdate('postal_code', e.target.value)}
                placeholder="1010"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                value={profile?.city || ''}
                onChange={(e) => onUpdate('city', e.target.value)}
                placeholder="Wien"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">Bundesland</Label>
              <Input
                id="state"
                value={profile?.state || ''}
                onChange={(e) => onUpdate('state', e.target.value)}
                placeholder="Wien"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                value={profile?.country || 'Österreich'}
                onChange={(e) => onUpdate('country', e.target.value)}
                placeholder="Österreich"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Social Media</CardTitle>
          </div>
          <CardDescription>
            Verlinken Sie Ihre Social-Media-Kanäle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={profile?.social_media?.linkedin || ''}
                onChange={(e) => onUpdate('social_media', { ...profile?.social_media, linkedin: e.target.value })}
                placeholder="firma-gmbh"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={profile?.social_media?.facebook || ''}
                onChange={(e) => onUpdate('social_media', { ...profile?.social_media, facebook: e.target.value })}
                placeholder="firma.gmbh"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={profile?.social_media?.instagram || ''}
                onChange={(e) => onUpdate('social_media', { ...profile?.social_media, instagram: e.target.value })}
                placeholder="@firma_gmbh"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">X (Twitter)</Label>
              <Input
                id="twitter"
                value={profile?.social_media?.twitter || ''}
                onChange={(e) => onUpdate('social_media', { ...profile?.social_media, twitter: e.target.value })}
                placeholder="@firma_gmbh"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
