import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Code, Layers, Zap, BarChart, Users, Globe, Star } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import FeatureModal from '@/components/FeatureModal';
type Feature = {
  icon?: any;
  title: string;
  description: string;
  image?: string;
  longDescription?: string;
  bullets?: string[];
};
const features: Feature[] = [{
  icon: Code,
  title: 'Schnelle Automatisierung',
  description: 'Erstelle Regeln & Workflows ohne Code',
  image: '/src/assets/hero-ai-assistant.jpg',
  longDescription: 'Automatisiere wiederkehrende Aufgaben: Termine planen, Einladungen versenden, Antworten vorschlagen und vieles mehr — alles mit wenigen Regeln.',
  bullets: ['No-code Workflows', 'Trigger & Bedingungen', 'Vorlagenbibliothek']
}, {
  icon: Layers,
  title: 'Zentrale Inbox',
  description: 'E-Mail, Chat & Tickets in einer Oberfläche',
  image: '/src/assets/hero-ai-assistant.jpg',
  longDescription: 'Alle Kanäle an einem Ort: Priorisieren, delegieren und mit KI-Vorschlägen schneller antworten.',
  bullets: ['Unified view', 'Mentions & Snooze', 'SLA & Priorisierung']
}, {
  icon: Zap,
  title: 'Integrationen',
  description: 'N8N, Kalender, CRMs und mehr verbinden',
  image: '/src/assets/hero-ai-assistant.jpg',
  longDescription: 'Verbinde bestehende Tools mit wenigen Klicks und synchronisiere Termine, Kontakte und Tickets.',
  bullets: ['Kalender-Sync', 'CRM-Connector', 'Webhook & API']
}, {
  icon: BarChart,
  title: 'Insights',
  description: 'Metriken & KPIs für Teams',
  image: '/src/assets/hero-ai-assistant.jpg',
  longDescription: 'Dashboard & Reports helfen dir, Antwortzeiten, Auslastung und Team-Performance zu verstehen und zu verbessern.',
  bullets: ['Custom Dashboards', 'Export & Alerts', 'Team KPIs']
}, {
  icon: Users,
  title: 'Team & Rollen',
  description: 'Fein granulare Berechtigungen & Audit-Logs',
  image: '/src/assets/hero-ai-assistant.jpg',
  longDescription: 'Verwalte Rollen, Zugriffsrechte und Audit-Logs zentral — ideal für wachsende Teams.',
  bullets: ['Rollenzuweisung', 'Audit-Logs', 'SSO & Provisioning']
}, {
  icon: Globe,
  title: 'Mehrsprachig',
  description: 'Mehrere Sprachen & Tonalitäten',
  image: '/src/assets/hero-ai-assistant.jpg',
  longDescription: 'Automatische Übersetzungen und Tonalitätseinstellungen für Antworten in mehreren Sprachen.',
  bullets: ['Autom. Übersetzung', 'Tonalitäts-Profile', 'Locale-Support']
}];
const testimonials = [{
  name: 'Anna Müller, Product Lead',
  quote: 'cal-speak-buddy hat unsere Meeting-Organisation halbiert — und die Teamkommunikation spürbar verbessert.'
}, {
  name: 'Tom Berger, IT-Admin',
  quote: 'Einfache Integration mit unserem Kalender und CRM. Setup in wenigen Minuten.'
}];
export default function Index() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal')) as HTMLElement[];
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('reveal-visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  return <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
      <header className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#071028] to-[#021026] opacity-95" />
        <div className="relative z-10 container mx-auto py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full text-sm text-slate-200">
                Developer-first · KI-Sekretärin
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">Automatisiere Kommunikation —
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6fb3ff] via-[#2463ea] to-[#4b2be6]"> build faster, ship smarter</span>
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl">Eine moderne Assistenz für Teams: Tickets, Termine, Chat und Workflows an einem Ort — optimiert für Produktivität und Developer‑Workflows. KI-gestützte Vorschläge reduzieren Routineaufgaben und geben deinem Team Zeit für Wichtiges.</p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-[#2463ea] hover:brightness-110 text-white" onClick={() => navigate('/register')}>
                  Kostenlos testen
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/help')} className="bg-[#2463ea]">
                  Dokumentation
                </Button>
                <Button size="lg" variant="ghost" onClick={() => window.scrollTo({
                top: 800,
                behavior: 'smooth'
              })}>
                  Mehr erfahren
                </Button>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="inline-flex items-center gap-3 bg-white/3 px-3 py-2 rounded-full text-sm">
                  <Star className="h-4 w-4 text-yellow-400" /> Trusted by teams
                </div>
                <div className="text-sm text-slate-400">Über 1.200+ aktive Nutzer · 99.9% Uptime</div>
              </div>
            </div>

            <div>
              <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/6 bg-[#041024]">
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
                    <Button size="sm" variant="outline" className="bg-[#1f6ae0]">Open Dashboard</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="features" className="container mx-auto py-20">
          <h2 className="text-3xl font-bold mb-4">Wofür Teams uns nutzen</h2>
          <p className="text-slate-400 max-w-2xl mb-8">Von Schnellantworten bis zu komplexen Workflows — cal-speak-buddy hilft Teams, weniger Zeit mit Routine zu verbringen und mehr Impact zu erzeugen.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => <button key={i} onClick={() => {
            setSelectedFeature(f);
            setModalOpen(true);
          }} className="reveal text-left rounded-2xl p-6 bg-slate-800/90 text-slate-100 hover:shadow-2xl transition-transform hover:-translate-y-2 focus:outline-none">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#123a8b] to-[#2f7be6] text-white">
                    {f.icon && <f.icon className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm text-slate-200">{f.description}</p>
                  </div>
                </div>
              </button>)}
          </div>
        </section>

        <section className="py-12 bg-slate-900">
          <div className="container mx-auto grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Was du mit cal-speak-buddy erreichst</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li>Automatisiere Terminorganisation und wiederkehrende Tasks.</li>
                <li>Vereine Kommunikation aus E-Mail, Chat und Tickets an einem Ort.</li>
                <li>Messbare Team-Insights & einfache Integrationen in bestehende Tools.</li>
              </ul>
            </div>

            <div>
              <div className="rounded-lg p-6 bg-gradient-to-br from-[#0b1220] to-[#071022] ring-1 ring-white/6">
                <h4 className="text-lg font-semibold mb-2">Kostenlos starten</h4>
                <p className="text-sm text-slate-400 mb-4">Starte in Minuten — keine Kreditkarte erforderlich. Upgrade jederzeit möglich.</p>
                <div className="flex gap-3">
                  <Button className="bg-[#2463ea] text-white" onClick={() => navigate('/register')}>Jetzt testen</Button>
                  <Button variant="outline" onClick={() => navigate('/contact')} className="bg-[#2463ea]">Kontakt</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto py-16">
          <h3 className="text-2xl font-bold mb-6">Was Kunden sagen</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => <div key={idx} className="rounded-2xl p-6 bg-slate-800/90 text-slate-100">
                <blockquote className="text-slate-100">“{t.quote}”</blockquote>
                <div className="mt-4 text-sm text-slate-300">— {t.name}</div>
              </div>)}
          </div>
        </section>

        <section className="py-12 bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="container mx-auto text-center">
            <h3 className="text-2xl font-bold">Bereit, produktiver zu arbeiten?</h3>
            <p className="text-slate-300 mb-6">Teste kostenlos — keine Kreditkarte erforderlich.</p>
            <div className="flex items-center justify-center gap-4">
              <Button className="bg-[#2463ea] text-white">Kostenlos testen</Button>
              <Button variant="outline" className="bg-[#2463ea]">Demo anfragen</Button>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 mt-12">
          <div className="container mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">© {new Date().getFullYear()} cal-speak-buddy — KI-Sekretärin</div>
            <div className="flex items-center gap-4">
              <a className="text-sm text-slate-300 hover:underline" href="/privacy">Datenschutz</a>
              <a className="text-sm text-slate-300 hover:underline" href="/terms">AGB</a>
            </div>
          </div>
        </footer>

        <FeatureModal open={modalOpen} feature={selectedFeature as any} onClose={() => setModalOpen(false)} />
      </main>
    </div>;
}