import DashboardLayout from '@/components/DashboardLayout';
import ComingSoon from './ComingSoon';

export default function Help() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Hilfe & Dokumentation"
        description="Finde Antworten auf häufige Fragen und lerne, wie du das Dashboard optimal nutzt."
        features={[
          'FAQ-Bereich mit Suchfunktion',
          'Video-Tutorials für jedes Feature',
          'Step-by-Step Guides',
          'Kontakt zum Support-Team',
          'Release Notes und Änderungsprotokoll',
        ]}
      />
    </DashboardLayout>
  );
}
