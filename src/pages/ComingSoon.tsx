import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  features?: string[];
}

export default function ComingSoon({ title, description, features }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
      <Card className="w-full max-w-2xl shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Construction className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Badge variant="secondary" className="mb-2">🔴 In Entwicklung</Badge>
            <CardTitle className="text-3xl">{title}</CardTitle>
            <CardDescription className="text-base max-w-lg mx-auto">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        
        {features && features.length > 0 && (
          <CardContent className="space-y-4">
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 text-center">Geplante Features</h3>
              <ul className="space-y-3">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Diese Funktion wird derzeit entwickelt und steht bald zur Verfügung.
              </p>
              <Button asChild variant="outline">
                <Link to="/admin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zum Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
