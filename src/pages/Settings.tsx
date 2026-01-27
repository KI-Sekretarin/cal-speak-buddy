import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useCompanyProfile } from '@/hooks/use-company-profile';
import { CompanyInfoTab } from '@/components/settings/CompanyInfoTab';
import { AISettingsTab } from '@/components/settings/AISettingsTab';
import { AdditionalFeaturesTab } from '@/components/settings/AdditionalFeaturesTab';
import { ChatSettingsTab } from '@/components/settings/ChatSettingsTab';
import { ProductsTab } from '@/components/settings/ProductsTab';
import { ProfilePreviewTab } from '@/components/settings/ProfilePreviewTab';
import { CompanyProfile } from '@/types/profile';
import { Save, Loader2 } from 'lucide-react';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const { profile, loading, saving, updateProfile } = useCompanyProfile();
  const [localProfile, setLocalProfile] = useState<CompanyProfile | null>(null);
  const [activeSection, setActiveSection] = useState("profile");

  // Sync local state with loaded profile
  useEffect(() => {
    if (profile && !localProfile && !loading) {
      setLocalProfile(profile);
    }
  }, [profile, loading]);

  const handleUpdate = (field: string, value: unknown) => {
    const currentProfile = localProfile || profile;
    if (currentProfile) {
      setLocalProfile({
        ...currentProfile,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!localProfile) return;

    // Construct the updates object with local changes
    const updates = {
      ...localProfile,
      profile_completed: true,
    };

    // Filter out fields that are not in the profiles table to avoid update errors
    const validKeys = [
      'company_name', 'industry', 'company_size', 'founded_year', 'tax_id', 'registration_number',
      'phone', 'mobile', 'fax', 'email', 'website', 'social_media',
      'street', 'street_number', 'postal_code', 'city', 'state', 'country',
      'business_hours', 'company_description', 'services_offered', 'target_audience', 'company_values', 'unique_selling_points',
      'preferred_tone', 'preferred_language', 'response_template_intro', 'response_template_signature',
      'common_faqs', 'inquiry_categories', 'ai_instructions', 'auto_response_enabled', 'auto_categorization_enabled',
      'important_notes', 'logo_url', 'brand_colors', 'profile_completed', 'certifications', 'languages_supported',
      'payment_methods', 'delivery_areas', 'contact_form_slug', 'contact_form_title', 'contact_form_description'
    ];

    const sanitizedUpdates: Partial<CompanyProfile> = {};

    // Handle special mappings
    if (localProfile.chat_primary_color || profile?.chat_primary_color) {
      const color = localProfile.chat_primary_color || profile?.chat_primary_color;
      sanitizedUpdates.brand_colors = {
        ...(localProfile.brand_colors || profile?.brand_colors || {}),
        primary: color // Map chat_primary_color to brand_colors.primary
      };
    }

    Object.keys(updates).forEach(key => {
      if (validKeys.includes(key)) {
        // Priority to localProfile updates, but updates object is already merged
        sanitizedUpdates[key] = updates[key as keyof CompanyProfile];
      }
    });

    const result = await updateProfile(sanitizedUpdates);

    if (result.success) {
      setLocalProfile(null); // Reset to trigger reload
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            {/* General Info & Contact (from CompanyInfoTab) */}
            <CompanyInfoTab
              profile={localProfile || profile}
              onUpdate={handleUpdate}
            />

            {/* Branding - Start (Manually added for now from ChatSettingsTab color picker) */}
            <Card>
              <CardHeader>
                <CardTitle>Markenauftritt</CardTitle>
                <CardDescription>
                  Passen Sie das visuelle Erscheinungsbild an.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chat_primary_color">Primärfarbe (Chat & Branding)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="chat_primary_color"
                        type="color"
                        value={localProfile?.chat_primary_color || profile?.chat_primary_color || '#000000'}
                        onChange={(e) => handleUpdate('chat_primary_color', e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={localProfile?.chat_primary_color || profile?.chat_primary_color || '#000000'}
                        onChange={(e) => handleUpdate('chat_primary_color', e.target.value)}
                        placeholder="#000000"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Branding - End */}
          </div>
        );
      case "business":
        return (
          <div className="space-y-6">
            <ProductsTab profile={localProfile || profile} />
            <AdditionalFeaturesTab
              profile={localProfile || profile}
              onUpdate={handleUpdate}
            />
          </div>
        );
      case "communication":
        return (
          <div className="space-y-6">
            {/* Wrapped ChatSettingsTab, will need to hide the color picker via prop later or just ignore duality for a moment */}
            <ChatSettingsTab
              profile={localProfile || profile}
              onUpdate={handleUpdate}
            />
          </div>
        );
      case "ai":
        return (
          <AISettingsTab
            profile={localProfile || profile}
            onUpdate={handleUpdate}
          />
        );
      case "preview":
        return <ProfilePreviewTab profile={localProfile || profile} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold">Einstellungen</h1>
            <p className="text-muted-foreground mt-1">
              Verwalten Sie alle Aspekte Ihres Unternehmens zentral.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <SettingsSidebar activeSection={activeSection} onSelect={setActiveSection} />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
