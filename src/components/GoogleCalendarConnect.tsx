import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoogleCalendarConnectProps {
    onTokenChange: (token: string | null) => void;
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({ onTokenChange }) => {
    const { toast } = useToast();
    const [isConnected, setIsConnected] = useState(false);

    // Check for existing token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('google_calendar_token');
        if (storedToken) {
            setIsConnected(true);
            onTokenChange(storedToken);
        }
    }, [onTokenChange]);

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log('Google Login Success:', tokenResponse);
            const token = tokenResponse.access_token;

            // Store token
            localStorage.setItem('google_calendar_token', token);
            window.dispatchEvent(new Event('google_token_updated'));
            setIsConnected(true);
            onTokenChange(token);

            toast({
                title: "Verbunden!",
                description: "Dein Google Konto (Kalender & Mail) ist verknüpft.",
            });
        },
        onError: () => {
            toast({
                title: "Fehler",
                description: "Verbindung zu Google fehlgeschlagen.",
                variant: "destructive",
            });
        },
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.modify',
    });

    const logout = () => {
        localStorage.removeItem('google_calendar_token');
        setIsConnected(false);
        onTokenChange(null);
        toast({
            title: "Getrennt",
            description: "Verbindung zu Google wurde getrennt.",
        });
    };

    if (isConnected) {
        return (
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Google Konto verbunden</p>
                    <p className="text-xs text-green-700 dark:text-green-300">Kalender & E-Mails bereit</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Google Konto verbinden</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Für Kalender & E-Mail-Import</p>
                </div>
            </div>
            <Button
                onClick={() => login()}
                className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
            >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" />
                Mit Google verbinden
            </Button>
        </div>
    );
};

export default GoogleCalendarConnect;
