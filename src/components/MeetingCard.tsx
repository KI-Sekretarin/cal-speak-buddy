import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees: Array<{ name: string; email?: string }>;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_by?: string;
}

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Meeting['status']) => void;
}

const statusConfig = {
  scheduled: { label: 'Geplant', variant: 'default' as const, color: 'bg-blue-500' },
  in_progress: { label: 'Läuft', variant: 'secondary' as const, color: 'bg-green-500' },
  completed: { label: 'Abgeschlossen', variant: 'outline' as const, color: 'bg-gray-500' },
  cancelled: { label: 'Abgesagt', variant: 'destructive' as const, color: 'bg-red-500' },
};

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const startTime = new Date(meeting.start_time);
  const endTime = new Date(meeting.end_time);
  const isToday = format(startTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isPast = startTime < new Date();
  
  const config = statusConfig[meeting.status];

  return (
    <Card className={`transition-all duration-300 hover:shadow-elegant ${isToday ? 'ring-2 ring-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {meeting.title}
              {isToday && (
                <Badge variant="secondary" className="text-xs">
                  Heute
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(startTime, 'EEE, dd.MM.yyyy', { locale: de })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.color}`} />
            <Badge variant={config.variant} className="text-xs">
              {config.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {meeting.description && (
          <p className="text-sm text-muted-foreground">
            {meeting.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {meeting.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{meeting.location}</span>
            </div>
          )}

          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{meeting.attendees.length} Teilnehmer</span>
            </div>
          )}
        </div>

        {meeting.attendees && meeting.attendees.length > 0 && (
          <div className="border-t pt-3">
            <h5 className="text-sm font-medium mb-2">Teilnehmer:</h5>
            <div className="flex flex-wrap gap-2">
              {meeting.attendees.map((attendee, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {attendee.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(meeting)}
              className="flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Bearbeiten
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(meeting.id)}
              className="flex items-center gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Löschen
            </Button>
          </div>

          {!isPast && meeting.status === 'scheduled' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onStatusChange(meeting.id, 'in_progress')}
            >
              Starten
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};