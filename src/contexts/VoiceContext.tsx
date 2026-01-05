import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

interface VoiceContextType {
    events: any[];
    setEvents: (events: any[]) => void;
    lastUpdated: Date | null;
    setLastUpdated: (date: Date | null) => void;
    isFetchingInitial: boolean;
    refreshEvents: (silent?: boolean) => Promise<void>;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isFetchingInitial, setIsFetchingInitial] = useState(false);

    const refreshEvents = useCallback(async (silent: boolean = true) => {
        const token = localStorage.getItem('google_calendar_token');
        if (!token) return;

        if (!silent) setIsFetchingInitial(true);

        try {
            const response = await fetch('http://localhost:9000/process-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: "Zeige meine Termine für heute",
                    auth_token: token,
                    dry_run: false
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.intent === 'list_events' && Array.isArray(data.data)) {
                    setEvents(data.data);
                    setLastUpdated(new Date());
                }
            }
        } catch (error) {
            console.error('Background fetch failed:', error);
        } finally {
            setIsFetchingInitial(false);
        }
    }, []);

    // Initial background fetch on mount - only if empty
    useEffect(() => {
        const token = localStorage.getItem('google_calendar_token');
        if (token && events.length === 0 && !lastUpdated) {
            refreshEvents(true);
        }
    }, [refreshEvents, events.length, lastUpdated]);

    return (
        <VoiceContext.Provider value={{
            events,
            setEvents,
            lastUpdated,
            setLastUpdated,
            isFetchingInitial,
            refreshEvents
        }}>
            {children}
        </VoiceContext.Provider>
    );
}

export function useVoice() {
    const context = useContext(VoiceContext);
    if (context === undefined) {
        throw new Error('useVoice must be used within a VoiceProvider');
    }
    return context;
}
