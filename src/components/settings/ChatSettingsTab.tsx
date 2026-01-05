import { CompanyProfile } from '@/types/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, ExternalLink, Plus, Trash2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatSettingsTabProps {
    profile: CompanyProfile | null;
    onUpdate: (field: string, value: any) => void;
}

export function ChatSettingsTab({ profile, onUpdate }: ChatSettingsTabProps) {
    const { toast } = useToast();

    if (!profile) return null;

    const chatLink = `${window.location.origin}/c/${profile.contact_form_slug}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(chatLink);
        toast({
            title: "Link kopiert",
            description: "Der Chat-Link wurde in die Zwischenablage kopiert.",
        });
    };

    const handleAddQuestion = () => {
        const currentQuestions = profile.chat_suggested_questions || [];
        onUpdate('chat_suggested_questions', [...currentQuestions, 'Neue Frage']);
    };

    const handleUpdateQuestion = (index: number, value: string) => {
        const currentQuestions = [...(profile.chat_suggested_questions || [])];
        currentQuestions[index] = value;
        onUpdate('chat_suggested_questions', currentQuestions);
    };

    const handleRemoveQuestion = (indexToRemove: number) => {
        const currentQuestions = (profile.chat_suggested_questions || []).filter((_, index) => index !== indexToRemove);
        onUpdate('chat_suggested_questions', currentQuestions);
    };

    return (
        <div className="space-y-6">
            {/* Public Chat Link */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <CardTitle>Ihr öffentlicher Chat-Link</CardTitle>
                    </div>
                    <CardDescription>
                        Teilen Sie diesen Link mit Ihren Kunden, um Anfragen zu erhalten.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Input
                            value={chatLink}
                            readOnly
                            className="font-mono text-sm bg-background"
                        />
                        <Button variant="outline" size="icon" onClick={copyToClipboard} title="Link kopieren">
                            <Copy className="h-4 w-4" />
                        </Button>
                        <a href={chatLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" title="Öffnen">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* Chat Appearance - MOVED TO PROFILE SETTINGS */}

            {/* ... (previous content) ... */}
            {/* Suggested Questions */}
            <Card>
                <CardHeader>
                    <CardTitle>Vorgeschlagene Fragen</CardTitle>
                    <CardDescription>
                        Definieren Sie Fragen, die Kunden mit einem Klick stellen können.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(profile.chat_suggested_questions || []).map((question, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={question}
                                onChange={(e) => handleUpdateQuestion(index, e.target.value)}
                                placeholder="Frage eingeben..."
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveQuestion(index)}
                                className="text-destructive hover:text-destructive/90"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={handleAddQuestion} className="w-full border-dashed">
                        <Plus className="w-4 h-4 mr-2" />
                        Frage hinzufügen
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
