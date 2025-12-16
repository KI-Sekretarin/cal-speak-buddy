import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { profile, loading, saving, updateProfile } = useCompanyProfile();
  const [localProfile, setLocalProfile] = useState<CompanyProfile | null>(null);
  const { toast } = useToast();

  // Sync local state with loaded profile
  useEffect(() => {
    if (profile && !localProfile && !loading) {
      setLocalProfile(profile);
    }
  }, [profile, loading]);

  const handleUpdate = (field: string, value: any) => {
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

    const updates = {
      ...localProfile,
      profile_completed: true,
    };

    const result = await updateProfile(updates);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Einstellungen</h1>
            <p className="text-muted-foreground mt-1">
              Verwalten Sie Ihr Firmenprofil und KI-Einstellungen
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

        <Tabs defaultValue={new URLSearchParams(window.location.search).get('tab') || "company"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto">
            <TabsTrigger value="company">Firmendaten</TabsTrigger>
            <TabsTrigger value="products">Sortiment</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="ai">KI-Einstellungen</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="preview">Vorschau</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <CompanyInfoTab
              profile={localProfile || profile}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab profile={localProfile || profile} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatSettingsTab
              profile={localProfile || profile}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="ai">
            <AISettingsTab
              profile={localProfile || profile}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="features">
            <AdditionalFeaturesTab
              profile={localProfile || profile}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="preview">
            <ProfilePreviewTab profile={localProfile || profile} />
          </TabsContent>
        </Tabs>

        {/* Save button at bottom */}
        <div className="flex justify-end pt-6 border-t">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Alle Änderungen speichern
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
