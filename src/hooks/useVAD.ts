import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVADProps {
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    minVolume?: number; // Minimum volume to trigger speech (0-1)
    silenceDelay?: number; // How long to wait before triggering onSpeechEnd (ms)
}

export const useVAD = ({
    onSpeechStart,
    onSpeechEnd,
    minVolume = 0.02,
    silenceDelay = 1500
}: UseVADProps) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const requestRef = useRef<number>();
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isSpeakingRef = useRef(false);

    // Use refs for callbacks to avoid re-creating startVAD when callbacks change
    const onSpeechStartRef = useRef(onSpeechStart);
    const onSpeechEndRef = useRef(onSpeechEnd);

    useEffect(() => {
        onSpeechStartRef.current = onSpeechStart;
        onSpeechEndRef.current = onSpeechEnd;
    }, [onSpeechStart, onSpeechEnd]);


    const startVAD = useCallback(async (stream: MediaStream) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const audioContext = audioContextRef.current;

        // Ensure context is running (it might be suspended by browser policies)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.4;
        analyserRef.current = analyser;

        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        microphoneRef.current = microphone;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
            analyser.getByteFrequencyData(dataArray);

            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const normalizedVolume = average / 255; // 0 to 1

            setVolume(normalizedVolume);

            if (normalizedVolume > minVolume) {
                // Speech detected
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = null;
                }

                if (!isSpeakingRef.current) {
                    isSpeakingRef.current = true;
                    setIsSpeaking(true);
                    onSpeechStartRef.current?.();
                }
            } else {
                // Silence detected
                if (isSpeakingRef.current && !silenceTimerRef.current) {
                    silenceTimerRef.current = setTimeout(() => {
                        isSpeakingRef.current = false;
                        setIsSpeaking(false);
                        onSpeechEndRef.current?.();
                        silenceTimerRef.current = null;
                    }, silenceDelay);
                }
            }

            requestRef.current = requestAnimationFrame(update);
        };

        update();
    }, [minVolume, silenceDelay]); // Callbacks removed from dependencies

    const stopVAD = useCallback(() => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }

        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }

        if (microphoneRef.current) {
            microphoneRef.current.disconnect();
            microphoneRef.current = null;
        }

        // Don't close AudioContext to reuse it, just disconnect nodes
        // but typically we can leave it open

        setIsSpeaking(false);
        setVolume(0);
        isSpeakingRef.current = false;
    }, []);

    useEffect(() => {
        return () => {
            stopVAD();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [stopVAD]);

    return { isSpeaking, volume, startVAD, stopVAD };
};
