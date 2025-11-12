import DashboardLayout from '@/components/DashboardLayout';
import ComingSoon from './ComingSoon';

export default function Kiosk() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Kiosk-Modul"
        description="Smart Empfangs-Kiosk mit Logo-Erkennung für Touchscreens. Erkennt Besucherfirmen automatisch und zeigt relevante Meeting-Informationen."
        features={[
          'Webcam-Integration für Badge-Scanning',
          'Logo-Erkennung mit TensorFlow.js (lokal, keine Cloud)',
          'Automatische Begrüßungsseite basierend auf Firma',
          'Meeting-Details und Rauminformationen',
          'Automatische Benachrichtigung des Gastgebers (E-Mail/SMS)',
          'Datenschutz-konform: Lokale Speicherung, keine Cloud-Uploads',
        ]}
      />
    </DashboardLayout>
  );
}
