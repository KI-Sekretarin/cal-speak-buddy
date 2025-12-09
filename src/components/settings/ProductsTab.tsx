import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, Loader2, Save, X, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanyProfile } from '@/types/profile';

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    currency: string;
    type: 'product' | 'service';
    created_at: string;
}

interface ProductsTabProps {
    profile: CompanyProfile | null;
}

export function ProductsTab({ profile }: ProductsTabProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or id
    const [formData, setFormData] = useState<Partial<Product>>({
        currency: 'EUR',
        type: 'service'
    });
    const { toast } = useToast();

    useEffect(() => {
        if (profile?.id) {
            fetchProducts();
        }
    }, [profile?.id]);

    const fetchProducts = async () => {
        if (!profile?.id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('company_products')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            toast({ variant: 'destructive', title: 'Fehler', description: 'Produkte konnten nicht geladen werden.' });
        } else {
            setProducts(data as Product[] || []);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!profile?.id) return;
        if (!formData.name) {
            toast({ variant: 'destructive', title: 'Fehler', description: 'Name ist erforderlich.' });
            return;
        }

        const productData = {
            user_id: profile.id,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            currency: formData.currency || 'EUR',
            type: formData.type || 'service'
        };

        let resultError;
        if (isEditing === 'new') {
            const { error: insertError } = await supabase.from('company_products').insert(productData);
            resultError = insertError;
        } else if (isEditing) {
            const { error: updateError } = await supabase.from('company_products').update(productData).eq('id', isEditing);
            resultError = updateError;
        }

        if (resultError) {
            console.error('Error saving product:', resultError);
            toast({ variant: 'destructive', title: 'Fehler', description: 'Speichern fehlgeschlagen: ' + resultError.message });
        } else {
            toast({ title: 'Erfolg', description: 'Gespeichert.' });
            setIsEditing(null);
            setFormData({ currency: 'EUR', type: 'service' });
            fetchProducts();
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('company_products').delete().eq('id', id);
        if (error) {
            toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' });
        } else {
            setProducts(products.filter(p => p.id !== id));
            toast({ title: 'Gelöscht', description: 'Eintrag entfernt.' });
        }
    };

    const startEdit = (product: Product) => {
        setFormData(product);
        setIsEditing(product.id);
    };

    const startNew = () => {
        setFormData({ currency: 'EUR', type: 'service' });
        setIsEditing('new');
    };

    if (!profile) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        <div>
                            <CardTitle>Sortiment & Preise</CardTitle>
                            <CardDescription>
                                Verwalten Sie Ihre Produkte und Dienstleistungen für Preis-Auskünfte.
                            </CardDescription>
                        </div>
                    </div>
                    {!isEditing && (
                        <Button onClick={startNew}>
                            <Plus className="w-4 h-4 mr-2" /> Neu hinzufügen
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {/* Editor Form */}
                {isEditing && (
                    <div className="mb-6 p-4 border rounded-lg bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="z.B. Haarschnitt, Beratungstermin"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Typ</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="service">Dienstleistung</SelectItem>
                                        <SelectItem value="product">Produkt</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Preis</Label>
                                <Input
                                    type="number"
                                    value={formData.price || ''}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Währung</Label>
                                <Input
                                    value={formData.currency || 'EUR'}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    placeholder="EUR"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Beschreibung (optional)</Label>
                            <Textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Details zum Angebot, z.B. Dauer, Inhalt..."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsEditing(null)}>Abbrechen</Button>
                            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Speichern</Button>
                        </div>
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : products.length === 0 ? (
                    <div className="text-center p-12 border border-dashed rounded-lg text-muted-foreground">
                        <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>Noch keine Produkte oder Dienstleistungen eingetragen.</p>
                        <Button variant="link" onClick={startNew}>Ersten Eintrag erstellen</Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {products.map(product => (
                            <div key={product.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-card">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{product.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${product.type === 'service' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {product.type === 'service' ? 'Dienstleistung' : 'Produkt'}
                                        </span>
                                    </div>
                                    {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
                                </div>
                                <div className="flex items-center gap-4 mt-2 md:mt-0 ml-0 md:ml-4">
                                    <div className="font-mono font-medium whitespace-nowrap">
                                        {product.price?.toFixed(2)} {product.currency}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(product)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
