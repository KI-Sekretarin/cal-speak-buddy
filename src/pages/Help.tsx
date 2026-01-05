import DashboardLayout from '@/components/DashboardLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MessageSquare, Settings, Calendar, ShoppingBag, HelpCircle, AlertCircle } from 'lucide-react';

export default function Help() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              Hilfe & Dokumentation
            </h1>
            <p className="text-xl text-muted-foreground">
              Hier finden Sie Anleitungen und Tipps zur Nutzung Ihrer KI-Sekretärin.
            </p>
          </div>
          <Button
            onClick={() => window.dispatchEvent(new Event('start_walkthrough'))}
            className="hidden md:flex"
            variant="outline"
          >
            Tour erneut starten
          </Button>
        </div>

        {/* Categories */}
        <div className="grid gap-6">

          {/* Voice Commands */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                <CardTitle>Sprachsteuerung</CardTitle>
              </div>
              <CardDescription>Steuern Sie Ihren Kalender mit Ihrer Stimme.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="voice-start">
                  <AccordionTrigger>Wie starte ich die Sprachsteuerung?</AccordionTrigger>
                  <AccordionContent>
                    Navigieren Sie im Menü zu <strong>Sprachsteuerung</strong>. Klicken Sie auf das große Mikrofon-Symbol, um die Aufnahme zu starten. Sprechen Sie Ihren Befehl und klicken Sie erneut, um die Aufnahme zu beenden. Die KI analysiert Ihre Sprache und führt den Befehl aus oder bittet um Bestätigung.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="voice-commands">
                  <AccordionTrigger>Welche Befehle werden unterstützt?</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-4 space-y-2">
                      <li><strong>Termine anzeigen:</strong> "Zeige meine Termine für heute", "Was steht morgen an?"</li>
                      <li><strong>Termine erstellen:</strong> "Erstelle ein Meeting mit Max morgen um 14 Uhr", "Neuer Termin: Zahnarzt am Freitag um 9."</li>
                      <li><strong>Termine löschen:</strong> "Lösche den nächsten Termin", "Storniere das Meeting mit Anna."</li>
                      <li><strong>Termine ändern:</strong> "Verschiebe den Termin um 15 Uhr auf 16 Uhr."</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="voice-troubleshoot">
                  <AccordionTrigger>Mein Mikrofon funktioniert nicht</AccordionTrigger>
                  <AccordionContent>
                    Stellen Sie sicher, dass Sie dem Browser die Berechtigung zur Nutzung des Mikrofons erteilt haben. Wenn ein Popup erscheint, klicken Sie auf "Zulassen". Prüfen Sie auch Ihre Systemeinstellungen.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Chat & Enquiries */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Öffentlicher Chat & Anfragen</CardTitle>
              </div>
              <CardDescription>So empfangen und bearbeiten Sie Kundenanfragen.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="chat-link">
                  <AccordionTrigger>Wie teile ich meinen Chat?</AccordionTrigger>
                  <AccordionContent>
                    Gehen Sie zu <strong>Einstellungen</strong>. Ganz oben finden Sie Ihren persönlichen <strong>Chat-Link</strong>. Kopieren Sie diesen und teilen Sie ihn auf Ihrer Website, in E-Mails oder auf Social Media. Kunden können darüber direkt mit Ihrer KI-Sekretärin chatten.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="chat-ai">
                  <AccordionTrigger>Was kann die KI im Chat beantworten?</AccordionTrigger>
                  <AccordionContent>
                    Die KI nutzt die Informationen aus Ihrem <strong>Unternehmensprofil</strong> und dem <strong>Sortiment</strong>, um Fragen zu Leistungen, Preisen, Öffnungszeiten und mehr zu beantworten. Sie können in den Einstellungen auch spezielle Anweisungen ("AI Instructions") und FAQs hinterlegen.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Sortiment (Catalog) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <CardTitle>Sortiment & Produkte</CardTitle>
              </div>
              <CardDescription>Verwalten Sie Ihre Angebote für die KI.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="catalog-manage">
                  <AccordionTrigger>Warum ist das Sortiment wichtig?</AccordionTrigger>
                  <AccordionContent>
                    Das <strong>Sortiment</strong> ist die Hauptdatenquelle für die KI, wenn es um Ihre Produkte und Dienstleistungen geht. Tragen Sie hier alle Leistungen inklusive Preisen und Beschreibungen ein. Wenn ein Kunde nach "Preisen für Webdesign" fragt, sucht die KI hier nach der Antwort.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="catalog-add">
                  <AccordionTrigger>Produkte hinzufügen</AccordionTrigger>
                  <AccordionContent>
                    Gehen Sie zu <strong>Einstellungen &gt; Sortiment</strong>. Klicken Sie auf "Neues Produkt", füllen Sie Name, Beschreibung und Preis aus und speichern Sie.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Einstellungen</CardTitle>
              </div>
              <CardDescription>Passen Sie das Verhalten der KI an.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="settings-profile">
                  <AccordionTrigger>Unternehmensprofil</AccordionTrigger>
                  <AccordionContent>
                    Halten Sie Ihre Stammdaten (Adresse, Öffnungszeiten, Kontakt) immer aktuell. Die KI gibt diese Informationen an Kunden weiter, wenn danach gefragt wird.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="settings-google">
                  <AccordionTrigger>Google Kalender Verbindung</AccordionTrigger>
                  <AccordionContent>
                    Unter <strong>Einstellungen &gt; Kalender</strong> können Sie Ihr Google Konto verknüpfen. Dies ist notwendig, damit die Sprachsteuerung Termine prüfen und erstellen kann. Wenn die Verbindung getrennt wird, melden Sie sich dort einfach erneut an.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

        </div>

        {/* Support Footer */}
        <div className="bg-muted/50 p-6 rounded-lg border flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-muted-foreground mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Brauchen Sie weitere Hilfe?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unser Support-Team steht Ihnen bei technischen Problemen gerne zur Verfügung.
            </p>
            <div className="text-sm font-medium">
              E-Mail: support@cal-speak-buddy.com
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
