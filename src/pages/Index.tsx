import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, MessageSquare, ShieldCheck, Ticket, Sparkles, CheckCircle, Brain, Zap, TrendingUp, Users } from 'lucide-react';
import { useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  // Check if we came explicitly from the dashboard dropdown
  const bypassRedirect = location.state?.fromDashboard === true;

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user && !bypassRedirect) {
      navigate('/admin');
    }
  }, [user, loading, navigate, bypassRedirect]);

  const features = [
    {
      icon: Ticket,
      title: 'KI-gestütztes Ticket-System',
      description: 'Zentrale Verwaltung aller Kundenanfragen.',
      longDescription: 'E-Mails und Chat-Nachrichten werden automatisch kategorisiert, priorisiert und an den richtigen Mitarbeiter zugewiesen. Die KI liest den Kontext und generiert direkt passende Antwortvorschläge.',
    },
    {
      icon: MessageSquare,
      title: 'Intelligentes Chat-Widget',
      description: 'Ein Chatbot für Ihre Website.',
      longDescription: 'Binden Sie unser Chat-Widget auf Ihrer Website ein. Es beantwortet Nutzerfragen basierend auf Ihrem hinterlegten Firmenprofil rund um die Uhr. Komplexe Anfragen werden automatisch als Ticket erstellt.',
    },
    {
      icon: Mic,
      title: 'Lokale Sprachsteuerung',
      description: 'Freihändige Bedienung mit Whisper.',
      longDescription: 'Sprechen Sie Befehle direkt ins System ein. Die hochgenaue Spracherkennung läuft dank Whisper Open Source Technologie direkt auf Ihrem Server - für höchste Geschwindigkeit und Privatsphäre.',
    },
    {
      icon: ShieldCheck,
      title: '100% Datenkontrolle (Local-First)',
      description: 'Keine sensiblen Daten in der Cloud.',
      longDescription: 'Cal-Speak-Buddy setzt auf lokale KI-Modelle wie LLaMA 3.2 oder Qwen 2.5 via Ollama. Ihre Firmendatenstruktur und alle Kundenanfragen bleiben strikt bei Ihnen und werden nicht an Server von Dritten gesendet.',
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
      {/* Background visual effects */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] opacity-70 animate-pulse-slow"></div>
        <div className="absolute top-[100px] right-1/4 w-[400px] h-[400px] rounded-full bg-accent/20 blur-[100px] opacity-50 mix-blend-multiply"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Mic className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Cal-Speak-Buddy
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!user && (
              <>
                <Button variant="ghost" className="hover:text-primary transition-colors hidden sm:flex" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button className="shadow-lg hover:shadow-primary/25 transition-all text-white" onClick={() => navigate('/register')}>
                  Registrieren
                </Button>
              </>
            )}
            {user && (
              <Button className="shadow-lg hover:shadow-primary/25 transition-all text-white" onClick={() => navigate('/admin')}>
                Zum Dashboard
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-16">

        {/* Improved Hero Section */}
        <section className="container mx-auto px-6 pt-12 text-center pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent mb-4 cursor-default">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Lokal & Datenschutzkonform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-tight drop-shadow-sm">
              Die intelligente <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-accent">
                All-in-One KI-Lösung
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mx-auto max-w-2xl leading-relaxed">
              Automatisieren Sie Ihren Büroalltag mit lokaler KI. Von Sprachsteuerung über Website-Chatbots bis hin zum intelligenten Ticketsystem – alles aus einer Hand.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="h-14 px-8 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all group text-white"
              >
                Kostenlos starten
                <CheckCircle className="ml-2 w-5 h-5 opacity-70 group-hover:opacity-100" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-14 px-8 text-lg border-2 hover:bg-secondary/50 transition-colors"
              >
                Features entdecken
              </Button>
            </div>

            <div className="pt-8 flex justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>DSGVO Konform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Keine Kreditkarte nötig</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Dynamic Concept illustration */}
        <section className="container mx-auto px-6 mb-32 group">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mx-auto max-w-5xl rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-md p-2 shadow-2xl shadow-primary/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 opacity-50"></div>
            <div className="rounded-[1.5rem] overflow-hidden bg-background/90 border border-border/50 aspect-video relative flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/10 backdrop-blur-sm p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(var(--primary),0.3)]">
                  <Mic className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-3xl font-semibold text-foreground mb-4">Erleben Sie die Zukunft der Büroorganisation</h3>
                <p className="text-muted-foreground max-w-lg">
                  Sprachgesteuerte Ticket-Erstellung und automatische Kundenantworten durch On-Device KI-Modelle.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="container mx-auto px-6 py-24 bg-secondary/30 rounded-[3rem] border border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>

          <div className="text-center mb-20 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Mächtige Funktionen. <br className="hidden md:block" /> Simpel zu bedienen.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Wir haben komplexe KI-Technologien in intuitive Werkzeuge verpackt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 max-w-7xl mx-auto">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-card hover:bg-card/60 border border-border/50 p-8 rounded-3xl transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 content-start flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm flex-grow">
                    {feature.description}
                  </p>
                  <p className="text-foreground/80 leading-relaxed text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                    {feature.longDescription}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* "Why Local" Section */}
        <section className="container mx-auto px-6 py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-medium">Privacy First</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Warum lokales Hosting <br /> den Unterschied macht.</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Kunden- und Mitarbeiterdaten gehören nicht in fremde Clouds. Mit Cal-Speak-Buddy läuft die gesamte KI-Verarbeitung (Spracherkennung & Textanalyse) direkt auf Ihrer Infrastruktur durch Ollama und Whisper.
              </p>
              <ul className="space-y-5">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">✓</div>
                  <span className="text-foreground font-medium">100% DSGVO-konform ohne Kompromisse</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">✓</div>
                  <span className="text-foreground font-medium">Kein Vendor-Lock-in bei externen APIs</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">✓</div>
                  <span className="text-foreground font-medium">Geringere laufende Kosten für KI-Generierung</span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 overflow-hidden relative flex items-center justify-center p-8 md:p-12">
                <div className="relative z-10 w-full h-full bg-card/90 backdrop-blur-xl rounded-[2rem] border border-border shadow-2xl p-6 flex flex-col">
                  <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">localhost:11434</div>
                  </div>
                  <div className="flex-1 font-mono text-sm space-y-4 text-muted-foreground overflow-hidden">
                    <div className="flex items-start gap-2">
                      <span className="text-primary">{'>'}</span>
                      <span>ollama run qwen2.5:14b</span>
                    </div>
                    <div className="flex items-start gap-2 text-green-500/80">
                      <span className="text-primary">{'>'}</span>
                      <span>Analyzing new support ticket...</span>
                    </div>
                    <div className="flex items-start gap-2 text-foreground">
                      <span className="text-primary">{'>'}</span>
                      <span>Category: Support. Priority: High. <br />Drafting response...</span>
                    </div>
                    <div className="flex items-start gap-2 text-accent/80">
                      <span className="text-primary">{'>'}</span>
                      <span>Success. Elapsed: 2.4s. <br />0 bytes sent to external networks.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits/Stats Section */}
        <section className="py-24 bg-background border-t border-border/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Ihre Agenturvorteile auf einen Blick</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
              <div className="p-8 rounded-3xl bg-secondary/20">
                <div className="text-5xl font-black text-primary mb-3">4x</div>
                <div className="text-sm font-medium text-muted-foreground">Schnellere Ticketbearbeitung mit KI</div>
              </div>
              <div className="p-8 rounded-3xl bg-secondary/20">
                <div className="text-5xl font-black text-accent mb-3">0€</div>
                <div className="text-sm font-medium text-muted-foreground">Zusätzliche LLM API-Kosten</div>
              </div>
              <div className="p-8 rounded-3xl bg-secondary/20">
                <div className="text-5xl font-black text-primary mb-3">100%</div>
                <div className="text-sm font-medium text-muted-foreground">Eigene Datenkontrolle</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="bg-gradient-to-br from-primary via-blue-600 to-accent rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30 max-w-6xl mx-auto">
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">Bereit für den nächsten Schritt?</h2>
                <p className="text-lg md:text-xl text-white/90 mb-10">
                  Registrieren Sie sich kostenlos und testen Sie Cal-Speak-Buddy unverbindlich.
                  Richten Sie Ihr lokales System in wenigen Minuten ein.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/register')}
                    size="lg"
                    className="shadow-xl bg-white text-primary hover:bg-gray-100 px-10 py-7 text-lg hover:scale-105 transition-transform"
                  >
                    Kostenlos starten
                  </Button>
                </div>
                <p className="mt-6 text-sm text-white/70">
                  Voller Zugriff auf alle Features. Einmaliges lokales Setup erforderlich.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
