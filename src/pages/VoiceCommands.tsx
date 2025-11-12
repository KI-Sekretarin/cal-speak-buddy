import DashboardLayout from '@/components/DashboardLayout';
import CalSpeakBuddy from '@/components/CalSpeakBuddy';

export default function VoiceCommands() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sprachsteuerung</h1>
          <p className="text-muted-foreground mt-2">
            Verwende Sprachbefehle um Termine zu erstellen, Anfragen abzurufen und mehr.
          </p>
        </div>
        <CalSpeakBuddy />
      </div>
    </DashboardLayout>
  );
}
