import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, Mail, MessageSquare, Sparkles } from 'lucide-react';

const featureImages = [
  'https://images.pexels.com/photos/3183171/pexels-photo-3183171.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/847393/pexels-photo-847393.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Mic,
      title: 'Sprachsteuerung',
      description: 'Befehle per Sprache ausführen und Termine erstellen',
    },
    {
      icon: Mail,
      title: 'Ticket-Management',
      description: 'Anfragen verwalten mit KI-gestützten Antworten',
    },
    {
      icon: MessageSquare,
      title: 'Chat-Integration',
      description: 'Automatische Chatbot-Antworten für häufige Fragen',
    },
    {
      icon: Sparkles,
      title: 'KI-Vorschläge',
      description: 'Intelligente Antwortvorschläge für schnellere Bearbeitung',
    },
    {
      icon: Sparkles,
      title: 'Automatisierte Workflows',
      description: 'Routineträger automatisieren, Zeit sparen',
    },
    {
      icon: Sparkles,
      title: 'Analytics & Insights',
      description: 'Metriken und KPIs zur Performance-Optimierung',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920')] bg-cover bg-center filter brightness-75 dark:brightness-50"
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
                  src={featureImages[i % featureImages.length]}
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
                    <span className="text-sm text-muted-foreground">Mehr erfahren</span>
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
