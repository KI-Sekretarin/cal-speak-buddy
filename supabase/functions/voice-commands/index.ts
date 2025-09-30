import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface VoiceCommandRequest {
  command: string;
}

interface ParsedCommand {
  action: 'create' | 'update' | 'delete' | 'list' | 'unknown';
  title?: string;
  attendees?: string[];
  date?: string;
  time?: string;
  location?: string;
  meetingId?: string;
}

// Enhanced German voice command parser
function parseVoiceCommand(command: string): ParsedCommand {
  const lowerCommand = command.toLowerCase();
  
  console.log('Parsing command:', lowerCommand);

  // Create meeting patterns
  if (lowerCommand.includes('lege') || lowerCommand.includes('erstelle') || 
      lowerCommand.includes('plane') || lowerCommand.includes('termin')) {
    
    const result: ParsedCommand = { action: 'create' };
    
    // Extract title/person (mit X, für X)
    const titleMatch = lowerCommand.match(/(?:mit|für)\s+([^,\s]+(?:\s+\w+)*?)(?:\s+am|\s+um|\s*$)/);
    if (titleMatch) {
      result.title = `Meeting mit ${titleMatch[1]}`;
      result.attendees = [titleMatch[1]];
    }
    
    // Extract date (am Dienstag, am 15.10., morgen, heute)
    const datePatterns = [
      /am\s+(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)/,
      /am\s+(\d{1,2}\.?\d{0,2}\.?\d{0,4})/,
      /(morgen|heute|übermorgen)/,
    ];
    
    for (const pattern of datePatterns) {
      const match = lowerCommand.match(pattern);
      if (match) {
        result.date = match[1];
        break;
      }
    }
    
    // Extract time (um 10 Uhr, um 14:30)
    const timeMatch = lowerCommand.match(/um\s+(\d{1,2}(?:[:.]\d{2})?)(?:\s*uhr)?/);
    if (timeMatch) {
      result.time = timeMatch[1];
    }
    
    // Extract location (in/im X)
    const locationMatch = lowerCommand.match(/(?:in|im)\s+([^,\s]+(?:\s+\w+)*?)(?:\s|$)/);
    if (locationMatch) {
      result.location = locationMatch[1];
    }
    
    return result;
  }
  
  // List meetings
  if (lowerCommand.includes('zeige') || lowerCommand.includes('liste') || 
      lowerCommand.includes('termine') || lowerCommand.includes('meetings')) {
    return { action: 'list' };
  }
  
  // Delete meetings
  if (lowerCommand.includes('lösche') || lowerCommand.includes('entferne') || 
      lowerCommand.includes('absage')) {
    const result: ParsedCommand = { action: 'delete' };
    
    // Extract time for deletion
    const timeMatch = lowerCommand.match(/um\s+(\d{1,2}(?:[:.]\d{2})?)(?:\s*uhr)?/);
    if (timeMatch) {
      result.time = timeMatch[1];
    }
    
    return result;
  }
  
  return { action: 'unknown' };
}

