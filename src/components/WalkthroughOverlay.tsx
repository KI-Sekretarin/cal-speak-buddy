import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, MessageSquare, Settings, Calendar, CheckCircle, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgGradient: string;
}

const steps: Step[] = [
    {
        title: "Willkommen bei deiner KI-Sekretärin",
        description: "Dein persönlicher Assistent für Termine, Anrufe und Kundenanfragen. Lass uns kurz durchstarten!",
        icon: CheckCircle,
        color: "text-emerald-500",
        bgGradient: "from-emerald-500/20 to-emerald-500/5",
    },
    {
        title: "Sprachsteuerung",
        description: "Erstelle, verschiebe oder lösche Termine einfach mit deiner Stimme. Klicke auf das Mikrofon-Symbol im Dashboard.",
        icon: Mic,
        color: "text-blue-500",
        bgGradient: "from-blue-500/20 to-blue-500/5",
    },
    {
        title: "Öffentlicher Chat",
        description: "Teile deinen persönlichen Chat-Link. Deine KI beantwortet Kundenanfragen automatisch basierend auf deinem Profil.",
        icon: MessageSquare,
        color: "text-purple-500",
        bgGradient: "from-purple-500/20 to-purple-500/5",
    },
    {
        title: "Sortiment & KI-Wissen",
        description: "Pflege deine Produkte und Dienstleistungen unter 'Einstellungen', damit die KI immer die richtige Antwort parat hat.",
        icon: Settings,
        color: "text-orange-500",
        bgGradient: "from-orange-500/20 to-orange-500/5",
    },
    {
        title: "Google Kalender",
        description: "Verbinde deinen Kalender, damit die KI freie Termine finden und Buchungen direkt eintragen kann.",
        icon: Calendar,
        color: "text-red-500",
        bgGradient: "from-red-500/20 to-red-500/5",
    },
];

export function WalkthroughOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Check local storage on mount
        const hasSeen = localStorage.getItem('walkthrough_completed');
        if (!hasSeen) {
            setIsOpen(true);
        }

        // Listen for manual trigger
        const handleStart = () => {
            setCurrentStep(0);
            setIsOpen(true);
        };

        window.addEventListener('start_walkthrough', handleStart);
        return () => window.removeEventListener('start_walkthrough', handleStart);
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('walkthrough_completed', 'true');
    };

    if (!isOpen) return null;

    const step = steps[currentStep];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        key={currentStep}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: -20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className={cn(
                            "relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 shadow-2xl",
                            "bg-background/95 backdrop-blur-xl dark:bg-zinc-900/90"
                        )}
                    >
                        {/* Background Gradient Effect */}
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none", step.bgGradient)} />

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-20"
                        >
                            <X className="w-5 h-5 opacity-50" />
                        </button>

                        <div className="relative z-10 p-8 flex flex-col items-center text-center space-y-6">

                            {/* Icon Circle */}
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className={cn(
                                    "w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg mb-4",
                                    "bg-white dark:bg-zinc-800"
                                )}
                            >
                                <step.icon className={cn("w-12 h-12", step.color)} />
                            </motion.div>

                            {/* Text */}
                            <div className="space-y-2">
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold tracking-tight"
                                >
                                    {step.title}
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg text-muted-foreground leading-relaxed"
                                >
                                    {step.description}
                                </motion.p>
                            </div>

                            {/* Progress Dots */}
                            <div className="flex gap-2 pt-4">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                            idx === currentStep ? "bg-primary w-8" : "bg-primary/20"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Action Button */}
                            <div className="w-full pt-4">
                                <Button
                                    size="lg"
                                    className="w-full h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                                    onClick={handleNext}
                                >
                                    {currentStep === steps.length - 1 ? "Loslegen" : "Weiter"}
                                    {currentStep !== steps.length - 1 && <ArrowRight className="ml-2 w-5 h-5" />}
                                </Button>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
