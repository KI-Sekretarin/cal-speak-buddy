import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ChatWidget from '@/components/ChatWidget';
import { Loader2 } from 'lucide-react';

export default function PublicChat() {
    const { slug } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [visitorToken, setVisitorToken] = useState<string>('');

    useEffect(() => {
        // Generate or retrieve visitor token
        let token = localStorage.getItem('chat_visitor_token');
        if (!token) {
            token = crypto.randomUUID();
            localStorage.setItem('chat_visitor_token', token);
        }
        setVisitorToken(token);

        const fetchProfile = async () => {
            if (!slug) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('id, company_name, logo_url, chat_primary_color, chat_welcome_message, chat_suggested_questions')
                .eq('contact_form_slug', slug)
                .single();

            if (data) {
                setProfile(data);
            }
            setLoading(false);
        };

        fetchProfile();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Firma nicht gefunden</h1>
                    <p className="text-muted-foreground">Der angeforderte Chat existiert nicht.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    {profile.logo_url && (
                        <img src={profile.logo_url} alt={profile.company_name} className="w-16 h-16 mx-auto mb-4 rounded-full object-cover" />
                    )}
                    <h1 className="text-2xl font-bold">{profile.company_name}</h1>
                    <p className="text-muted-foreground">Kundenservice Chat</p>
                </div>
                <ChatWidget
                    companyId={profile.id}
                    companyName={profile.company_name || 'Support'}
                    visitorToken={visitorToken}
                    primaryColor={profile.chat_primary_color}
                    welcomeMessage={profile.chat_welcome_message}
                    suggestedQuestions={profile.chat_suggested_questions}
                    contactSlug={slug}
                />
            </div>
        </div>
    );
}

