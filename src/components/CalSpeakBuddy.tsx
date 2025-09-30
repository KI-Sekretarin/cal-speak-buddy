import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VoiceInterface } from '@/components/VoiceInterface';
import { MeetingCard, type Meeting } from '@/components/MeetingCard';
import { MeetingForm } from '@/components/MeetingForm';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Calendar, Plus, Mic, Bot, Clock, Users, Sparkles } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface VoiceCommandResult {
  success: boolean;
  message: string;
  meeting?: Meeting;
  meetings?: Meeting[];
  deletedMeeting?: Meeting;
  needsConfirmation?: boolean;
}

interface ConfirmationState {
  isVisible: boolean;
  title: string;
  message: string;
  details?: any;
  action?: () => void;
  type?: 'success' | 'warning' | 'danger' | 'info';
}

const CalSpeakBuddy: React.FC = () => {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isVisible: false,
    title: '',
    message: ''
  });

  // Load meetings on component mount
  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our Meeting interface
      const transformedMeetings: Meeting[] = (data || []).map(meeting => ({
        ...meeting,
        description: meeting.description || undefined,
        location: meeting.location || undefined,
        attendees: Array.isArray(meeting.attendees) 
          ? meeting.attendees.filter((a): a is { name: string; email?: string } => 
              typeof a === 'object' && a !== null && 'name' in a && typeof a.name === 'string'
            )
          : []
      }));
      
      setMeetings(transformedMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast({
        title: "Fehler",
        description: "Meetings konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    setIsProcessingVoice(true);
    
    try {
      const response = await fetch(`https://bqwfcixtbnodxuoixxkk.supabase.co/functions/v1/voice-commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzMzODgsImV4cCI6MjA3NDQ0OTM4OH0._VAHEgxoMlLCIjxuXsiUpcplXxdbnvIqJYkyjlXHBkQ`
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        throw new Error('Voice command processing failed');
      }

      const result: VoiceCommandResult = await response.json();
      
      if (result.success) {
        if (result.needsConfirmation) {
          // Show confirmation dialog
          setConfirmation({
            isVisible: true,
            title: result.meeting ? "Meeting erstellt" : result.deletedMeeting ? "Meeting gelöscht" : "Aktion ausgeführt",
            message: result.message,
            details: result.meeting ? { meeting: result.meeting } : result.deletedMeeting ? { meeting: result.deletedMeeting } : null,
            type: result.deletedMeeting ? 'warning' : 'success',
            action: () => {
              loadMeetings(); // Refresh meetings
              setConfirmation({ ...confirmation, isVisible: false });
            }
          });
        } else {
          toast({
            title: "Erfolgreich",
            description: result.message,
          });
          if (result.meetings) {
            setMeetings(result.meetings);
          }
        }
      } else {
        toast({
          title: "Befehl nicht verstanden",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast({
        title: "Fehler",
        description: "Sprachbefehl konnte nicht verarbeitet werden",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleSaveMeeting = async (meetingData: Partial<Meeting>) => {
    try {
      if (selectedMeeting) {
        // Update existing meeting
        const { error } = await supabase
          .from('meetings')
          .update(meetingData)
          .eq('id', selectedMeeting.id);

        if (error) throw error;
        
        toast({
          title: "Meeting aktualisiert",
          description: "Das Meeting wurde erfolgreich gespeichert",
        });
      } else {
        // Create new meeting - prepare data for Supabase
        const insertData = {
          title: meetingData.title || '',
          description: meetingData.description || null,
          start_time: meetingData.start_time || '',
          end_time: meetingData.end_time || '',
          location: meetingData.location || null,
          attendees: meetingData.attendees || [],
          status: 'scheduled' as const
        };

        const { error } = await supabase
          .from('meetings')
          .insert(insertData);

        if (error) throw error;
        
        toast({
          title: "Meeting erstellt",
          description: "Das Meeting wurde erfolgreich erstellt",
        });
      }
      
      setIsFormVisible(false);
      setSelectedMeeting(null);
      loadMeetings();
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast({
        title: "Fehler",
        description: "Meeting konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    setConfirmation({
      isVisible: true,
      title: "Meeting löschen",
      message: "Möchten Sie dieses Meeting wirklich löschen?",
      type: 'danger',
      action: async () => {
        try {
          const { error } = await supabase
            .from('meetings')
            .delete()
            .eq('id', id);

          if (error) throw error;
          
          toast({
            title: "Meeting gelöscht",
            description: "Das Meeting wurde erfolgreich gelöscht",
          });
          
          loadMeetings();
        } catch (error) {
          console.error('Error deleting meeting:', error);
          toast({
            title: "Fehler",
            description: "Meeting konnte nicht gelöscht werden",
            variant: "destructive",
          });
        }
        setConfirmation({ ...confirmation, isVisible: false });
      }
    });
  };

  const handleStatusChange = async (id: string, status: Meeting['status']) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Status aktualisiert",
        description: `Meeting-Status wurde zu "${status}" geändert`,
      });
      
      loadMeetings();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  // Group meetings by date
  const groupedMeetings = meetings.reduce((groups, meeting) => {
    const date = format(new Date(meeting.start_time), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meeting);
    return groups;
  }, {} as Record<string, Meeting[]>);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Heute';
    if (isTomorrow(date)) return 'Morgen';
    return format(date, 'EEEE, dd.MM.yyyy', { locale: de });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Cal-Speak Buddy
                </h1>
                <p className="text-sm text-muted-foreground">
                  Ihre KI-Sekretärin für intelligente Kalenderverwaltung
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                KI-Powered
              </Badge>
              <Button
                variant="hero"
                size="lg"
                onClick={() => {
                  setSelectedMeeting(null);
                  setIsFormVisible(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Meeting erstellen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Interface */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="mb-6 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-voice-active" />
                    Sprachsteuerung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VoiceInterface
                    onVoiceCommand={handleVoiceCommand}
                    isProcessing={isProcessingVoice}
                  />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Übersicht
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Anstehende Termine</span>
                    <Badge variant="secondary">{meetings.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Heute</span>
                    <Badge variant="default">
                      {meetings.filter(m => isToday(new Date(m.start_time))).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Diese Woche</span>
                    <Badge variant="outline">
                      {meetings.filter(m => {
                        const meetingDate = new Date(m.start_time);
                        const nextWeek = addDays(new Date(), 7);
                        return meetingDate <= nextWeek;
                      }).length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Meetings List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Anstehende Meetings
              </h2>
              {isLoading && (
                <Badge variant="secondary" className="animate-pulse">
                  Lädt...
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : Object.keys(groupedMeetings).length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine anstehenden Meetings</h3>
                  <p className="text-muted-foreground mb-4">
                    Erstellen Sie Ihr erstes Meeting oder verwenden Sie Sprachbefehle
                  </p>
                  <Button
                    variant="hero"
                    onClick={() => {
                      setSelectedMeeting(null);
                      setIsFormVisible(true);
                    }}
                  >
                    Meeting erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      {getDateLabel(date)}
                      <Badge variant="outline" className="text-xs">
                        {dateMeetings.length} {dateMeetings.length === 1 ? 'Termin' : 'Termine'}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {dateMeetings.map((meeting) => (
                        <MeetingCard
                          key={meeting.id}
                          meeting={meeting}
                          onEdit={(meeting) => {
                            setSelectedMeeting(meeting);
                            setIsFormVisible(true);
                          }}
                          onDelete={handleDeleteMeeting}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Meeting Form Modal */}
      <MeetingForm
        meeting={selectedMeeting || undefined}
        isVisible={isFormVisible}
        onSave={handleSaveMeeting}
        onCancel={() => {
          setIsFormVisible(false);
          setSelectedMeeting(null);
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isVisible={confirmation.isVisible}
        title={confirmation.title}
        message={confirmation.message}
        details={confirmation.details}
        type={confirmation.type}
        onConfirm={() => {
          confirmation.action?.();
        }}
        onCancel={() => {
          setConfirmation({ ...confirmation, isVisible: false });
        }}
      />
    </div>
  );
};

export default CalSpeakBuddy;