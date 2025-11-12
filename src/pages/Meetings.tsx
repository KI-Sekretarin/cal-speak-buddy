import DashboardLayout from '@/components/DashboardLayout';
import ComingSoon from './ComingSoon';

export default function Meetings() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Meeting-Webseiten Generator"
        description="Erstelle automatisch personalisierte Begrüßungsseiten für Meetings basierend auf Kalender-Einträgen."
        features={[
          'Automatische Generierung aus Google Calendar Events',
          'Logo-Integration und Branding',
          'Meeting-Details: Datum, Zeit, Teilnehmer, Raum',
          'KI-generierte Willkommenstexte',
          'Mobile-optimierte Vorschau',
          'QR-Code für einfachen Zugriff',
        ]}
      />
    </DashboardLayout>
  );
}
