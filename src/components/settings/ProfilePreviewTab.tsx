import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyProfile } from '@/types/profile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProfilePreviewTabProps {
  profile: CompanyProfile | null;
}

export function ProfilePreviewTab({ profile }: ProfilePreviewTabProps) {
  const calculateCompleteness = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.company_name,
      profile.industry,
      profile.company_description,
      profile.phone,
      profile.email,
      profile.website,
      profile.street,
      profile.city,
      profile.postal_code,
      profile.services_offered?.length,
      profile.target_audience,
      profile.preferred_tone,
    ];
    
    const filled = fields.filter(f => f).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  const formatBusinessHours = (hours: any) => {
    if (!hours) return null;
    
    const dayNames: Record<string, string> = {
      monday: 'Mo',
      tuesday: 'Di',
      wednesday: 'Mi',
      thursday: 'Do',
      friday: 'Fr',
      saturday: 'Sa',
      sunday: 'So'
    };
    
    return Object.entries(hours).map(([day, time]: [string, any]) => ({
      day: dayNames[day],
      ...time
    }));
  };

  return (
    <div className="space-y-6">
      {/* Completeness Alert */}
      <Alert variant={completeness >= 70 ? 'default' : 'destructive'}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ihr Profil ist zu {completeness}% vollständig. 
          {completeness < 70 && ' Bitte vervollständigen Sie Ihr Profil für bessere KI-Antworten.'}
        </AlertDescription>
      </Alert>

      {/* Company Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>{profile?.company_name || 'Firmenname nicht angegeben'}</CardTitle>
          </div>
          {profile?.industry && (
            <CardDescription>{profile.industry}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.company_description && (
            <p className="text-sm text-muted-foreground">{profile.company_description}</p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {profile?.company_size && (
              <Badge variant="secondary">{profile.company_size} Mitarbeiter</Badge>
            )}
            {profile?.founded_year && (
              <Badge variant="secondary">Seit {profile.founded_year}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Kontaktinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.phone}</span>
            </div>
          )}
          {profile?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.email}</span>
            </div>
          )}
          {profile?.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                {profile.website}
              </a>
            </div>
          )}
          {(profile?.street || profile?.city) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {profile.street} {profile.street_number}, {profile.postal_code} {profile.city}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services */}
      {profile?.services_offered && profile.services_offered.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <CardTitle>Leistungen & Produkte</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.services_offered.map((service, index) => (
                <Badge key={index} variant="outline">{service}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Hours */}
      {profile?.business_hours && Object.keys(profile.business_hours).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Öffnungszeiten</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formatBusinessHours(profile.business_hours)?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-medium">{item.day}</span>
                  <span className={item.closed ? 'text-muted-foreground' : ''}>
                    {item.closed ? 'Geschlossen' : `${item.open} - ${item.close}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>KI-Konfiguration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Automatische Kategorisierung</span>
            {profile?.auto_categorization_enabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Automatische Antwortvorschläge</span>
            {profile?.auto_response_enabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Tonalität</span>
            <Badge variant="outline">
              {profile?.preferred_tone === 'formal' && 'Formal'}
              {profile?.preferred_tone === 'professional' && 'Professionell'}
              {profile?.preferred_tone === 'casual' && 'Locker'}
              {profile?.preferred_tone === 'friendly' && 'Freundschaftlich'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* USPs */}
      {profile?.unique_selling_points && profile.unique_selling_points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alleinstellungsmerkmale</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {profile.unique_selling_points.map((usp, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{usp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* FAQs */}
      {profile?.common_faqs && profile.common_faqs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Häufige Fragen ({profile.common_faqs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.common_faqs.slice(0, 3).map((faq, index) => (
              <div key={index} className="border-l-2 border-primary pl-3">
                <p className="font-medium text-sm">{faq.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
              </div>
            ))}
            {profile.common_faqs.length > 3 && (
              <p className="text-sm text-muted-foreground">
                + {profile.common_faqs.length - 3} weitere FAQs
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Zusätzliche Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.languages_supported && profile.languages_supported.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Sprachen</p>
              <div className="flex flex-wrap gap-2">
                {profile.languages_supported.map((lang, index) => (
                  <Badge key={index} variant="secondary">{lang}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {profile?.payment_methods && profile.payment_methods.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Zahlungsmethoden</p>
              <div className="flex flex-wrap gap-2">
                {profile.payment_methods.map((method, index) => (
                  <Badge key={index} variant="secondary">{method}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {profile?.certifications && profile.certifications.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Zertifizierungen</p>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary">{cert}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
