import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, Mail, MessageSquare, Sparkles } from 'lucide-react';
import { useState } from 'react';
import FeatureModal from '@/components/FeatureModal';

// Hero and feature images — switched to AI-generated images using Pollinations (prompt-based)
// These endpoints generate images on-the-fly from the prompt. If you prefer stable, download and host images locally.
const featureImages = [
  'https://image.pollinations.ai/prompt/AI%20assistant%20in%20a%20modern%20office%20environment%2C%20soft%20pastel%20colors%2C%20high%20detail%2C%20isometric',
  'https://image.pollinations.ai/prompt/automated%20ticketing%20system%20visualization%2C%20clean%20UI%2C%20data%20flow%2C%20illustration',
  'https://image.pollinations.ai/prompt/chatbot%20integration%20with%20web%20chat%20widget%2C%20friendly%20ai%20character%2C%20vector%20art',
  'https://image.pollinations.ai/prompt/ai%20suggestions%20and%20templates%2C%20digital%20assistant%2C%20futuristic%20UI',
  'https://image.pollinations.ai/prompt/automations%20and%20workflows%20connected%20by%20lines%2C%20business%20process%2C%20isometric',
  'https://image.pollinations.ai/prompt/analytics%20dashboard%20with%20charts%20and%20insights%2C%20modern%20ui%2C%20illustration'
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const features = [
    {
      icon: Mic,
      title: 'Sprachsteuerung',
      description: 'Befehle per Sprache ausführen und Termine erstellen',
      longDescription:
        'Nutze natürliche Sprache, um Meetings zu planen, Notizen zu erstellen und E-Mails zu diktieren. Unsere Sprachsteuerung ist robust gegenüber Dialekten und optimiert für kurze, präzise Befehle.',
      bullets: ['Terminplanung per Sprachbefehl', 'Diktat von E-Mails & Notizen', 'Mehrsprachige Erkennung'],
      image: featureImages[0],
    },
    {
      icon: Mail,
      title: 'Ticket-Management',
      description: 'Anfragen verwalten mit KI-gestützten Antworten',
      longDescription:
        'Ein zentrales Ticket-System hilft Support- und Office-Teams, Anfragen effizient zu priorisieren. KI-Vorschläge sorgen für konsistente und schnelle Antworten.',
      bullets: ['Automatische Priorisierung', 'Vorformulierte KI-Antworten', 'Zuweisung an Teammitglieder'],
      image: featureImages[1],
    },
    {
      icon: MessageSquare,
      title: 'Chat-Integration',
      description: 'Automatische Chatbot-Antworten für häufige Fragen',
      longDescription:
        'Integriere den Chatbot in Website oder interne Tools. Er beantwortet FAQs, sammelt Informationen und leitet komplexe Fälle an menschliche Mitarbeiter weiter.',
      bullets: ['Sofort-Antworten', 'Fallback an Mitarbeiter', 'Kontextbewusste Antworten'],
      image: featureImages[2],
    },
    {
      icon: Sparkles,
      title: 'KI-Vorschläge',
      description: 'Intelligente Antwortvorschläge für schnellere Bearbeitung',
      longDescription:
        'Unsere KI analysiert Konversationen und schlägt passende Antwortentwürfe vor — angepasst an Tonalität, Kundenprofil und Unternehmensrichtlinien.',
      bullets: ['Tonalität anpassbar', 'Schnelle Antwort-Templates', 'Lernfähiges System'],
      image: featureImages[3],
    },
    {
      icon: Sparkles,
      title: 'Automatisierte Workflows',
      description: 'Routineträger automatisieren, Zeit sparen',
      longDescription:
        'Definiere Trigger und Aktionen für wiederkehrende Aufgaben — z. B. automatische Follow-ups, Terminbestätigungen und Datentransfer in CRMs.',
      bullets: ['Trigger-basiert', 'Integration in Dritt-Services', 'N8N-Ready Export'],
      image: featureImages[4],
    },
    {
      icon: Sparkles,
      title: 'Analytics & Insights',
      description: 'Metriken und KPIs zur Performance-Optimierung',
      longDescription:
        'Dashboard und Reports zeigen Antwortzeiten, Zufriedenheit und Topics — so erkennst du Verbesserungsbereiche und quantifizierst den Nutzen.',
      bullets: ['Antwortzeit-Metriken', 'Themen-Cluster', 'Export für BI-Tools'],
      image: featureImages[5],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center filter brightness-75 dark:brightness-50"
          aria-hidden
        />
        <div className="relative z-10 container mx-auto py-28">
          <div className="bg-white/60 dark:bg-black/50 backdrop-blur-md rounded-3xl p-10 md:p-16 shadow-glow">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="h-5 w-5" />
                  Premium KI Assistent
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Deine digitale
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> KI-Sekretärin</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Verwalte Anfragen, Termine und E-Mails mit einem visuellen, kartenbasierten Interface
                  – unterstützt durch intelligente KI-Antworten und automatisierte Workflows.
                </p>
                <div className="flex flex-wrap gap-4">
                  {user ? (
                    <Button onClick={() => navigate('/admin')} size="lg" className="shadow-elegant">
                      Zum Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => navigate('/register')} size="lg" className="shadow-elegant">
                        Kostenlos starten
                      </Button>
                      <Button onClick={() => navigate('/login')} size="lg" variant="outline">
                        Anmelden
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="hidden md:block">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-400">
                    <img loading="lazy" src={featureImages[0]} alt="feature" className="w-full h-48 object-cover" />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-400">
                    <img loading="lazy" src={featureImages[1]} alt="feature" className="w-full h-48 object-cover" />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-400">
                    <img loading="lazy" src={featureImages[2]} alt="feature" className="w-full h-48 object-cover" />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-400">
                    <img loading="lazy" src={featureImages[3]} alt="feature" className="w-full h-48 object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Card Grid */}
      <section className="container mx-auto py-20">
        <h2 className="text-3xl font-bold mb-8">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <article
              key={i}
              className="group rounded-2xl overflow-hidden border bg-card hover:shadow-2xl transition-transform transform hover:-translate-y-2"
            >
              <div className="relative h-48">
                <img
                  src={f.image || featureImages[i % featureImages.length]}
                  alt={f.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-4 bottom-4">
                  <h3 className="text-white text-lg font-semibold">{f.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-4">{f.description}</p>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <button
                      className="text-sm text-muted-foreground underline hover:no-underline"
                      onClick={() => {
                        setSelectedFeature(f);
                        setModalOpen(true);
                      }}
                    >
                      Mehr erfahren
                    </button>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/contact')}>
                    Kontakt
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Feature Modal */}
      <FeatureModal
        open={modalOpen}
        feature={selectedFeature}
        onClose={() => {
          setModalOpen(false);
          setSelectedFeature(null);
        }}
      />

      {/* How it works */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-8">So funktioniert's</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-xl p-6 bg-card shadow">
            <h3 className="font-semibold mb-2">1. Verbinden</h3>
            <p className="text-muted-foreground">Verbinde deine Kanäle (E-Mail, Chat, Kalender) mit wenigen Klicks.</p>
          </div>
          <div className="rounded-xl p-6 bg-card shadow">
            <h3 className="font-semibold mb-2">2. Automatisieren</h3>
            <p className="text-muted-foreground">Lege Regeln und Workflows fest – wiederkehrende Aufgaben laufen automatisch.</p>
          </div>
          <div className="rounded-xl p-6 bg-card shadow">
            <h3 className="font-semibold mb-2">3. Optimieren</h3>
            <p className="text-muted-foreground">Nutze Insights und KI-Vorschläge, um Prozesse kontinuierlich zu verbessern.</p>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-gradient-to-tr from-primary/6 to-transparent py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Preise, die mitwachsen</h2>
          <p className="text-muted-foreground mb-8">Kostenlose Testphase, transparente Pakete und flexible Team-Optionen.</p>
          <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card shadow">
              <div className="text-xl font-semibold mb-2">Starter</div>
              <div className="text-2xl font-bold mb-4">Kostenlos</div>
              <ul className="text-sm text-muted-foreground mb-4">
                <li>Basale KI-Funktionen</li>
                <li>1 Projekt</li>
              </ul>
              <Button variant="outline">Loslegen</Button>
            </div>
            <div className="p-6 rounded-xl bg-primary text-white shadow-lg">
              <div className="text-xl font-semibold mb-2">Business</div>
              <div className="text-2xl font-bold mb-4">€29 / Monat</div>
              <ul className="text-sm mb-4">
                <li>Alle Kernfunktionen</li>
                <li>Team-Accounts</li>
              </ul>
              <Button>Jetzt testen</Button>
            </div>
            <div className="p-6 rounded-xl bg-card shadow">
              <div className="text-xl font-semibold mb-2">Enterprise</div>
              <div className="text-2xl font-bold mb-4">Auf Anfrage</div>
              <ul className="text-sm text-muted-foreground mb-4">
                <li>Individuelle Integrationen</li>
                <li>Unterstützung & SLA</li>
              </ul>
              <Button variant="ghost">Kontakt</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-8">Was unsere Nutzer sagen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl p-6 bg-card shadow">
            <p className="text-muted-foreground mb-4">"Unsere Antwortzeiten haben sich halbiert. Die KI hilft täglich."</p>
            <div className="text-sm font-medium">Maria H., Office Manager</div>
          </div>
          <div className="rounded-xl p-6 bg-card shadow">
            <p className="text-muted-foreground mb-4">"Die Sprachfunktion spart uns viele Klicks — besonders unterwegs."</p>
            <div className="text-sm font-medium">Lukas P., Vertriebsleiter</div>
          </div>
          <div className="rounded-xl p-6 bg-card shadow">
            <p className="text-muted-foreground mb-4">"Einfache Integration in N8N – Automatisierungen laufen stabil."</p>
            <div className="text-sm font-medium">Startup X</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-8">Häufige Fragen</h2>
        <div className="space-y-4 max-w-3xl">
          <details className="p-4 bg-card rounded-lg">
            <summary className="font-medium">Ist das System DSGVO-konform?</summary>
            <p className="mt-2 text-muted-foreground">Wir bieten DSGVO-konforme Speicherung und rollenbasierte Zugriffe; für Enterprise-Kunden können weitere Maßnahmen vereinbart werden.</p>
          </details>
          <details className="p-4 bg-card rounded-lg">
            <summary className="font-medium">Welche Integrationen gibt es?</summary>
            <p className="mt-2 text-muted-foreground">Kalender, E-Mail, Zapier, N8N und gängige CRMs; individuelle Integrationen sind möglich.</p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-tr from-primary/10 to-accent/10 py-16 mt-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit, Zeit zu sparen?</h2>
          <p className="text-lg text-muted-foreground mb-6">Teste die KI-Sekretärin kostenlos und sieh selbst.</p>
          {!user && (
            <Button onClick={() => navigate('/register')} size="lg" className="shadow-elegant">
              Kostenlos testen
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
