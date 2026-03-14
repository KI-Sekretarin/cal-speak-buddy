import { supabase } from '@/integrations/supabase/client';

const WHISPER_URL = import.meta.env.VITE_WHISPER_URL || 'http://localhost:9000';

export async function transcribeAudio(blob: Blob): Promise<{ text: string; duration?: number }> {
  const formData = new FormData();
  formData.append('file', blob, 'recording.wav');

  const response = await fetch(`${WHISPER_URL}/transcribe-file`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Transkription fehlgeschlagen: ${response.statusText}`);
  }

  return response.json();
}

export async function executeVoiceCommand(
  text: string,
  token: string | null,
  dryRun: boolean
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${WHISPER_URL}/process-command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, auth_token: token, dry_run: dryRun }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function logVoiceCommand(
  userId: string,
  command: string,
  intent?: string,
  summary?: string
): Promise<void> {
  try {
    await supabase.from('activity_logs').insert({
      action: 'voice_command',
      entity_type: 'calendar',
      entity_id: userId,
      voice_command: command,
      details: { intent, summary },
    });
  } catch (error) {
    console.error('Failed to log voice command:', error);
  }
}
