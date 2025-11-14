import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, Mail, MessageSquare, Sparkles, Zap, TrendingUp, Brain, Clock, CheckCircle, Users } from 'lucide-react';
import { useState } from 'react';
import FeatureModal from '@/components/FeatureModal';

// Premium images from Pexels and Unsplash - carefully curated for each feature
// NOTE: Replace the file at `public/uploaded-hero.jpg` with the image you uploaded.
const heroImage = 'https://images.unsplash.com/photo-1677442d019cecf3da6888533cda230f904896700?auto=format&fit=crop&w=2000&q=80';
const uploadedHero = '/uploaded-hero.jpg';

const featureImages = {
  voice: 'https://www.homeandsmart.de/var/site/storage/images/_aliases/fixed_col_8_sm_2x/7/6/3/5/425367-1-ger-DE/sprachsteuerung-smart-home-cover.jpg',
  tickets: 'https://www.givainc.com/images/ticket_management.png',
  chat: 'https://framerusercontent.com/images/g0YTRh7uRHpbWQgSZz62bO050.png?width=1378&height=880',
  suggestions: 'https://image.brigitte.de/11674268/t/jC/v2/w1440/r1.5/-/e-mail-knigge-bild.jpg',
  automation: 'https://www.omnitracker.com/assets/images/041_News/omninet-omnitracker-bpmn-rpa-automation-740x470__FitMaxWzEyODAsMTAyNF0.jpg',
  analytics: 'https://www.weka.io/wp-content/uploads/files/2021/09/modern-analytic.jpg'
};

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const features = [
    {
      icon: Mic,
      title: 'Sprachsteuerung & Diktat',
      description: 'Freihändige Befehle per Sprache ausführen',
      longDescription:
        'Nutze natürliche Sprache, um Meetings zu planen, Notizen zu erstellen und E-Mails zu diktieren. Unsere Sprachsteuerung ist robust gegenüber Dialekten und optimiert für kurze, präzise Befehle.',
      bullets: [
        'Terminplanung per Sprachbefehl',
        'Diktat von E-Mails & Notizen in Echtzeit',
        'Mehrsprachige Erkennung (DE, EN, FR, ES)',
        'Offline-Verarbeitung möglich',
        'Kontextuelle Vervollständigung'
      ],
      stats: [
        { value: '95%', label: 'Genauigkeit' },
        { value: '3 Sek', label: 'Verarbeitung' }
      ],
      image: featureImages.voice,
    },
    {
      icon: Mail,
      title: 'Intelligentes Ticket-Management',
      description: 'Zentrale Verwaltung aller Anfragen mit KI',
      longDescription:
        'Ein zentrales Ticket-System hilft Support- und Office-Teams, Anfragen effizient zu priorisieren. KI-Vorschläge sorgen für konsistente und schnelle Antworten. Automatische Kategorisierung reduziert manuelle Arbeit.',
      bullets: [
        'Automatische Priorisierung nach Urgenz',
        'KI-Antwortvorschläge in Echtzeit',
        'Zuweisung an beste Teammitglieder',
        'SLA-Tracking & Erinnerungen',
        'Batch-Verarbeitung mehrerer Tickets'
      ],
      stats: [
        { value: '60%', label: 'Zeit gespart' },
        { value: '24 Std', label: 'Bearbeitungszeit' }
      ],
      image: featureImages.tickets,
    },
    {
      icon: MessageSquare,
      title: 'Chat-Integration & Chatbot',
      description: 'Automatische Antworten 24/7',
      longDescription:
        'Integriere den Chatbot in Website oder interne Tools. Er beantwortet FAQs, sammelt Informationen und leitet komplexe Fälle an menschliche Mitarbeiter weiter. Training auf deinen Dokumenten.',
      bullets: [
        'Sofort-Antworten zu häufigen Fragen',
        'Intelligenter Fallback an Mitarbeiter',
        'Kontextbewusste Antworten lernen',
        'Multi-Channel Support (Web, Teams, Slack)',
        'Sentiment-Analyse zur Eskalation'
      ],
      stats: [
        { value: '80%', label: 'Selbstlösungsquote' },
        { value: '2.5 Min', label: 'Antwortzeit' }
      ],
      image: featureImages.chat,
    },
    {
      icon: Brain,
      title: 'KI-generierte Antwortvorschläge',
      description: 'Intelligente Templates für schnellere Bearbeitung',
      longDescription:
        'Unsere KI analysiert Konversationen und schlägt passende Antwortentwürfe vor — angepasst an Tonalität, Kundenprofil und Unternehmensrichtlinien. One-Click Anpassung und Versand.',
      bullets: [
        'Tonalität & Stil automatisch angepasst',
        'Schnelle Antwort-Templates mit Variablen',
        'Lernfähiges System verbessert sich täglich',
        'Compliance-Check vor Versand',
        'A/B Testing von Antworten'
      ],
      stats: [
        { value: '4x', label: 'Schneller schreiben' },
        { value: '92%', label: 'Kundenzufriedenheit' }
      ],
      image: featureImages.suggestions,
    },
    {
      icon: Zap,
      title: 'Automatisierte Workflows',
      description: 'Intelligente Routineautomatisierung',
      longDescription:
        'Definiere Trigger und Aktionen für wiederkehrende Aufgaben — z. B. automatische Follow-ups, Terminbestätigungen und Datentransfer in CRMs. Visualer Workflow-Builder, N8N-Export.',
      bullets: [
        'If-This-Then-That Workflows ohne Code',
        'Integration in Dritt-Services (CRM, ERP)',
        'N8N-Ready Export für Enterprise',
        'Conditional Logic & Delays',
        'Fehlerbehandlung & Fallback-Szenarien',
        'Echtzeit Monitoring & Logs'
      ],
      stats: [
        { value: '40h/Monat', label: 'Zeitersparnis' },
        { value: '99.9%', label: 'Zuverlässigkeit' }
      ],
      image: featureImages.automation,
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics & Reporting',
      description: 'Daten-gesteuerte Optimierung',
      longDescription:
        'Dashboard und Reports zeigen Antwortzeiten, Zufriedenheit und Topics — so erkennst du Verbesserungsbereiche und quantifizierst den Nutzen. Exportiert zu Excel, Tableau, Power BI.',
      bullets: [
        'Echtzeit-Dashboards & KPI-Tracking',
        'Antwortzeit-Metriken & Trends',
        'Themen-Cluster & Top-Keywords',
        'Export für BI-Tools (Power BI, Tableau)',
        'Vorhersagen & Anomalieerkennung',
        'Custom Reports & Schedulierung'
      ],
      stats: [
        { value: '50+', label: 'Metriken' },
        { value: '1 Min', label: 'Report-Gen' }
      ],
      image: featureImages.analytics,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Überarbeitet, angepasst an bestehendes Farbschema */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                Produktiv durch KI
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                Deine digitale{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">KI-Sekretärin</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Automatisiere E‑Mails, Termine und Support-Anfragen — per Sprache oder Klick. Schnell einrichten, sofort produktiver.
              </p>

              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Button onClick={() => navigate('/admin')} size="lg" className="bg-primary text-primary-foreground">
                    Zum Dashboard
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => navigate('/register')} size="lg" className="bg-primary text-primary-foreground">
                      Kostenlos starten
                    </Button>
                    <Button onClick={() => navigate('/contact')} size="lg" variant="outline" className="border-primary/20 text-primary">
                      Demo buchen
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <div className="p-4 rounded-lg bg-card border border-primary/10">
                  <div className="text-2xl font-bold text-primary">60%</div>
                  <div className="text-sm text-muted-foreground">Zeit gespart</div>
                </div>
                <div className="p-4 rounded-lg bg-card border border-primary/10">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Automatisiert</div>
                </div>
                <div className="p-4 rounded-lg bg-card border border-primary/10">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Zuverlässigkeit</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-primary/10 bg-gradient-to-br from-white/5 to-transparent p-4">
                <img loading="lazy" src={uploadedHero} alt="Produktbild" className="w-full h-72 object-cover rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Expanded Content */}
      <section className="py-32 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-5xl md:text-6xl font-black">Umfassende Feature Suite</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Alles was du brauchst, um deinen Workflow zu revolutionieren. Von Sprachsteuerung bis zu KI-gestütztem Reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <article
                key={i}
                className="group rounded-3xl overflow-hidden border border-primary/10 bg-card hover:border-primary/30 hover:shadow-2xl transition-all transform hover:-translate-y-2 duration-500"
              >
                {/* Feature Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute left-6 bottom-6 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <f.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-bold">{f.title}</h3>
                    </div>
                  </div>
                </div>

                {/* Feature Content */}
                <div className="p-8 space-y-6">
                  <p className="text-muted-foreground">{f.description}</p>

                  {/* Stats Row */}
                  {f.stats && (
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-primary/10">
                      {f.stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-2xl font-bold text-primary">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bullets */}
                  <div className="space-y-2">
                    {f.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{bullet}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all text-sm"
                      onClick={() => {
                        setSelectedFeature(f);
                        setModalOpen(true);
                      }}
                    >
                      Details anschauen
                    </button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/contact')} className="flex-1">
                      Kontakt
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
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

      {/* How it Works - Static Section with Visual Process */}
      <section className="py-32 bg-secondary/5 border-t border-b border-primary/10">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16 animate-in fade-in duration-700">
            <h2 className="text-5xl md:text-6xl font-black">So funktioniert's in 4 Schritten</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Schnelle Integration und sofortige Produktivität</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: 'Verbinden',
                description: 'Verbinde deine Kanäle (E-Mail, Chat, Teams, Slack, Kalender) mit wenigen Klicks. API-Integration oder Vorkonfigurierte Vorlagen.',
                icon: Users,
              },
              {
                step: 2,
                title: 'Trainieren',
                description: 'Lade deine Dokumente, FAQs und Richtlinien hoch. Die KI lernt deine Unternehmenskultur und Kommunikationsstil automatisch.',
                icon: Brain,
              },
              {
                step: 3,
                title: 'Automatisieren',
                description: 'Lege Regeln und Workflows fest – wiederkehrende Aufgaben laufen automatisch. Keine Code-Kenntnisse erforderlich.',
                icon: Zap,
              },
              {
                step: 4,
                title: 'Optimieren',
                description: 'Nutze Live-Insights und KI-Vorschläge, um Prozesse kontinuierlich zu verbessern. Messbare ROI-Steigerung.',
                icon: TrendingUp,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Connection Line */}
                {idx < 3 && (
                  <div className="hidden md:block absolute left-[58%] top-12 w-[calc(100%+1rem)] h-1 bg-gradient-to-r from-primary/30 to-transparent group-hover:from-primary/60 transition-all" />
                )}

                <div className="relative rounded-2xl p-8 bg-card border border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-500 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-gradient-to-br from-primary/8 via-background to-accent/8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-4 mb-16 animate-in fade-in duration-700">
            <h2 className="text-5xl md:text-6xl font-black">Preise, die mitwachsen</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Kostenlose Testphase, transparente Pakete und flexible Team-Optionen für alle Unternehmensgrößen.
            </p>
          </div>

          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="rounded-3xl p-8 border border-primary/10 bg-card hover:border-primary/30 hover:shadow-2xl transition-all duration-500">
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold">Starter</h3>
                <div className="space-y-1">
                  <div className="text-4xl font-black">Kostenlos</div>
                  <p className="text-sm text-muted-foreground">Für kleine Projekte</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">1 Projekt</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">Basale KI-Funktionen</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">Email-Unterstützung</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">100 API-Calls/Tag</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/register')} variant="outline" className="w-full">
                Kostenlos starten
              </Button>
            </div>

            {/* Business Plan - Featured */}
            <div className="rounded-3xl p-8 border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-2xl transition-all duration-500 transform scale-105 relative">
              <div className="absolute top-6 right-6 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold">
                BELIEBT
              </div>
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold">Business</h3>
                <div className="space-y-1">
                  <div className="text-4xl font-black text-primary">€29<span className="text-lg text-muted-foreground">/Monat</span></div>
                  <p className="text-sm text-muted-foreground">Für wachsende Teams</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">Unbegrenzte Projekte</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">Alle KI-Features</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">Team-Accounts (5 Nutzer)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">10.000 API-Calls/Tag</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">Priority Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">Custom Integrationen</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/register')} className="w-full bg-primary hover:bg-primary/90">
                Jetzt testen
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-3xl p-8 border border-primary/10 bg-card hover:border-primary/30 hover:shadow-2xl transition-all duration-500">
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <div className="space-y-1">
                  <div className="text-4xl font-black">Individuell</div>
                  <p className="text-sm text-muted-foreground">Für große Organisationen</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">Alles aus Business +</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">Unbegrenzte Nutzer</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">Dedizierter Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">SLA-Garantie</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">On-Premise Option</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/contact')} variant="outline" className="w-full">
                Gespräch vereinbaren
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-b from-background to-secondary/5">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16 animate-in fade-in duration-700">
            <h2 className="text-5xl md:text-6xl font-black">Was unsere Nutzer sagen</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Vertrauen von hunderten Unternehmen weltweit</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Unsere Antwortzeiten haben sich um 60% reduziert. Die KI hilft unseren Support-Teams täglich. Absolut empfehlenswert!",
                author: "Maria H.",
                title: "Office Manager",
                company: "Tech Startup Berlin",
                rating: 5,
              },
              {
                quote: "Die Sprachfunktion spart uns viele Klicks — besonders unterwegs. Termine werden jetzt per Voice erstellt. Großartig!",
                author: "Lukas P.",
                title: "Vertriebsleiter",
                company: "Global Solutions GmbH",
                rating: 5,
              },
              {
                quote: "Einfache Integration in N8N. Automatisierungen laufen stabil und zuverlässig. Genau was wir gebraucht haben!",
                author: "Johannes K.",
                title: "CTO",
                company: "Startup X",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="rounded-2xl p-8 bg-card border border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-500">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-accent">★</span>
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t border-primary/10 pt-4">
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                  <div className="text-sm text-accent font-semibold">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-gradient-to-b from-secondary/5 to-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -mr-40" />

        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-4 mb-16 animate-in fade-in duration-700">
            <h2 className="text-5xl md:text-6xl font-black">Häufig gestellte Fragen</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Alles was du wissen möchtest</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: "Ist das System DSGVO-konform?",
                answer: "Ja, wir bieten DSGVO-konforme Speicherung mit Verschlüsselung, Datenlöschung auf Anfrage und rollenbasierte Zugriffe. Für Enterprise-Kunden können erweiterte Datenschutzmaßnahmen, Datenverarbeitung in der EU und Geschäftsgeheimnis-Verträge vereinbart werden.",
              },
              {
                question: "Welche Integrationen sind möglich?",
                answer: "Wir unterstützen E-Mail (Gmail, Outlook), Kalender, Chat-Systeme (Teams, Slack), CRMs (Salesforce, HubSpot), ERPs und Workflow-Tools wie Zapier und N8N. Custom-Integrationen sind im Business- und Enterprise-Plan möglich.",
              },
              {
                question: "Wie lange dauert das Onboarding?",
                answer: "Das Onboarding dauert typischerweise 2-4 Tage. Schritt 1: Verbindung zu deinen Systemen (1h). Schritt 2: KI Training mit deinen Daten (1-2 Tage). Schritt 3: Workflow-Setup & Testing (1 Tag). Enterprise-Kunden erhalten dediziertes Onboarding-Team.",
              },
              {
                question: "Kann ich die KI auf meine Unternehmensrichtlinien trainieren?",
                answer: "Absolut! Du kannst bis zu 1000 Dokumente hochladen (PDF, Word, Excel, etc.). Die KI lernt deine Unternehmenskultur, Kommunikationsstil und spezifische Richtlinien automatisch. Updates sind jederzeit möglich.",
              },
              {
                question: "Was passiert mit meinen Daten?",
                answer: "Deine Daten gehören dir. Wir speichern sie verschlüsselt auf EU-Servern, greifen nicht ohne Genehmigung darauf zu und löschen alles auf deine Anfrage hin. Wir verkaufen niemals Daten an Dritte.",
              },
              {
                question: "Gibt es eine Trial-Phase?",
                answer: "Ja! Der Starter-Plan ist kostenlos und unbegrenzt. Business- und Enterprise-Kunden können kostenloses 14-Tage Ausprobieren mit allen Features. Keine Kreditkarte erforderlich.",
              },
            ].map((faq, idx) => (
              <details key={idx} className="group rounded-2xl border border-primary/10 hover:border-primary/30 transition-all duration-300">
                <summary className="px-6 py-5 font-bold cursor-pointer flex items-center justify-between hover:bg-primary/5 rounded-2xl">
                  <span className="text-lg">{faq.question}</span>
                  <span className="transform group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5 pt-0 text-muted-foreground leading-relaxed border-t border-primary/10">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -top-40 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl -bottom-40" />

        <div className="container mx-auto text-center relative z-10">
          <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                Bereit, deine Produktivität zu revolutionieren?
              </h2>
              <p className="text-xl text-muted-foreground">
                Tausende von Teams nutzen bereits die KI-Sekretärin, um Zeit zu sparen und effizienter zu arbeiten. Starten Sie kostenlos.
              </p>
            </div>

            {/* Stats before signup */}
            <div className="grid grid-cols-3 gap-6 py-8 border-y border-primary/20">
              <div>
                <div className="text-3xl font-black text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-black text-accent">500+</div>
                <div className="text-sm text-muted-foreground">Integrations</div>
              </div>
              <div>
                <div className="text-3xl font-black text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/register')}
                  size="lg"
                  className="shadow-elegant bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg"
                >
                  Kostenlos starten
                </Button>
                <Button
                  onClick={() => navigate('/contact')}
                  size="lg"
                  variant="outline"
                  className="border-primary/30 px-8 py-6 text-lg"
                >
                  Demo buchen
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Keine Kreditkarte erforderlich. 14 Tage kostenlosen Zugang zu allen Features.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Stats Banner */}
      <section className="py-16 border-t border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-primary">60%</div>
              <p className="text-sm text-muted-foreground mt-2">Durchschnittliche Zeiteinsparung</p>
            </div>
            <div>
              <div className="text-3xl font-black text-accent">4h/Tag</div>
              <p className="text-sm text-muted-foreground mt-2">Zeit pro Mitarbeiter gespart</p>
            </div>
            <div>
              <div className="text-3xl font-black text-primary">24/7</div>
              <p className="text-sm text-muted-foreground mt-2">Automatisierte Unterstützung</p>
            </div>
            <div>
              <div className="text-3xl font-black text-accent">€0</div>
              <p className="text-sm text-muted-foreground mt-2">Startkosten</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
