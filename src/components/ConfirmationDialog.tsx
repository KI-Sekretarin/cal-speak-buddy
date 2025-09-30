import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Calendar, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Meeting } from './MeetingCard';

interface ConfirmationDialogProps {
  isVisible: boolean;
  title: string;
  message: string;
  details?: any;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isVisible,
  title,
  message,
  details,
  onConfirm,
  onCancel,
  confirmText = "Bestätigen",
  cancelText = "Abbrechen",
  type = 'info'
}) => {
  if (!isVisible) return null;

  const typeConfig = {
    success: { icon: CheckCircle, color: 'text-accent', bgColor: 'bg-accent/10' },
    warning: { icon: Clock, color: 'text-voice-processing', bgColor: 'bg-voice-processing/10' },
    danger: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
    info: { icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  // Render meeting details if provided
  const renderMeetingDetails = (meeting: Meeting) => (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
      <h4 className="font-semibold text-sm">Meeting-Details:</h4>
      
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{meeting.title}</span>
        </div>
        
        {meeting.start_time && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(meeting.start_time), 'EEEE, dd.MM.yyyy \'um\' HH:mm', { locale: de })} Uhr
              {meeting.end_time && (
                <span className="text-muted-foreground">
                  {' - '}{format(new Date(meeting.end_time), 'HH:mm')} Uhr
                </span>
              )}
            </span>
          </div>
        )}
        
        {meeting.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{meeting.location}</span>
          </div>
        )}
        
        {meeting.attendees && meeting.attendees.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {meeting.attendees.map((attendee, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {attendee.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-elegant animate-scale-in">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <IconComponent className={`h-8 w-8 ${config.color}`} />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {message}
          </p>
          
          {/* Render meeting details if available */}
          {details?.meeting && renderMeetingDetails(details.meeting)}
          
          {/* Render other details */}
          {details && !details.meeting && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
              <pre className="whitespace-pre-wrap text-muted-foreground">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button 
              variant={type === 'danger' ? 'destructive' : 'hero'} 
              className="flex-1" 
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};