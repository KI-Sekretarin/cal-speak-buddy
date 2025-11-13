import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Code, Layers, Zap, BarChart, Users, Globe } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import FeatureModal from '@/components/FeatureModal';

const features = [
  { icon: Code, title: 'Schnelle Automatisierung', description: 'Erstelle Regeln & Workflows ohne Code' },
  { icon: Layers, title: 'Zentrale Inbox', description: 'E-Mail, Chat & Tickets in einer Oberfläche' },
  { icon: Zap, title: 'Integrationen', description: 'N8N, Kalender, CRMs und mehr verbinden' },
  { icon: BarChart, title: 'Insights', description: 'Metriken & KPIs für Teams' },
  { icon: Users, title: 'Team & Rollen', description: 'Fein granulare Berechtigungen & Audit-Logs' },
  { icon: Globe, title: 'Mehrsprachig', description: 'Mehrere Sprachen & Tonalitäten' },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal')) as HTMLElement[];
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('reveal-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
      <header className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#071028] to-[#021026] opacity-95" />
        <div className="relative z-10 container mx-auto py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full text-sm text-slate-200">
                Developer-first · KI-Sekretärin
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Automatisiere Kommunikation —
                <span className="text-[#2463ea]"> build faster, ship smarter</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl">
                Eine moderne Assistenz für Teams: Tickets, Termine, Chat und Workflows an einem Ort —
                optimiert für Produktivität und Developer‑workflows.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-[#2463ea] hover:brightness-110 text-white" onClick={() => navigate('/register')}>
                  Kostenlos testen
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/help')}>
                  Dokumentation
                </Button>
              </div>
            </div>

            <div>
              <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/6 bg-[#041024]">
                <div className="p-6 bg-gradient-to-b from-[#041022] to-[#062036]">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div>Project: Acme</div>
                    <div>Mode: Assist</div>
                  </div>
                  <pre className="mt-4 bg-[#061323] text-[#bfe1ff] rounded-md p-4 text-sm overflow-auto h-56">
{`# Assistent: Neues Meeting anlegen
User: Morgen 10:00
Assistant: Meeting erstellt — Einladungen versendet

# Ticket: Kunde X
Assistant: Vorschlag für Antwort generiert (Tonalität: freundlich)`}
                  </pre>
                  <div className="mt-4 flex items-center gap-3">
                    <Button size="sm" className="bg-[#1f6ae0] text-white">Integrate</Button>
                    <Button size="sm" variant="outline">Open Dashboard</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto py-20">
          <h2 className="text-3xl font-bold mb-8">Wofür Teams uns nutzen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="reveal rounded-2xl p-6 bg-card hover:shadow-2xl transition-transform hover:-translate-y-2">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#123a8b] to-[#2f7be6] text-white">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Bereit, produktiver zu arbeiten?</h3>
              <p className="text-slate-300">Teste kostenlos — keine Kreditkarte erforderlich.</p>
            </div>
            <div className="flex gap-4">
              <Button className="bg-[#2463ea] text-white">Kostenlos testen</Button>
              <Button variant="outline">Kontakt</Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
