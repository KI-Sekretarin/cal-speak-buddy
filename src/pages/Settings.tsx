import DashboardLayout from '@/components/DashboardLayout';
import ComingSoon from './ComingSoon';

export default function Settings() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Einstellungen"
        description="Verwalte dein Profil, Integrationen und Benachrichtigungen."
        features={[
          'Profilverwaltung: Name, E-Mail, Passwort ändern',
          'Zwei-Faktor-Authentifizierung',
          'Integration-Management: Google Calendar, E-Mail, Chat-Dienste',
          'Benachrichtigungseinstellungen',
          'Datenschutz & Sicherheit: Datenexport (GDPR)',
          'Sprache & Erscheinungsbild: Dark Mode, Font-Size',
        ]}
      />
    </DashboardLayout>
  );
}
