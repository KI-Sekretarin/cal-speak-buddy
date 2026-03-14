import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { executeVoiceCommand } from '@/services/whisperService';

const TOKEN_EXPIRY_MS = 50 * 60 * 1000; // 50 Minuten

interface VoiceContextType {
    events: any[];
    setEvents: (events: any[]) => void;
    lastUpdated: Date | null;
    setLastUpdated: (date: Date | null) => void;
    isFetchingInitial: boolean;
    refreshEvents: (silent?: boolean) => Promise<void>;
    googleToken: string | null;
    setGoogleToken: (token: string | null) => void;
    tokenSetAt: Date | null;
    isTokenExpired: () => boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isFetchingInitial, setIsFetchingInitial] = useState(false);

    const [googleToken, setGoogleTokenState] = useState<string | null>(
        () => localStorage.getItem('google_calendar_token')
    );
    const [tokenSetAt, setTokenSetAt] = useState<Date | null>(() => {
        const stored = localStorage.getItem('google_calendar_token_set_at');
        return stored ? new Date(stored) : null;
    });

    const setGoogleToken = useCallback((token: string | null) => {
        if (token) {
            const now = new Date();
            localStorage.setItem('google_calendar_token', token);
            localStorage.setItem('google_calendar_token_set_at', now.toISOString());
            setTokenSetAt(now);
        } else {
            localStorage.removeItem('google_calendar_token');
            localStorage.removeItem('google_calendar_token_set_at');
            setTokenSetAt(null);
        }
        setGoogleTokenState(token);
    }, []);

    const isTokenExpired = useCallback((): boolean => {
        if (!tokenSetAt) return true;
        return Date.now() - tokenSetAt.getTime() > TOKEN_EXPIRY_MS;
    }, [tokenSetAt]);

    const refreshEvents = useCallback(async (silent: boolean = true) => {
        if (!googleToken) return;

        if (!silent) setIsFetchingInitial(true);

        try {
            const data = await executeVoiceCommand("Zeige meine Termine für heute", googleToken, false);
            if (data?.status === 'success' && data?.intent === 'list_events' && Array.isArray(data.data)) {
                setEvents(data.data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Background fetch failed:', error);
        } finally {
            setIsFetchingInitial(false);
        }
    }, [googleToken]);

    // Initial background fetch on mount - only if empty
    useEffect(() => {
        if (googleToken && events.length === 0 && !lastUpdated) {
            refreshEvents(true);
        }
    }, [refreshEvents, events.length, lastUpdated, googleToken]);

    // Sync token from storage events (other tabs)
    useEffect(() => {
        const handleStorage = () => {
            const token = localStorage.getItem('google_calendar_token');
            const setAt = localStorage.getItem('google_calendar_token_set_at');
            setGoogleTokenState(token);
            setTokenSetAt(setAt ? new Date(setAt) : null);
        };
        window.addEventListener('storage', handleStorage);
        window.addEventListener('google_token_updated', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('google_token_updated', handleStorage);
        };
    }, []);

    return (
        <VoiceContext.Provider value={{
            events,
            setEvents,
            lastUpdated,
            setLastUpdated,
            isFetchingInitial,
            refreshEvents,
            googleToken,
            setGoogleToken,
            tokenSetAt,
            isTokenExpired,
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
