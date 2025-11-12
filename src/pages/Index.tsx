import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Mic, Mail, MessageSquare, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-ai-assistant.jpg";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Mic,
      title: "Sprachsteuerung",
      description: "Befehle per Sprache ausführen und Termine erstellen"
    },
    {
      icon: Mail,
      title: "Ticket-Management",
      description: "Anfragen verwalten mit KI-gestützten Antworten"
    },
    {
      icon: MessageSquare,
      title: "Chat-Integration",
      description: "Automatische Chatbot-Antworten für häufige Fragen"
    },
    {
      icon: Sparkles,
      title: "KI-Vorschläge",
      description: "Intelligente Antwortvorschläge für schnellere Bearbeitung"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              KI-gestützte Büroautomatisierung
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Deine virtuelle{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                KI-Sekretärin
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg">
              Verwalte Kundenanfragen, Termine und E-Mails automatisiert mit intelligenten 
              KI-Antwortvorschlägen. Das zentrale Dashboard für moderne Bürofachkräfte.
            </p>

            <div className="flex flex-wrap gap-4">
              {user ? (
                <Button onClick={() => navigate("/admin")} size="lg" className="shadow-elegant">
                  Zum Dashboard
                </Button>
              ) : (
                <>
                  <Button onClick={() => navigate("/register")} size="lg" className="shadow-elegant">
                    Kostenlos starten
                  </Button>
                  <Button onClick={() => navigate("/login")} size="lg" variant="outline">
                    Anmelden
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="KI-Sekretärin Dashboard"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Bereit für die Zukunft der Büroarbeit?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Starte jetzt und erlebe, wie KI deine tägliche Arbeit vereinfacht.
          </p>
          {!user && (
            <Button onClick={() => navigate("/register")} size="lg" className="shadow-elegant">
              Jetzt kostenlos registrieren
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
