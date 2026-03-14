import DashboardLayout from '@/components/DashboardLayout';
import CalSpeakBuddy from '@/components/CalSpeakBuddy';
import VoiceCommandHistory from '@/components/VoiceCommandHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Clock } from 'lucide-react';

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

        <Tabs defaultValue="voice" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-fit">
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              Sprachsteuerung
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              Verlauf
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="flex-1 min-h-0 mt-4">
            <CalSpeakBuddy />
          </TabsContent>

          <TabsContent value="history" className="mt-4 overflow-y-auto">
            <VoiceCommandHistory />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
