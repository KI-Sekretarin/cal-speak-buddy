import DashboardLayout from '@/components/DashboardLayout';
import CalSpeakBuddy from '@/components/CalSpeakBuddy';

export default function VoiceCommands() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Sprachsteuerung</h1>
          <p className="text-muted-foreground mt-2">
            Verwende Sprachbefehle um Termine zu erstellen, Anfragen abzurufen und mehr.
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <CalSpeakBuddy />
        </div>
      </div>
    </DashboardLayout>
  );
}