// Convert parsed date/time to ISO string
function parseDateTime(dateStr?: string, timeStr?: string): string | null {
  if (!dateStr && !timeStr) return null;
  
  const now = new Date();
  let targetDate = new Date();
  
  // Parse date
  if (dateStr) {
    const dayNames = {
      'montag': 1, 'dienstag': 2, 'mittwoch': 3, 'donnerstag': 4,
      'freitag': 5, 'samstag': 6, 'sonntag': 0
    };
    
    if (dateStr === 'heute') {
      targetDate = new Date();
    } else if (dateStr === 'morgen') {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (dateStr === 'übermorgen') {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
    } else if (dayNames[dateStr as keyof typeof dayNames] !== undefined) {
      const targetDay = dayNames[dateStr as keyof typeof dayNames];
      const currentDay = now.getDay();
      const daysToAdd = targetDay === currentDay ? 7 : 
        (targetDay + 7 - currentDay) % 7;
      targetDate.setDate(now.getDate() + daysToAdd);
    } else if (dateStr.match(/\d/)) {
      // Handle DD.MM.YYYY or DD.MM format
      const parts = dateStr.replace(/\./g, '.').split('.');
      if (parts.length >= 2) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // 0-based
        const year = parts.length > 2 ? parseInt(parts[2]) : now.getFullYear();
        targetDate = new Date(year, month, day);
      }
    }
  }
  
  // Parse time
  if (timeStr) {
    const timeParts = timeStr.split(/[:.]/);
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
    
    targetDate.setHours(hours, minutes, 0, 0);
  } else {
    // Default to 9 AM if no time specified
    targetDate.setHours(9, 0, 0, 0);
  }
  
  return targetDate.toISOString();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { command }: VoiceCommandRequest = await req.json();
    
    if (!command) {
      throw new Error('No command provided');
    }

    console.log('Processing voice command:', command);
    
    const parsed = parseVoiceCommand(command);
    console.log('Parsed command:', parsed);

    let result: any = { success: false, message: 'Unbekannter Befehl' };

    switch (parsed.action) {
      case 'create': {
        const startTime = parseDateTime(parsed.date, parsed.time);
        if (!startTime) {
          result = { 
            success: false, 
            message: 'Bitte geben Sie ein Datum und eine Uhrzeit an.',
            needsConfirmation: true,
            suggestedAction: 'create_with_details'
          };
          break;
        }

        // Default end time is 1 hour later
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);

        const meetingData = {
          title: parsed.title || 'Neues Meeting',
          description: `Erstellt per Sprachbefehl: "${command}"`,
          start_time: startTime,
          end_time: endTime.toISOString(),
          location: parsed.location || null,
          attendees: parsed.attendees ? parsed.attendees.map(name => ({ name })) : [],
          created_by: 'Sprachassistent',
          status: 'scheduled'
        };

        const { data: meeting, error } = await supabase
          .from('meetings')
          .insert(meetingData)
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        // Log the action
        await supabase.from('activity_logs').insert({
          action: 'create_meeting',
          entity_type: 'meeting',
          entity_id: meeting.id,
          voice_command: command,
          details: { parsed }
        });

        result = {
          success: true,
          message: `Meeting "${meetingData.title}" wurde für ${new Date(startTime).toLocaleString('de-DE')} erstellt.`,
          meeting,
          needsConfirmation: true
        };
        break;
      }

      case 'list': {
        const { data: meetings, error } = await supabase
          .from('meetings')
          .select('*')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(10);

        if (error) throw error;

        const upcomingCount = meetings?.length || 0;
        const message = upcomingCount > 0 
          ? `Sie haben ${upcomingCount} anstehende Termine.`
          : 'Sie haben keine anstehenden Termine.';

        result = {
          success: true,
          message,
          meetings: meetings || []
        };
        break;
      }

      case 'delete': {
        if (parsed.time) {
          // Find meeting by time today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const timeHour = parseInt(parsed.time.split(/[:.]/)[0]);
          
          const { data: meetings, error } = await supabase
            .from('meetings')
            .select('*')
            .gte('start_time', today.toISOString())
            .lt('start_time', tomorrow.toISOString());

          if (error) throw error;

          const targetMeeting = meetings?.find(m => {
            const meetingHour = new Date(m.start_time).getHours();
            return meetingHour === timeHour;
          });

          if (targetMeeting) {
            const { error: deleteError } = await supabase
              .from('meetings')
              .delete()
              .eq('id', targetMeeting.id);

            if (deleteError) throw deleteError;

            await supabase.from('activity_logs').insert({
              action: 'delete_meeting',
              entity_type: 'meeting',
              entity_id: targetMeeting.id,
              voice_command: command,
              details: { parsed }
            });

            result = {
              success: true,
              message: `Meeting "${targetMeeting.title}" um ${parsed.time} Uhr wurde gelöscht.`,
              deletedMeeting: targetMeeting,
              needsConfirmation: true
            };
          } else {
            result = {
              success: false,
              message: `Kein Meeting um ${parsed.time} Uhr heute gefunden.`
            };
          }
        } else {
          result = {
            success: false,
            message: 'Bitte geben Sie eine Uhrzeit für das zu löschende Meeting an.'
          };
        }
        break;
      }

      default:
        result = {
          success: false,
          message: `Entschuldigung, ich habe den Befehl "${command}" nicht verstanden. Versuchen Sie: "Lege ein Meeting mit [Name] am [Tag] um [Zeit] an"`
        };
    }

    console.log('Command result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Voice command error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Ein Fehler ist aufgetreten beim Verarbeiten des Befehls.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});