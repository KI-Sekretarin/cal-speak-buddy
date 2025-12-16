import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Share2 } from 'lucide-react';

export default function Chat() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const [profile, setProfile] = useState<any>(null);

  // Fetch sessions and profile
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Fetch sessions
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (data) setSessions(data);
    };

    fetchData();

    // Subscribe to new sessions
    const channel = supabase
      .channel('chat_sessions_list')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_sessions'
      }, (payload) => {
        setSessions(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch messages for selected session
  useEffect(() => {
    if (!selectedSession) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedSession)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat_internal:${selectedSession}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${selectedSession}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSession]);

  const handleTyping = async () => {
    if (!selectedSession) return;

    await supabase.channel(`chat:${selectedSession}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender: 'agent' }
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedSession) return;

    const content = input.trim();
    setInput('');

    await supabase.from('chat_messages').insert({
      session_id: selectedSession,
      sender: 'agent', // Agent = Human
      content: content,
      is_processed: true // Agent messages don't need AI processing
    });
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-100px)] gap-4">
        {/* Session List */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader>
            <CardTitle>Aktive Chats</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {sessions.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">Keine aktiven Chats</div>
              )}
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-secondary/10 ${selectedSession === session.id ? 'bg-secondary/20' : ''}`}
                >
                  <div className="font-semibold">Besucher {session.visitor_token.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(session.updated_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedSession ? (
            <>
              <CardHeader className="border-b flex flex-row items-center justify-between">
                <CardTitle>Chat</CardTitle>
                {profile?.contact_form_slug && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = `${window.location.origin}/c/${profile.contact_form_slug}`;
                      navigator.clipboard.writeText(link);
                      alert('Link kopiert!');
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Link teilen
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                          <div
                            className={`p-3 rounded-2xl text-sm ${msg.sender === 'agent'
                              ? 'bg-primary text-primary-foreground'
                              : msg.sender === 'bot'
                                ? 'bg-secondary/50 border border-secondary'
                                : 'bg-secondary text-secondary-foreground'
                              }`}
                          >
                            <div className="text-xs opacity-50 mb-1">
                              {msg.sender === 'agent' ? 'Du' : msg.sender === 'bot' ? 'KI' : 'Kunde'}
                            </div>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Antworten..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Wähle einen Chat aus
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
