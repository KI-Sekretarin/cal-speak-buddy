import DashboardLayout from '@/components/DashboardLayout';
import ComingSoon from './ComingSoon';

export default function Chat() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Chat-Integration"
        description="Verwalte Chat-Nachrichten aus verschiedenen Kanälen mit KI-gestützten Antwortvorschlägen."
        features={[
          'Integration mit MS Teams und Slack',
          'Automatische KI-Antwortvorschläge für häufige Fragen',
          'Chat-Threads chronologisch organisiert',
          'Nachrichtenstatus: Gesendet, Gelesen, Beantwortet',
          'Human-Handoff für komplexe Anfragen',
        ]}
      />
    </DashboardLayout>
  );
}
