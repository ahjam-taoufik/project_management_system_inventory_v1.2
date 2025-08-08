'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, router } from '@inertiajs/react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Client, Commercial, Product, Sortie } from '../types';
import ProtectedCombobox from '@/components/patterns/ProtectedCombobox';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Truck, Package, AlertCircle, CheckCircle, XCircle, RotateCcw, Calculator } from 'lucide-react';

interface SortieEditDialogProps {
    sortie: Sortie;
    products: Product[];
    commerciaux: Commercial[];
    clients: Client[];
    livreurs?: Array<{
        id: number;
        nom: string;
        telephone?: string;
    }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface SortieEditFormData {
    numero_bl: string;
    commercial_id: string;
    client_id: string;
    date_bl: string;
    livreur_id: string;
    products: Array<{
        product_id: string;
        quantite_produit: number;
        prix_produit: number;
        poids_produit: number;
        use_achat_price?: boolean;
    }>;
    remise_speciale: number;
    remise_trimestrielle: number;
    valeur_ajoutee: number;
    retour: number;
    remise_es: string;
    client_gdg: string;
    total_general: number;
    montant_total_final: number;
    total_poids: number;
    montant_remise_especes: number;
    archived: boolean;
    [key: string]: string | number | boolean | Array<{
        product_id: string;
        quantite_produit: number;
        prix_produit: number;
        poids_produit: number;
        use_achat_price?: boolean;
    }>;
}

export default function SortieEditDialog({
    sortie,
    products,
    commerciaux,
    clients,
    livreurs = [],
    open,
    onOpenChange
}: SortieEditDialogProps) {
    const [usePurchasePrice, setUsePurchasePrice] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Array<{
        product_id: string;
        quantite_produit: number;
        prix_produit: number;
        poids_produit: number;
    }>>([]);

    const { data, setData, processing, errors } = useForm<SortieEditFormData>({
        numero_bl: sortie.numero_bl,
        commercial_id: sortie.commercial.id.toString(),
        client_id: sortie.client.id.toString(),
        date_bl: sortie.date_bl.split('T')[0],
        livreur_id: sortie.livreur_id?.toString() || '',
        products: [],
        remise_speciale: sortie.remise_speciale,
        remise_trimestrielle: sortie.remise_trimestrielle,
        valeur_ajoutee: sortie.valeur_ajoutee,
        retour: sortie.retour,
        remise_es: sortie.remise_es || '',
        client_gdg: sortie.client_gdg.toString(),
        total_general: sortie.total_general,
        montant_total_final: sortie.montant_total_final,
        total_poids: sortie.total_poids,
        montant_remise_especes: sortie.montant_remise_especes,
        archived: sortie.archived,
    });

    // Initialiser les produits et le type de prix quand le modal s'ouvre
    React.useEffect(() => {
        if (open) {
            console.log('=== DÉBOGAGE MODIFICATION SORTIE ===');
            console.log('Sortie complète:', sortie);
            console.log('Produits de la sortie:', sortie.products);

            // Vérifier chaque produit individuellement
            sortie.products.forEach((product, index) => {
                console.log(`Produit ${index + 1}:`, {
                    id: product.product.id,
                    nom: product.product.product_libelle,
                    prix_produit: product.prix_produit,
                    use_achat_price: product.use_achat_price,
                    type_use_achat_price: typeof product.use_achat_price
                });
            });

            // Déterminer le type de prix basé sur les produits existants
            const hasAchatPrice = sortie.products.some(product => product.use_achat_price);
            console.log('hasAchatPrice (résultat):', hasAchatPrice);
            console.log('Produits avec prix d\'achat:', sortie.products.filter(product => product.use_achat_price));

            setUsePurchasePrice(hasAchatPrice);

            // Initialiser les produits avec leurs prix existants (ne pas recalculer)
            const initialProducts = sortie.products.map(product => ({
                product_id: product.product.id.toString(),
                quantite_produit: product.quantite_produit,
                prix_produit: product.prix_produit,
                poids_produit: product.poids_produit,
            }));
            console.log('Produits initialisés:', initialProducts);
            setSelectedProducts(initialProducts);
            setIsInitialized(true);
            console.log('=== FIN DÉBOGAGE ===');
        } else {
            setIsInitialized(false);
        }
    }, [open, sortie]);



    // Effet pour pré-remplir les champs remise_es et client_gdg quand un client est sélectionné
    React.useEffect(() => {
        if (data.client_id) {
            const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
            if (selectedClient) {
                // Ne pré-remplir que si les champs sont vides (première sélection)
                if (data.remise_es === '' || data.remise_es === null || data.remise_es === undefined) {
                    const remiseEsValue = selectedClient.remise_special ? selectedClient.remise_special.toString() : '';
                    setData('remise_es', remiseEsValue);
                }

                if (data.client_gdg === '' || data.client_gdg === null || data.client_gdg === undefined) {
                    const clientGdgValue = selectedClient.pourcentage ? selectedClient.pourcentage.toString() : '';
                    setData('client_gdg', clientGdgValue);
                }
            }
        } else {
            // Si aucun client n'est sélectionné, vider les champs et réinitialiser les états
            setData('remise_es', '');
            setData('client_gdg', '');
        }
    }, [data.client_id, clients]);

    // Effet pour recalculer les prix unitaires quand le type de prix change
    React.useEffect(() => {
        if (isInitialized) {
            setSelectedProducts(prevProducts =>
                prevProducts.map(product => {
                    if (product.product_id) {
                        const productData = products.find(p => p.id.toString() === product.product_id);
                        if (productData) {
                            // Récupérer le pourcentage client G/DG
                            const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                            const pourcentageClient = data.client_gdg !== '' ? parseFloat(data.client_gdg) || 0 : (selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0);

                            // Calculer le nouveau prix de base selon le type de prix
                            const prixDeBase = usePurchasePrice
                                ? Number(productData.prix_achat_colis || 0)
                                : Number(productData.prix_vente_colis || 0);

                            // Appliquer le pourcentage client G/DG
                            const newPrice = prixDeBase + (prixDeBase * pourcentageClient / 100);

                            return {
                                ...product,
                                prix_produit: newPrice,
                                poids_produit: productData.product_Poids ? productData.product_Poids * product.quantite_produit : product.poids_produit,
                            };
                        }
                    }
                    return product;
                })
            );
        }
    }, [usePurchasePrice, products, data.client_id, data.client_gdg, isInitialized]);

    const addProduct = () => {
        setSelectedProducts([
            {
                product_id: '',
                quantite_produit: 1,
                prix_produit: 0,
                poids_produit: 0,
            },
            ...selectedProducts,
        ]);
    };

    const removeProduct = (index: number) => {
        setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    };

    // Fonction pour formater les nombres pour l'affichage (sans espaces)
    const formatNumberForDisplay = (value: number | string): string => {
        const num = parseFloat(value?.toString() || '0');
        if (isNaN(num)) return '0.00';

        // Convertir en chaîne avec 2 décimales, utiliser le point comme séparateur décimal
        return num.toFixed(2);
    };

    // Fonction pour calculer le poids affiché d'un produit
    const getDisplayWeight = (productItem: typeof selectedProducts[0]) => {
        if (productItem.product_id) {
            const productData = products.find(p => p.id.toString() === productItem.product_id);
            if (productData && productData.product_Poids) {
                return productItem.quantite_produit * productData.product_Poids;
            }
        }
        return productItem.poids_produit;
    };

    const updateProduct = (index: number, field: keyof typeof selectedProducts[0], value: string | number) => {
        const updatedProducts = [...selectedProducts];

        if (field === 'product_id') {
            const selectedProduct = products.find((p) => p.id.toString() === value);
            if (selectedProduct) {
                // Quand on change de produit, TOUJOURS recalculer le prix avec le nouveau produit
                // Récupérer le pourcentage client G/DG (priorité à la valeur saisie)
                const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                const pourcentageClient = data.client_gdg !== '' ? parseFloat(data.client_gdg) || 0 : (selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0);

                // Calculer le prix de base avec vérification et conversion en nombre
                const prixDeBase = usePurchasePrice
                    ? Number(selectedProduct.prix_achat_colis || 0)
                    : Number(selectedProduct.prix_vente_colis || 0);

                // Appliquer le pourcentage au prix unitaire
                const newPrice = prixDeBase + (prixDeBase * pourcentageClient / 100);

                updatedProducts[index] = {
                    ...updatedProducts[index],
                    product_id: value as string,
                    prix_produit: newPrice,
                    poids_produit: selectedProduct.product_Poids ? selectedProduct.product_Poids * updatedProducts[index].quantite_produit : 0,
                };
            }
        } else {
            updatedProducts[index] = {
                ...updatedProducts[index],
                [field]: value,
            };

            // Si on change la quantité, recalculer le poids
            if (field === 'quantite_produit') {
                const selectedProduct = products.find((p) => p.id.toString() === updatedProducts[index].product_id);
                if (selectedProduct && selectedProduct.product_Poids) {
                    updatedProducts[index].poids_produit = (value as number) * selectedProduct.product_Poids;
                }
            }
        }

        setSelectedProducts(updatedProducts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Vérifier qu'il y a au moins un produit
        if (selectedProducts.length === 0) {
            toast.error('Veuillez ajouter au moins un produit');
            return;
        }

        // Vérifier que tous les produits ont un product_id
        const hasEmptyProducts = selectedProducts.some(p => !p.product_id);
        if (hasEmptyProducts) {
            toast.error('Veuillez sélectionner un produit pour chaque ligne');
            return;
        }

        // Calculer les totaux
        const totalGeneral = selectedProducts.reduce((total, product) => {
            const lineTotal = product.quantite_produit * product.prix_produit;
            return total + lineTotal;
        }, 0);

        const totalPoids = selectedProducts.reduce((total, product) => {
            return total + getDisplayWeight(product);
        }, 0);

        // Calculer la remise espèces
        const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
        const remiseSpeciale = data.remise_es !== '' ? parseFloat(data.remise_es) || 0 : (selectedClient?.remise_special ? Number(selectedClient.remise_special) : 0);
        const montantRemise = (totalGeneral * remiseSpeciale) / 100;

        // Calculer le montant total final
        const montantTotal = totalGeneral - montantRemise - data.remise_speciale - data.remise_trimestrielle + data.valeur_ajoutee + data.retour;

        // Préparer les données avec les produits et les totaux calculés
        const submitData = {
            ...data,
            products: selectedProducts.map(product => ({
                ...product,
                quantite_produit: Number(product.quantite_produit),
                prix_produit: Number(product.prix_produit),
                poids_produit: Number(product.poids_produit),
                use_achat_price: usePurchasePrice
            })),
            total_general: Number(Number(totalGeneral || 0).toFixed(2)),
            montant_total_final: Number(Number(montantTotal || 0).toFixed(2)),
            total_poids: Number(Number(totalPoids || 0).toFixed(2)),
            montant_remise_especes: Number(Number(montantRemise || 0).toFixed(2))
        };

        router.put(route('sorties.update', sortie.id), submitData, {
            onSuccess: () => {
                toast.success('Sortie modifiée avec succès');
                onOpenChange(false);
            },
            onError: (errors) => {
                console.error('Erreurs de validation:', errors);
                toast.error('Erreur lors de la modification de la sortie');
            },
        });
    };

    return (
        <>
            {open && (
                <div className="fixed inset-0 bg-black/50 z-50" />
            )}
            <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
                <DialogContent
                    className="w-[95vw] max-w-[1200px] max-h-[95vh] overflow-y-auto p-4 sm:p-6 sm:max-w-[1200px] md:p-7 md:px-8 poppins mt-8 z-[51]"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        Modifier la sortie #{sortie.numero_bl}
                    </DialogTitle>
                    <DialogDescription>
                        Modifiez les informations de la sortie
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section des quatre colonnes principales côte à côte */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-2 gap-4">
                        {/* Section des informations générales du BL */}
                        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-blue-800 text-sm">
                                    <Truck className="w-4 h-4" />
                                    Informations BL
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="numero-bl" className="text-xs font-medium flex items-center gap-1">
                                        Numéro BL
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="numero-bl"
                                            name="numero_bl"
                                            type="text"
                                            placeholder="BL-2024-001"
                                            className="h-9 text-sm transition-all duration-200"
                                            value={data.numero_bl}
                                            onChange={(e) => setData('numero_bl', e.target.value)}
                                            aria-describedby={errors.numero_bl ? 'numero-bl-error' : undefined}
                                        />
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            {data.numero_bl.trim() && !errors.numero_bl && <CheckCircle className="w-3 h-3 text-green-500" />}
                                            {errors.numero_bl && <XCircle className="w-3 h-3 text-red-500" />}
                                        </div>
                                    </div>
                                    {errors.numero_bl && (
                                        <p id="numero-bl-error" className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.numero_bl}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="date-bl" className="text-xs font-medium flex items-center gap-1">
                                        Date BL
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="date-bl"
                                            name="date_bl"
                                            type="date"
                                            className="h-9 text-sm transition-all duration-200"
                                            value={data.date_bl}
                                            onChange={(e) => setData('date_bl', e.target.value)}
                                            aria-describedby={errors.date_bl ? 'date-bl-error' : undefined}
                                        />
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            {data.date_bl && !errors.date_bl && <CheckCircle className="w-3 h-3 text-green-500" />}
                                            {errors.date_bl && <XCircle className="w-3 h-3 text-red-500" />}
                                        </div>
                                    </div>
                                    {errors.date_bl && (
                                        <p id="date-bl-error" className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.date_bl}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="livreur-select" className="text-xs font-medium flex items-center gap-1">
                                        Livreur
                                        <Badge variant="secondary" className="text-xs">Optionnel</Badge>
                                    </Label>
                                    <ProtectedCombobox
                                        items={livreurs.map((livreur) => ({
                                            id: livreur.id,
                                            label: livreur.nom,
                                            subLabel: livreur.telephone ? `(${livreur.telephone})` : undefined,
                                            isActive: true,
                                        }))}
                                        value={data.livreur_id}
                                        onValueChange={(value) => setData('livreur_id', value)}
                                        placeholder="Sélectionner un livreur..."
                                        searchPlaceholder="Rechercher un livreur..."
                                        className="h-9 text-sm"
                                    />
                                    {errors.livreur_id && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.livreur_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium flex items-center gap-1">
                                        Type de prix
                                    </Label>
                                    <div className={`flex items-center space-x-2 p-2 rounded-md border transition-colors ${usePurchasePrice ? 'bg-red-300 border-red-800' : 'bg-white border-gray-200'}`}>
                                        <span className={`text-xs font-medium ${!usePurchasePrice ? 'text-gray-700' : 'text-cyan-50'}`}>Vente</span>
                                        <div
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${usePurchasePrice ? 'bg-red-600' : 'bg-gray-200'}`}
                                            onClick={() => setUsePurchasePrice(!usePurchasePrice)}
                                        >
                                            <span
                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${usePurchasePrice ? 'translate-x-5' : 'translate-x-1'}`}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium ${usePurchasePrice ? 'text-red-600 font-bold' : 'text-gray-700'}`}>Achat</span>
                                    </div>
                                </div>


                            </CardContent>
                        </Card>

                        {/* Section des informations client */}
                        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-green-800 text-sm">
                                    <Check className="w-4 h-4" />
                                    Informations Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="client-select" className="text-xs font-medium flex items-center gap-1">
                                        Code Client
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <ProtectedCombobox
                                            items={clients
                                                .sort((a, b) => {
                                                    const codeA = a.code || '';
                                                    const codeB = b.code || '';
                                                    const numA = parseInt(codeA.replace(/\D/g, '')) || 0;
                                                    const numB = parseInt(codeB.replace(/\D/g, '')) || 0;
                                                    return numA - numB;
                                                })
                                                .map((client) => ({
                                                    id: client.id,
                                                    label: client.code || `CL${client.id}`,
                                                    subLabel: client.fullName || `Client ${client.id}`,
                                                    isActive: true,
                                                }))}
                                            value={data.client_id}
                                            onValueChange={(value) => {
                                                setData('client_id', value);
                                                const selectedClient = clients.find((c) => c.id.toString() === value);
                                                if (selectedClient) {
                                                    const associatedCommercial = commerciaux.find((c) => c.id === selectedClient.idCommercial);
                                                    if (associatedCommercial) {
                                                        setData((prev) => ({
                                                            ...prev,
                                                            client_id: value,
                                                            commercial_id: associatedCommercial.id.toString(),
                                                        }));
                                                    }
                                                }
                                            }}
                                            placeholder="Sélectionner un client..."
                                            searchPlaceholder="Rechercher un client..."
                                            className="h-9 text-sm"
                                        />
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            {data.client_id && !errors.client_id && <CheckCircle className="w-3 h-3 text-green-500" />}
                                            {errors.client_id && <XCircle className="w-3 h-3 text-red-500" />}
                                        </div>
                                    </div>
                                    {errors.client_id && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.client_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Nom Client</Label>
                                    <Input
                                        value={(() => {
                                            const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                            return selectedClient?.fullName || '';
                                        })()}
                                        readOnly
                                        className="h-9 text-sm bg-gray-50"
                                        placeholder="Nom du client"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Téléphone Client</Label>
                                    <Input
                                        value={(() => {
                                            const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                            return selectedClient?.telephone || '';
                                        })()}
                                        readOnly
                                        className="h-9 text-sm bg-gray-50"
                                        placeholder="Téléphone"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Localisation</Label>
                                    <Input
                                        value={(() => {
                                            const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                            if (selectedClient) {
                                                let ville = '';
                                                let secteur = '';

                                                if (typeof selectedClient.ville === 'string') {
                                                    ville = selectedClient.ville;
                                                } else if (selectedClient.ville && typeof selectedClient.ville === 'object' && 'nameVille' in selectedClient.ville) {
                                                    ville = selectedClient.ville.nameVille;
                                                }

                                                if (typeof selectedClient.secteur === 'string') {
                                                    secteur = selectedClient.secteur;
                                                } else if (selectedClient.secteur && typeof selectedClient.secteur === 'object' && 'nameSecteur' in selectedClient.secteur) {
                                                    secteur = selectedClient.secteur.nameSecteur;
                                                }

                                                if (ville && secteur) {
                                                    return `${ville} - ${secteur}`;
                                                } else if (ville) {
                                                    return ville;
                                                } else if (secteur) {
                                                    return secteur;
                                                }
                                            }
                                            return '';
                                        })()}
                                        readOnly
                                        className="h-9 text-sm bg-gray-50"
                                        placeholder="Ville + Secteur"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section des informations commercial */}
                        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-purple-800 text-sm">
                                    <Check className="w-4 h-4" />
                                    Informations Commercial
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Nom Commercial</Label>
                                    <Input
                                        value={(() => {
                                            const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                            if (selectedClient) {
                                                const commercial = commerciaux.find((c) => c.id === selectedClient.idCommercial);
                                                return commercial?.commercial_fullName || '';
                                            }
                                            return '';
                                        })()}
                                        readOnly
                                        className="h-9 text-sm bg-gray-50"
                                        placeholder="Nom du commercial"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Téléphone Commercial</Label>
                                    <Input
                                        value={(() => {
                                            const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                            if (selectedClient) {
                                                const commercial = commerciaux.find((c) => c.id === selectedClient.idCommercial);
                                                return commercial?.commercial_telephone || '';
                                            }
                                            return '';
                                        })()}
                                        readOnly
                                        className="h-9 text-sm bg-gray-50"
                                        placeholder="Téléphone"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium flex items-center gap-1">
                                        Remise ES
                                        <Badge variant="secondary" className="text-xs">%</Badge>
                                    </Label>
                                    <Input
                                        value={data.remise_es || ''}
                                        onChange={(e) => setData('remise_es', e.target.value)}
                                        className="h-9 text-sm"
                                        placeholder="Remise ES"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium flex items-center gap-1">
                                        Client G/DG
                                        <Badge variant="secondary" className="text-xs">%</Badge>
                                    </Label>
                                    <Input
                                        value={data.client_gdg || ''}
                                        onChange={(e) => setData('client_gdg', e.target.value)}
                                        className="h-9 text-sm"
                                        placeholder="Client G/DG"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section des informations supplémentaires */}
                        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-orange-800 text-sm">
                                    <Calculator className="w-4 h-4" />
                                    Informations Supplémentaires
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Remise Spéciale</Label>
                                    <Input
                                        value={data.remise_speciale || ''}
                                        onChange={(e) => setData('remise_speciale', parseFloat(e.target.value) || 0)}
                                        className="h-9 text-sm"
                                        placeholder="0.00"
                                        min="0"
                                    />
                                    <p className="text-xs text-blue-600 font-medium">
                                        ℹ️ Valeurs positives uniquement
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Remise Trimestrielle</Label>
                                    <Input
                                        value={data.remise_trimestrielle || ''}
                                        onChange={(e) => setData('remise_trimestrielle', parseFloat(e.target.value) || 0)}
                                        className="h-9 text-sm"
                                        placeholder="0.00"
                                        min="0"
                                    />
                                    <p className="text-xs text-blue-600 font-medium">
                                        ℹ️ Valeurs positives uniquement
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Valeur Ajoutée</Label>
                                    <Input
                                        value={data.valeur_ajoutee || ''}
                                        onChange={(e) => setData('valeur_ajoutee', parseFloat(e.target.value) || 0)}
                                        className="h-9 text-sm"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-purple-600 font-medium">
                                        💡 Valeurs positives ou négatives
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Retour</Label>
              <Input
                                        value={data.retour || ''}
                                        onChange={(e) => setData('retour', parseFloat(e.target.value) || 0)}
                                        className="h-9 text-sm"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-purple-600 font-medium">
                                        💡 Valeurs positives ou négatives
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Section des produits */}
                    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-yellow-800 text-sm">
                                        <Package className="w-4 h-4" />
                                        Produits
                                    </CardTitle>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Indicateur de total poids */}
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total poids</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xl font-bold text-blue-600">
                                                {formatNumberForDisplay(selectedProducts.reduce((total, product) => {
                                                    return total + getDisplayWeight(product);
                                                }, 0))} kg
                                            </p>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                <Package className="w-3 h-3 mr-1" />
                                                Total
                                            </Badge>
                                        </div>
                                    </div>
                                    {/* Bouton d'ajout avec animation */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addProduct}
                                        className="h-9 text-sm transition-all duration-200 hover:scale-105 hover:shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Ajouter un produit
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">

                            <div className="space-y-4">
                                {/* En-têtes des colonnes avec style amélioré */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-lg border">
                                    <div className="col-span-4">
                                        <Label className="text-sm font-medium text-gray-700">Nom de produit</Label>
                                    </div>
                                    <div className="col-span-1">
                                        <Label className="text-sm font-medium text-gray-700">Quantité</Label>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-base font-extrabold text-gray-700">
                                            Prix {(() => {
                                                const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                                const pourcentageClient = data.client_gdg !== '' ? parseFloat(data.client_gdg) || 0 : (selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0);
                                                return pourcentageClient > 0 && (
                                                    <span className="text-orange-600 ml-1 font-extrabold">(+{pourcentageClient}%)</span>
                                                );
                                            })()}
                                        </Label>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-sm font-medium text-gray-700">Total</Label>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-sm font-medium text-gray-700">Poids (kg)</Label>
                                    </div>
                                    <div className="col-span-1">
                                        <Label className="text-sm font-medium text-gray-700">Action</Label>
                                    </div>
                                </div>

                                {selectedProducts.map((product, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-background hover:shadow-md transition-all duration-200 group relative">
                                        <div className="grid grid-cols-12 gap-4 items-end">
                                            {/* Product Selection */}
                                            <div className="col-span-4 space-y-1">
                                                <ProtectedCombobox
                                                    items={products.map((p) => ({
                                                        id: p.id.toString(),
                                                        label: p.product_libelle,
                                                        subLabel: p.product_Ref,
                                                        isActive: p.product_isActive,
                                                    }))}
                                                    value={product.product_id}
                                                    onValueChange={(value: string) => updateProduct(index, 'product_id', value)}
                                                    placeholder="Sélectionner un produit..."
                                                    searchPlaceholder="Rechercher un produit..."
                                                    className="h-9 text-sm"
                                                    dropdownDirection="up"
                                                />
                                            </div>

                                            {/* Quantity */}
                                            <div className="col-span-1 space-y-1">
                                                <Input
                                                    type="number"
                                                    value={product.quantite_produit}
                                                    onChange={(e) => updateProduct(index, 'quantite_produit', Number(e.target.value))}
                                                    className="h-9 text-sm"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>

                                            {/* Price */}
                                            <div className="col-span-2 space-y-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formatNumberForDisplay(product.prix_produit)}
                                                    onChange={(e) => updateProduct(index, 'prix_produit', parseFloat(e.target.value) || 0)}
                                                    className={`h-9 text-sm transition-colors ${usePurchasePrice ? 'bg-red-200 border-red-500 text-red-700 focus:border-red-400 focus:ring-red-400' : ''}`}
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            {/* Total */}
                                            <div className="col-span-2 space-y-1">
                                                <Input
                                                    value={formatNumberForDisplay(product.quantite_produit * product.prix_produit)}
                                                    readOnly
                                                    className={`h-9 text-sm font-medium transition-colors ${usePurchasePrice ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50'}`}
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            {/* Weight */}
                                            <div className="col-span-2 space-y-1">
                                                <Input
                                                    value={formatNumberForDisplay(getDisplayWeight(product))}
                                                    readOnly
                                                    className="h-9 text-sm bg-gray-50"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            {/* Delete Button */}
                                            <div className="col-span-1 flex justify-center items-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeProduct(index)}
                                                    className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Message si aucun produit */}
                                {selectedProducts.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Aucun produit ajouté</p>
                                        <p className="text-sm">Cliquez sur "Ajouter un produit" pour commencer</p>
                                    </div>
                                )}

                                {/* Section de résumé des totaux */}
                                {selectedProducts.length > 0 && (
                                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                                            <Calculator className="w-5 h-5" />
                                            Résumé de la commande
                                        </h3>

                                        {/* Section de calculs détaillés */}
                                        <div className="p-4 bg-white rounded-xl border border-orange-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-orange-100 rounded-lg">
                                                        <Calculator className="w-4 h-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-800">Calculs appliqués</h4>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                                        const remiseSpeciale = data.remise_es !== '' ? parseFloat(data.remise_es) || 0 : (selectedClient?.remise_special ? Number(selectedClient.remise_special) : 0);
                                                        const pourcentageClient = data.client_gdg !== '' ? parseFloat(data.client_gdg) || 0 : (selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0);
                                                        const remiseSpecialeManuelle = data.remise_speciale || 0;
                                                        const remiseTrimestrielle = data.remise_trimestrielle || 0;
                                                        const valeurAjoutee = data.valeur_ajoutee || 0;
                                                        const retour = data.retour || 0;

                                                        return (
                                                            <>
                                                                {remiseSpeciale > 0 && (
                                                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                                                        -{remiseSpeciale}%
                                                                    </Badge>
                                                                )}
                                                                {remiseSpecialeManuelle > 0 && (
                                                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                                                        -{formatNumberForDisplay(remiseSpecialeManuelle)} DH
                                                                    </Badge>
                                                                )}
                                                                {remiseTrimestrielle > 0 && (
                                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                                        -{formatNumberForDisplay(remiseTrimestrielle)} DH
                                                                    </Badge>
                                                                )}
                                                                {pourcentageClient > 0 && (
                                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                                                        +{pourcentageClient}%
                                                                    </Badge>
                                                                )}
                                                                {valeurAjoutee !== 0 && (
                                                                    <Badge variant="outline" className={`text-xs ${valeurAjoutee > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                                        {valeurAjoutee > 0 ? '+' : ''}{formatNumberForDisplay(valeurAjoutee)} DH
                                                                    </Badge>
                                                                )}
                                                                {retour !== 0 && (
                                                                    <Badge variant="outline" className={`text-xs ${retour > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                                        {retour > 0 ? '+' : ''}{formatNumberForDisplay(retour)} DH
                                                                    </Badge>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {/* Total Général */}
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-green-100 rounded-lg">
                                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Total Général {(() => {
                                                                const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                                                const pourcentageClient = data.client_gdg !== '' ? parseFloat(data.client_gdg) || 0 : (selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0);
                                                                return pourcentageClient > 0 ? `(prix avec +${pourcentageClient}%)` : '';
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <span className="text-base font-bold text-green-600">
                                                        {formatNumberForDisplay(selectedProducts.reduce((total, product) => {
                                                            const lineTotal = product.quantite_produit * product.prix_produit;
                                                            return total + lineTotal;
                                                        }, 0))} DH
                                                    </span>
                                                </div>

                                                {/* Remise ES */}
                                                {(() => {
                                                    const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                                    const remiseSpeciale = data.remise_es !== '' ? parseFloat(data.remise_es) || 0 : (selectedClient?.remise_special ? Number(selectedClient.remise_special) : 0);
                                                    const totalGeneral = selectedProducts.reduce((total, product) => {
                                                        const lineTotal = product.quantite_produit * product.prix_produit;
                                                        return total + lineTotal;
                                                    }, 0);
                                                    const montantRemise = (totalGeneral * remiseSpeciale) / 100;

                                                    return remiseSpeciale > 0 ? (
                                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 bg-orange-100 rounded-lg">
                                                                    <AlertCircle className="w-3 h-3 text-orange-600" />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700">Remise ES</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-base font-bold text-orange-600">
                                                                    -{formatNumberForDisplay(montantRemise)} DH
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })()}

                                                {/* Remise Spéciale */}
                                                {Number(data.remise_speciale || 0) > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-purple-100 rounded-lg">
                                                                <AlertCircle className="w-3 h-3 text-purple-600" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Remise Spéciale</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-base font-bold text-purple-600">
                                                                -{formatNumberForDisplay(data.remise_speciale)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Remise Trimestrielle */}
                                                {Number(data.remise_trimestrielle || 0) > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                                                <AlertCircle className="w-3 h-3 text-blue-600" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Remise Trimestrielle</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-base font-bold text-blue-600">
                                                                -{formatNumberForDisplay(data.remise_trimestrielle)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Valeur Ajoutée */}
                                                {Number(data.valeur_ajoutee || 0) !== 0 && (
                                                    <div className={`flex items-center justify-between p-3 rounded-lg border ${Number(data.valeur_ajoutee || 0) > 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-100'}`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-lg ${Number(data.valeur_ajoutee || 0) > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                                                <Package className={`w-3 h-3 ${Number(data.valeur_ajoutee || 0) > 0 ? 'text-green-600' : 'text-red-600'}`} />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Valeur Ajoutée</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-base font-bold ${Number(data.valeur_ajoutee || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {Number(data.valeur_ajoutee || 0) > 0 ? '+' : ''}{formatNumberForDisplay(data.valeur_ajoutee)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Retour */}
                                                {Number(data.retour || 0) !== 0 && (
                                                    <div className={`flex items-center justify-between p-3 rounded-lg border ${Number(data.retour || 0) > 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-100'}`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-lg ${Number(data.retour || 0) > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                                                <RotateCcw className={`w-3 h-3 ${Number(data.retour || 0) > 0 ? 'text-green-600' : 'text-red-600'}`} />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Retour</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-base font-bold ${Number(data.retour || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {Number(data.retour || 0) > 0 ? '+' : ''}{formatNumberForDisplay(data.retour)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Séparateur */}
                                                {(() => {
                                                    const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                                                    const remiseSpeciale = data.remise_es !== '' ? parseFloat(data.remise_es) || 0 : (selectedClient?.remise_special ? Number(selectedClient.remise_special) : 0);
                                                    const pourcentageClient = data.client_gdg !== '' ? parseFloat(data.client_gdg) || 0 : (selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0);
                                                    const hasRemises = remiseSpeciale > 0 || Number(data.remise_speciale || 0) > 0 || Number(data.remise_trimestrielle || 0) > 0 || pourcentageClient > 0 || Number(data.valeur_ajoutee || 0) !== 0 || Number(data.retour || 0) !== 0;

                                                    return hasRemises ? (
                                                        <div className="border-t border-gray-200 pt-2">
                                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="p-1.5 bg-purple-100 rounded-lg">
                                                                        <Check className="w-3 h-3 text-purple-600" />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-700">Montant Total Final</span>
                                                                </div>
                                                                <span className="text-lg font-bold text-purple-600">
                                                                    {(() => {
                                                                        const totalGeneral = selectedProducts.reduce((total, product) => {
                                                                            const lineTotal = product.quantite_produit * product.prix_produit;
                                                                            return total + lineTotal;
                                                                        }, 0);
                                                                        const montantRemise = (totalGeneral * remiseSpeciale) / 100;
                                                                        const montantTotal = totalGeneral - montantRemise - data.remise_speciale - data.remise_trimestrielle + data.valeur_ajoutee + data.retour;
                                                                        return formatNumberForDisplay(montantTotal);
                                                                    })()} DH
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <RotateCcw className="w-4 h-4 mr-1 animate-spin" />
                                    Modification...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Modifier la sortie
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
        </>
    );
}
