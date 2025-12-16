import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

const EmailSyncButton: React.FC = () => {
    const { toast } = useToast();
    const [isScanning, setIsScanning] = useState(false);

    const navigate = useNavigate();
    const handleScan = async () => {
        const token = localStorage.getItem('google_calendar_token');
        if (!token) {
            navigate('/settings?tab=features');
            return;
        }

        setIsScanning(true);
        try {
            // Get current user ID to associate with inquiries
            const { data: { user } } = await supabase.auth.getUser();

            const response = await fetch('http://localhost:9000/scan-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auth_token: token,
                    user_id: user?.id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Scan failed');
            }

            const data = await response.json();

            if (data.status === 'error') {
                throw new Error(data.message || 'Unbekannter Server-Fehler');
            }

            toast({
                title: "Scan abgeschlossen",
                description: `${data.count} neue E-Mail(s) zu Tickets konvertiert.`,
            });

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Fehler beim Scannen",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <Button
            onClick={handleScan}
            disabled={isScanning}
            variant="outline"
            className="w-full gap-2"
        >
            {isScanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <RefreshCw className="h-4 w-4" />
            )}
            {isScanning ? "Scanne E-Mails..." : "E-Mails abrufen"}
        </Button>
    );
};

export default EmailSyncButton;
