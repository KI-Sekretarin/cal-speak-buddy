import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Building2, MessageSquare, Brain, Eye } from "lucide-react";

interface SettingsSidebarProps {
    activeSection: string;
    onSelect: (section: string) => void;
}

export function SettingsSidebar({ activeSection, onSelect }: SettingsSidebarProps) {
    const items = [
        { id: "profile", label: "Profil & Marke", icon: User },
        { id: "business", label: "Geschäftsbetrieb", icon: Building2 },
        { id: "communication", label: "Kommunikation", icon: MessageSquare },
        { id: "ai", label: "Künstliche Intelligenz", icon: Brain },
        { id: "preview", label: "Vorschau", icon: Eye },
    ];

    return (
        <nav className="flex flex-col space-y-1">
            {items.map((item) => (
                <Button
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className={cn(
                        "justify-start gap-2 h-10 px-4 font-medium",
                        activeSection === item.id && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => onSelect(item.id)}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Button>
            ))}
        </nav>
    );
}
