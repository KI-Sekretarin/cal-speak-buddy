import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type Feature = {
  title: string;
  image: string;
  longDescription?: string;
  bullets?: string[];
};

export default function FeatureModal({
  open,
  feature,
  onClose,
}: {
  open: boolean;
  feature: Feature | null;
  onClose: () => void;
}) {
  if (!open || !feature) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 max-w-3xl w-full mx-4">
  <div className="bg-slate-800 text-slate-100 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/30">
          <div className="relative">
            <img src={feature.image} alt={feature.title} className="w-full h-64 object-cover opacity-95" />
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/80 dark:bg-black/60 shadow"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
            {feature.longDescription && <p className="text-muted-foreground mb-4">{feature.longDescription}</p>}

            {feature.bullets && (
              <ul className="mb-4 list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {feature.bullets.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>
                Schließen
              </Button>
              <Button onClick={() => {
                // keep minimal: navigate to contact or feature-specific route could be added
                onClose();
                // optional: open contact or signup flow in future
              }}>
                Jetzt starten
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
