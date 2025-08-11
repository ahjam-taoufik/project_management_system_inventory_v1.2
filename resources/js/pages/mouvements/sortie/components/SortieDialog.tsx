'use client';

import React from 'react';
import ProtectedCombobox from '@/components/patterns/ProtectedCombobox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Check, Truck, Package, AlertCircle, CheckCircle, XCircle, RotateCcw, Calculator, RefreshCw, Loader2 } from 'lucide-react';
import { ConfirmDialog } from "@/components/dialogs";
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Client, Commercial, Product } from '../types';
import { cn } from "@/lib/utils";
import { usePermissions } from '@/hooks/use-permissions';

interface SortieDialogProps {
    products: Product[];
    commerciaux: Commercial[];
    clients: Client[];
    livreurs?: Array<{
        id: number;
        nom: string;
        telephone?: string;
    }>;
}

interface SortieFormData {
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
    [key: string]: string | number | Array<{
        product_id: string;
        quantite_produit: number;
        prix_produit: number;
        poids_produit: number;
        use_achat_price?: boolean;
    }>; // Index signature avec types spécifiques
}

export default function SortieDialog({ products, commerciaux, clients, livreurs = [] }: SortieDialogProps) {
    const [open, setOpen] = useState(false);
    const [usePurchasePrice, setUsePurchasePrice] = useState(false);
    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const [showDuplicateBlDialog, setShowDuplicateBlDialog] = useState(false);
    const [isLoadingNextNumber, setIsLoadingNextNumber] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { can } = usePermissions();

    // États locaux pour gérer l'affichage des champs numériques
    const [remiseSpecialeDisplay, setRemiseSpecialeDisplay] = useState('');
    const [remiseTrimestrielleDisplay, setRemiseTrimestrielleDisplay] = useState('');
    const [valeurAjouteeDisplay, setValeurAjouteeDisplay] = useState('');
    const [retourDisplay, setRetourDisplay] = useState('');

    type SortieProductLine = {
        uid: string;
        product_id: string;
        quantite_produit: number;
        prix_produit: number;
        poids_produit: number;
        _isOffered?: boolean;
        _sourceUid?: string;
    };

    const generateUid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    const [selectedProducts, setSelectedProducts] = useState<SortieProductLine[]>(() => ([
        {
            uid: generateUid(),
            product_id: '',
            quantite_produit: 1,
            prix_produit: 0,
            poids_produit: 0,
        },
    ]));

    const { data, setData, errors, reset } = useForm<SortieFormData>({
        numero_bl: '',
        commercial_id: '',
        client_id: '',
        date_bl: new Date().toISOString().split('T')[0],
        livreur_id: '',
        products: [],
        remise_speciale: 0,
        remise_trimestrielle: 0,
        valeur_ajoutee: 0,
        retour: 0,
        remise_es: '',
        client_gdg: '',
        total_general: 0,
        montant_total_final: 0,
        total_poids: 0,
        montant_remise_especes: 0,
    });

    // Effet pour mettre à jour les prix de tous les produits lorsque l'état du switch change
    React.useEffect(() => {
        setSelectedProducts(prevProducts =>
            prevProducts.map((product: SortieProductLine) => {
                // Ne jamais recalculer les lignes offertes
                if (product._isOffered) {
                    return product;
                }
                if (product.product_id) {
                    const productData = products.find(p => p.id.toString() === product.product_id);
                    if (productData) {
                        // Récupérer le pourcentage client G/DG (peut être 0 si aucun client sélectionné)
                        const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                        const pourcentageClient = selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0;

                        // Calculer le prix de base avec vérification et conversion en nombre
                        const prixDeBase = usePurchasePrice
                            ? Number(productData.prix_achat_colis || 0)
                            : Number(productData.prix_vente_colis || 0);

                        // Vérifier si le prix actuel correspond au prix original (avec tolérance pour les arrondis)
                        const currentPrice = product.prix_produit;
                        const isOriginalPrice = Math.abs(currentPrice - prixDeBase) < 0.01;

                        let newPrice;
                        if (isOriginalPrice) {
                            // Si c'est un prix par défaut, appliquer le pourcentage au prix de base
                            newPrice = prixDeBase + (prixDeBase * pourcentageClient / 100);
                        } else {
                            // Si c'est un prix personnalisé, appliquer le pourcentage au prix personnalisé
                            newPrice = currentPrice + (currentPrice * pourcentageClient / 100);
                        }

                        return {
                            ...product,
                            prix_produit: newPrice,
                            poids_produit: productData.product_Poids || product.poids_produit || 0,
                        };
                    }
                }
                return product;
            })
        );
    }, [usePurchasePrice, products, data.client_id]);

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



    // Effet pour recalculer les prix unitaires quand remise_es ou client_gdg changent
    React.useEffect(() => {
        setSelectedProducts(prevProducts =>
            prevProducts.map((product: SortieProductLine) => {
                // Ne jamais recalculer les lignes offertes
                if (product._isOffered) {
                    return product;
                }
                if (product.product_id) {
                    const productData = products.find(p => p.id.toString() === product.product_id);
                    if (productData) {
                        // Récupérer le pourcentage client G/DG (peut être 0 si aucun client sélectionné)
                        const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
                        const pourcentageClient = data.client_gdg !== '' ? parseFloat(data.client_gdg) || 0 : (selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0);

                        // Calculer le prix de base avec vérification et conversion en nombre
                        const prixDeBase = usePurchasePrice
                            ? Number(productData.prix_achat_colis || 0)
                            : Number(productData.prix_vente_colis || 0);

                        // Vérifier si le prix actuel correspond au prix original (avec tolérance pour les arrondis)
                        const currentPrice = product.prix_produit;
                        const isOriginalPrice = Math.abs(currentPrice - prixDeBase) < 0.01;

                        let newPrice;
                        if (isOriginalPrice) {
                            // Si c'est un prix par défaut, appliquer le pourcentage au prix de base
                            newPrice = prixDeBase + (prixDeBase * pourcentageClient / 100);
                        } else {
                            // Si c'est un prix personnalisé, recalculer à partir du prix de base pour éviter l'accumulation
                            // On applique le pourcentage au prix de base, pas au prix actuel qui peut contenir des pourcentages précédents
                            newPrice = prixDeBase + (prixDeBase * pourcentageClient / 100);
                        }

                        return {
                            ...product,
                            prix_produit: newPrice,
                            poids_produit: productData.product_Poids || product.poids_produit || 0,
                        };
                    }
                }
                return product;
            })
        );
    }, [data.client_gdg, data.remise_es, products, usePurchasePrice, data.client_id]);

    // Fonction pour formater les nombres en format français (pour l'affichage uniquement)
    const formatNumber = (value: number | string): string => {
        const num = parseFloat(value?.toString() || '0');
        if (isNaN(num)) return '0,00';

        // Convertir en chaîne avec 2 décimales
        const formatted = num.toFixed(2);

        // Ajouter les espaces pour les milliers
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return parts.join(',');
    };

    // Fonction pour formater les nombres pour l'affichage dans les inputs (sans espaces)
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

    // Calculer le total général
    const totalGeneral = selectedProducts.reduce((total, product) => {
        const lineTotal = product.quantite_produit * product.prix_produit;
        return total + lineTotal;
    }, 0);

    // Calculer le total poids
    const totalPoids = selectedProducts.reduce((total, product) => {
        return total + getDisplayWeight(product);
    }, 0);

    // Calculer la remise espèces (remise_es)
    const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
    const remiseSpeciale = data.remise_es !== '' ? parseFloat(data.remise_es) || 0 : (selectedClient?.remise_special ? Number(selectedClient.remise_special) : 0);
    const montantRemise = (totalGeneral * remiseSpeciale) / 100; // Montant de remise espèces calculé

    // Calculer le pourcentage client G/DG (addition) - maintenant appliqué aux prix unitaires
    const pourcentageClient = data.client_gdg !== '' ? parseFloat(data.client_gdg) || 0 : (selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0);

    // Calculer la remise spéciale manuelle (zone de texte) - valeur directe en DH
    const remiseSpecialeManuelle = data.remise_speciale || 0;
    const montantRemiseManuelle = remiseSpecialeManuelle; // Valeur directe, pas de calcul de pourcentage

    // Calculer la remise trimestrielle (zone de texte) - valeur directe en DH
    const remiseTrimestrielle = data.remise_trimestrielle || 0;
    const montantRemiseTrimestrielle = remiseTrimestrielle; // Valeur directe, pas de calcul de pourcentage

    // Calculer la valeur ajoutée (zone de texte) - peut être négative ou positive
    const valeurAjoutee = data.valeur_ajoutee || 0;
    const montantValeurAjoutee = valeurAjoutee; // Valeur directe, peut être négative ou positive

    // Calculer le retour (zone de texte) - peut être négative ou positive
    const retour = data.retour || 0;
    const montantRetour = retour; // Valeur directe, peut être négative ou positive

    // Calculer le montant total final (après toutes les remises)
    // Note: Le pourcentage client G/DG est déjà appliqué aux prix unitaires, donc on ne l'ajoute pas ici
    const montantTotal = totalGeneral - montantRemise - montantRemiseManuelle - montantRemiseTrimestrielle + montantValeurAjoutee + montantRetour;

    // Suppression: plus d'ajout de promotions au submit (gestion live uniquement)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();



        if (selectedProducts.length === 0) {
            toast.error('Veuillez ajouter au moins un produit');
            return;
        }

        // Vérifier s'il y a des lignes sans produit sélectionné
        const linesWithoutProduct = selectedProducts.filter(product => product.product_id === '');
        if (linesWithoutProduct.length > 0) {
            setShowAlertDialog(true);
            return;
        }



        // Update the form data with selected products and calculated totals before submitting
        // Format products with 2 decimal places and ensure poids_produit is the total weight (quantity * unit weight)
        const formattedProducts = selectedProducts.map(product => {
            // Calculer le poids total de la ligne (quantité × poids unitaire)
            const productData = products.find(p => p.id.toString() === product.product_id);
            const unitWeight = productData?.product_Poids || 0;
            const totalWeight = product.quantite_produit * unitWeight;

            return {
                ...product,
                // Ne pas envoyer les champs internes
                uid: undefined,
                _isOffered: undefined,
                _sourceUid: undefined,
                quantite_produit: Number(Number(product.quantite_produit || 0).toFixed(2)),
                prix_produit: Number(Number(product.prix_produit || 0).toFixed(2)),
                poids_produit: Number(Number(totalWeight || 0).toFixed(2)), // Poids total de la ligne
                use_achat_price: usePurchasePrice
            };
        });

                // S'assurer que commercial_id est défini
        const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
        const commercialId = selectedClient?.idCommercial?.toString() || '';

        // Créer l'objet de données complet avec toutes les valeurs calculées
        const submitData = {
            ...data,
            commercial_id: commercialId,
            products: formattedProducts,
            total_general: Number(Number(totalGeneral || 0).toFixed(2)),
            montant_total_final: Number(Number(montantTotal || 0).toFixed(2)),
            total_poids: Number(Number(totalPoids || 0).toFixed(2)),
            montant_remise_especes: Number(Number(montantRemise || 0).toFixed(2)),
            remise_speciale: Number(Number(data.remise_speciale || 0).toFixed(2)),
            remise_trimestrielle: Number(Number(data.remise_trimestrielle || 0).toFixed(2)),
            valeur_ajoutee: Number(Number(data.valeur_ajoutee || 0).toFixed(2)),
            retour: Number(Number(data.retour || 0).toFixed(2))
        };


        // Utiliser router.post avec gestion manuelle de l'état processing
        setIsSubmitting(true);
        router.post(route('sorties.store'), submitData, {
            onStart: () => {
                // Forcer le re-render pour afficher le spinner
                setData(prev => ({ ...prev }));
            },
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('Sortie créée avec succès');
                setOpen(false);
                reset();
                setSelectedProducts([
                    {
                        uid: generateUid(),
                        product_id: '',
                        quantite_produit: 1,
                        prix_produit: 0,
                        poids_produit: 0,
                    },
                ]);
            },
            onError: (errors: Record<string, string>) => {
                setIsSubmitting(false);


                // Vérifier si c'est une erreur de numéro BL dupliqué
                if (errors.numero_bl && errors.numero_bl.includes('déjà')) {
                    setShowDuplicateBlDialog(true);
                } else {
                    toast.error('Erreur lors de la création de la sortie');
                }
            },
        });
    };

    const addProduct = () => {
        setSelectedProducts([
            {
                uid: generateUid(),
                product_id: '',
                quantite_produit: 1,
                prix_produit: 0,
                poids_produit: 0,
            },
            ...selectedProducts,
        ]);
    };

    const removeProduct = (index: number) => {
        const line = selectedProducts[index];
        if (!line) return;
        // Supprimer la ligne et sa ligne offerte liée le cas échéant
        const remaining = selectedProducts.filter((l, i) => i !== index && l._sourceUid !== line.uid);
        setSelectedProducts(remaining);
    };

    const recalculatePromotionForIndex = async (lines: SortieProductLine[], index: number) => {
        const baseLine = lines[index];
        if (!baseLine || baseLine._isOffered) return;
        if (!baseLine.product_id || !baseLine.quantite_produit || baseLine.quantite_produit <= 0) {
            // Remove existing offered line if any
            setSelectedProducts(prev => prev.filter(l => l._sourceUid !== baseLine.uid));
            return;
        }
        const product = products.find(p => p.id.toString() === baseLine.product_id);
        if (!product) return;
        try {
            const promoRes = await fetch(`/promotion-for-product/${product.product_Ref}?type=sortie`);
            if (!promoRes.ok) return;
            const promoData = await promoRes.json();
            if (!promoData || !promoData.exists) {
                setSelectedProducts(prev => prev.filter(l => l._sourceUid !== baseLine.uid));
                return;
            }
            const x = Number(promoData.quantite_produit_promotionnel || 0);
            const y = Number(promoData.offered_product?.quantite_offerte || 0);
            const q = Number(baseLine.quantite_produit || 0);
            const offeredProductId = promoData.offered_product?.product_id;
            if (!(x > 0 && y > 0 && q >= x) || !offeredProductId) {
                setSelectedProducts(prev => prev.filter(l => l._sourceUid !== baseLine.uid));
                return;
            }
            const nb_offerts = Math.floor(q / x) * y;
            const offeredProduct = products.find(p => p.id === offeredProductId);
            const unitWeight = offeredProduct?.product_Poids || 0;

            setSelectedProducts(prev => {
                // Retirer ancienne ligne offerte liée
                const withoutOld = prev.filter(l => l._sourceUid !== baseLine.uid);
                // Insérer/ajouter la nouvelle ligne offerte juste après la ligne source si possible
                const newOffered: SortieProductLine = {
                    uid: generateUid(),
                    _isOffered: true,
                    _sourceUid: baseLine.uid,
                    product_id: offeredProductId.toString(),
                    quantite_produit: nb_offerts,
                    prix_produit: 0,
                    poids_produit: Number((unitWeight * nb_offerts).toFixed(2)),
                };
                // Trouver la position de baseLine dans withoutOld (peut avoir bougé)
                const basePos = withoutOld.findIndex(l => l.uid === baseLine.uid);
                if (basePos === -1) return [...withoutOld, newOffered];
                const before = withoutOld.slice(0, basePos + 1);
                const after = withoutOld.slice(basePos + 1);
                return [...before, newOffered, ...after];
            });
        } catch (e) {
            console.error('Erreur lors de la récupération de la promotion (sortie):', e);
        }
    };

    const updateProduct = async (index: number, field: keyof SortieProductLine, value: string | number) => {
        const updatedProducts = [...selectedProducts];

        const current = updatedProducts[index];
        if (!current) return;
        if (current._isOffered) {
            // Ne pas éditer les lignes offertes manuellement
            return;
        }

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
                    poids_produit: selectedProduct.product_Poids ? selectedProduct.product_Poids * updatedProducts[index].quantite_produit : 0, // Poids total de la ligne
                };
            }
                } else if (field === 'prix_produit') {
            // Si l'utilisateur modifie manuellement le prix, appliquer le pourcentage client G/DG
            const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
            const pourcentageClient = data.client_gdg !== '' ? parseFloat(data.client_gdg) || 0 : (selectedClient?.pourcentage ? Number(selectedClient.pourcentage) : 0);

            // Appliquer le pourcentage au prix saisi par l'utilisateur
            const prixAvecPourcentage = (value as number) + ((value as number) * pourcentageClient / 100);

            updatedProducts[index] = {
                ...updatedProducts[index],
                [field]: prixAvecPourcentage,
            };
        } else {
            updatedProducts[index] = {
                ...updatedProducts[index],
                [field]: value,
            };

            // Si on change la quantité, recalculer le poids total de la ligne automatiquement
            if (field === 'quantite_produit') {
                const selectedProduct = products.find((p) => p.id.toString() === updatedProducts[index].product_id);
                if (selectedProduct && selectedProduct.product_Poids) {
                    updatedProducts[index].poids_produit = (value as number) * selectedProduct.product_Poids; // Poids total de la ligne
                }
            }
        }

        setSelectedProducts(updatedProducts);
        // Recalculer la promotion pour cette ligne avec l'état mis à jour
        await recalculatePromotionForIndex(updatedProducts, index);
    };

    // Fonction pour vérifier si une ligne de produit est valide
    const isProductLineValid = (productLine: { product_id: string; quantite_produit: number; prix_produit: number; poids_produit: number; _isOffered?: boolean }) => {
        // Les lignes offertes sont valides même à prix 0
        if (productLine._isOffered) {
            return productLine.product_id !== '' && productLine.quantite_produit > 0;
        }
        return productLine.product_id !== '' && productLine.quantite_produit > 0 && productLine.prix_produit >= 0;
    };

    // Fonction pour vérifier si le formulaire peut être soumis
    const canSubmitForm = () => {
        // Vérifier les champs obligatoires du formulaire principal
        const selectedClient = clients.find((c) => c.id.toString() === data.client_id);
        const hasCommercial = selectedClient?.idCommercial;

        const mainFieldsValid = data.numero_bl.trim() !== '' &&
                               data.client_id !== '' &&
                               data.date_bl !== '' &&
                               hasCommercial;

        // Vérifier qu'il y a au moins une ligne de produit valide
        const hasValidProductLine = selectedProducts.some(isProductLineValid);

        return mainFieldsValid && hasValidProductLine;
    };

    // Fonction pour réinitialiser complètement le formulaire
    const resetForm = () => {
        reset();
        setSelectedProducts([
            {
                uid: generateUid(),
                product_id: '',
                quantite_produit: 1,
                prix_produit: 0,
                poids_produit: 0,
            },
        ]);
        // Réinitialiser les états d'affichage
        setRemiseSpecialeDisplay('0.00');
        setRemiseTrimestrielleDisplay('0.00');
        setValeurAjouteeDisplay('0.00');
        setRetourDisplay('0.00');
    };

    const loadNextBlNumber = async () => {
        setIsLoadingNextNumber(true);
        try {
            const response = await fetch(route('api.next-bl-number'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setData('numero_bl', data.next_number);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du prochain numéro:', error);
        } finally {
            setIsLoadingNextNumber(false);
        }
    };

    // Ne pas afficher le bouton si l'utilisateur n'a pas la permission
    if (!can('sorties.create')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (newOpen) {
                // Initialiser les champs d'affichage quand la modal s'ouvre
                setRemiseSpecialeDisplay('0.00');
                setRemiseTrimestrielleDisplay('0.00');
                setValeurAjouteeDisplay('0.00');
                setRetourDisplay('0.00');
                // Charger automatiquement le prochain numéro de BL
                loadNextBlNumber();
            } else {
                // Réinitialiser complètement quand la modal se ferme
                resetForm();
            }
        }}>
            <DialogTrigger asChild>
                <Button id="add-sortie-button" className="h-10 w-full sm:w-auto justify-start transition-all duration-200 hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Sortie
                </Button>
            </DialogTrigger>
            <DialogContent
                className="w-[95vw] max-w-[1200px] max-h-[95vh] overflow-y-auto p-4 sm:p-6 sm:max-w-[1200px] md:p-7 md:px-8 poppins mt-8"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl md:text-[22px] text-center sm:text-left flex items-center gap-2">
                        <Truck className="w-6 h-6 text-blue-600" />
                        Créer une nouvelle sortie
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulaire pour créer une nouvelle sortie
                    </DialogDescription>
                </DialogHeader>
                <Separator className="my-4" />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section des quatre colonnes principales côte à côte */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                                        <Badge variant="secondary" className="text-xs">Auto-suggéré</Badge>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="numero-bl"
                                            name="numero_bl"
                                            type="text"
                                            placeholder="BL2508001"
                                            className="h-9 text-sm transition-all duration-200 pr-16"
                                            value={data.numero_bl}
                                            onChange={(e) => setData('numero_bl', e.target.value)}
                                            aria-describedby={errors.numero_bl ? 'numero-bl-error' : undefined}
                                        />
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                            {isLoadingNextNumber ? (
                                                <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:bg-blue-100"
                                                    onClick={loadNextBlNumber}
                                                    title="Recharger le prochain numéro"
                                                >
                                                    <RefreshCw className="w-3 h-3 text-blue-500" />
                                                </Button>
                                            )}
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
                                        type="number"
                                        step="0.01"
                                        value={data.client_gdg || ''}
                                        onChange={(e) => setData('client_gdg', e.target.value)}
                                        className="h-9 text-sm"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-purple-600 font-medium">
                                        💡 Valeurs positives ou négatives
                                    </p>
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
                                        value={remiseSpecialeDisplay}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Permettre la saisie de nombres et décimales
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                setRemiseSpecialeDisplay(value);
                                                setData('remise_speciale', parseFloat(value) || 0);
                                            }
                                        }}
                                        onBlur={() => {
                                            const numValue = parseFloat(remiseSpecialeDisplay) || 0;
                                            const formatted = formatNumberForDisplay(numValue);
                                            setRemiseSpecialeDisplay(formatted);
                                            setData('remise_speciale', numValue);
                                        }}
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
                                        value={remiseTrimestrielleDisplay}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Permettre la saisie de nombres et décimales
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                setRemiseTrimestrielleDisplay(value);
                                                setData('remise_trimestrielle', parseFloat(value) || 0);
                                            }
                                        }}
                                        onBlur={() => {
                                            const numValue = parseFloat(remiseTrimestrielleDisplay) || 0;
                                            const formatted = formatNumberForDisplay(numValue);
                                            setRemiseTrimestrielleDisplay(formatted);
                                            setData('remise_trimestrielle', numValue);
                                        }}
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
                                        value={valeurAjouteeDisplay}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Permettre la saisie de nombres et décimales
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                setValeurAjouteeDisplay(value);
                                                setData('valeur_ajoutee', parseFloat(value) || 0);
                                            }
                                        }}
                                        onBlur={() => {
                                            const numValue = parseFloat(valeurAjouteeDisplay) || 0;
                                            const formatted = formatNumberForDisplay(numValue);
                                            setValeurAjouteeDisplay(formatted);
                                            setData('valeur_ajoutee', numValue);
                                        }}
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
                                        value={retourDisplay}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Permettre la saisie de nombres et décimales
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                setRetourDisplay(value);
                                                setData('retour', parseFloat(value) || 0);
                                            }
                                        }}
                                        onBlur={() => {
                                            const numValue = parseFloat(retourDisplay) || 0;
                                            const formatted = formatNumberForDisplay(numValue);
                                            setRetourDisplay(formatted);
                                            setData('retour', numValue);
                                        }}
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

                    {/* Section des produits avec Card moderne */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Produits
                                    </CardTitle>
                                    <CardDescription>
                                        Gestion des produits et calculs automatiques
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Indicateur de total poids */}
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total poids</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xl font-bold text-blue-600">
                                                {formatNumber(totalPoids)} kg
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
                                        size="sm"
                                        onClick={addProduct}
                                        className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Ajouter un produit
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
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
                                            Prix {pourcentageClient > 0 && (
                                                <span className="text-orange-600 ml-1 font-extrabold">(+{pourcentageClient}%)</span>
                                            )}
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

                                {selectedProducts.map((productItem, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "border rounded-lg p-4 hover:shadow-md transition-all duration-200 group relative",
                                            productItem._isOffered ? "bg-blue-50 border-blue-200" : "bg-background"
                                        )}
                                    >
                                        <div className="grid grid-cols-12 gap-4 items-end">
                                            {productItem._isOffered && (
                                                <div className="col-span-12 -mt-2 -mb-2">
                                                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-[11px]">
                                                        Offert (promotion)
                                                    </Badge>
                                                </div>
                                            )}
                                            {/* Product Selection */}
                                            <div className="col-span-4 space-y-1">
                                                <ProtectedCombobox
                                                    items={products
                                                        .filter((product) => product.product_isActive)
                                                        .map((product) => ({
                                                            id: product.id,
                                                            label: product.product_libelle,
                                                            subLabel: product.product_Ref,
                                                            isActive: product.product_isActive,
                                                        }))}
                                                    value={productItem.product_id}
                                                    onValueChange={(value) => updateProduct(index, 'product_id', value)}
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
                                                    min="0"
                                                    step="0.01"
                                                    value={productItem.quantite_produit}
                                                    onChange={(e) => {
                                                        if (productItem._isOffered) return; // non éditable
                                                        const newQuantity = parseFloat(e.target.value) || 0;
                                                        updateProduct(index, 'quantite_produit', newQuantity);
                                                    }}
                                                    className={cn("h-9 text-sm", productItem._isOffered && "bg-blue-100 cursor-not-allowed")}
                                                    placeholder="0"
                                                    readOnly={!!productItem._isOffered}
                                                />
                                            </div>

                                            {/* Price */}
                                            <div className="col-span-2 space-y-1">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={formatNumberForDisplay(productItem.prix_produit)}
                                                        onChange={(e) => {
                                                            if (productItem._isOffered) return; // non éditable
                                                            updateProduct(index, 'prix_produit', parseFloat(e.target.value) || 0);
                                                        }}
                                                        className={cn(
                                                            "h-9 text-sm transition-colors",
                                                            usePurchasePrice && "bg-red-200 border-red-500 text-red-700 focus:border-red-400 focus:ring-red-400",
                                                            productItem._isOffered && "bg-blue-100 cursor-not-allowed"
                                                        )}
                                                        placeholder="0.00"
                                                        readOnly={!!productItem._isOffered}
                                                    />
                                            </div>

                                            {/* Total */}
                                            <div className="col-span-2 space-y-1">
                                                <Input
                                                    value={formatNumberForDisplay(productItem.quantite_produit * productItem.prix_produit)}
                                                    readOnly
                                                    className={`h-9 text-sm font-medium transition-colors ${usePurchasePrice ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50'}`}
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            {/* Weight */}
                                            <div className="col-span-2 space-y-1">
                                                <Input
                                                    value={formatNumberForDisplay(getDisplayWeight(productItem))}
                                                    readOnly
                                                    className="h-9 text-sm bg-gray-50"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            {/* Delete Button and Status */}
                                            <div className="col-span-1 flex justify-center items-center space-x-2">
                                                <div className="flex items-center space-x-1">
                                                    {isProductLineValid(productItem) ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                                                    )}
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
                                                    {remiseSpeciale > 0 && (
                                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                                            -{remiseSpeciale}%
                                                        </Badge>
                                                    )}
                                                    {remiseSpecialeManuelle > 0 && (
                                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                                            -{formatNumber(remiseSpecialeManuelle)} DH
                                                        </Badge>
                                                    )}
                                                    {remiseTrimestrielle > 0 && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                            -{formatNumber(remiseTrimestrielle)} DH
                                                        </Badge>
                                                    )}
                                                    {pourcentageClient > 0 && (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                                            +{pourcentageClient}%
                                                        </Badge>
                                                    )}
                                                    {valeurAjoutee !== 0 && (
                                                        <Badge variant="outline" className={`text-xs ${valeurAjoutee > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                            {valeurAjoutee > 0 ? '+' : ''}{formatNumber(montantValeurAjoutee)} DH
                                                        </Badge>
                                                    )}
                                                    {retour !== 0 && (
                                                        <Badge variant="outline" className={`text-xs ${retour > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                            {retour > 0 ? '+' : ''}{formatNumber(montantRetour)} DH
                                                        </Badge>
                                                    )}
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
                                                            Total Général {pourcentageClient > 0 && `(prix avec +${pourcentageClient}%)`}
                                                        </span>
                                                    </div>
                                                    <span className="text-base font-bold text-green-600">
                                                        {formatNumber(totalGeneral)} DH
                                                    </span>
                                                </div>

                                                {/* Remise ES */}
                                                {remiseSpeciale > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-orange-100 rounded-lg">
                                                                <AlertCircle className="w-3 h-3 text-orange-600" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Remise ES</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-base font-bold text-orange-600">
                                                                -{formatNumber(montantRemise)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Remise Spéciale */}
                                                {remiseSpecialeManuelle > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-purple-100 rounded-lg">
                                                                <AlertCircle className="w-3 h-3 text-purple-600" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Remise Spéciale</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-base font-bold text-purple-600">
                                                                -{formatNumber(montantRemiseManuelle)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Remise Trimestrielle */}
                                                {remiseTrimestrielle > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                                                <AlertCircle className="w-3 h-3 text-blue-600" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Remise Trimestrielle</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-base font-bold text-blue-600">
                                                                -{formatNumber(montantRemiseTrimestrielle)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Valeur Ajoutée */}
                                                {valeurAjoutee !== 0 && (
                                                    <div className={`flex items-center justify-between p-3 rounded-lg border ${valeurAjoutee > 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-100'}`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-lg ${valeurAjoutee > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                                                <Package className={`w-3 h-3 ${valeurAjoutee > 0 ? 'text-green-600' : 'text-red-600'}`} />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Valeur Ajoutée</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-base font-bold ${valeurAjoutee > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {valeurAjoutee > 0 ? '+' : ''}{formatNumber(montantValeurAjoutee)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Retour */}
                                                {retour !== 0 && (
                                                    <div className={`flex items-center justify-between p-3 rounded-lg border ${retour > 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-100'}`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-lg ${retour > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                                                <RotateCcw className={`w-3 h-3 ${retour > 0 ? 'text-green-600' : 'text-red-600'}`} />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Retour</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-base font-bold ${retour > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {retour > 0 ? '+' : ''}{formatNumber(montantRetour)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Séparateur */}
                                                {(remiseSpeciale > 0 || remiseSpecialeManuelle > 0 || remiseTrimestrielle > 0 || pourcentageClient > 0 || valeurAjoutee !== 0 || retour !== 0) && (
                                                    <div className="border-t border-gray-200 pt-2">
                                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 bg-purple-100 rounded-lg">
                                                                    <Check className="w-3 h-3 text-purple-600" />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700">Montant Total Final</span>
                                                            </div>
                                                            <span className="text-lg font-bold text-purple-600">
                                                                {formatNumber(montantTotal)} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions principales avec style amélioré */}
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            className="transition-all duration-200 hover:bg-muted flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Réinitialiser
                        </Button>

                        <DialogFooter className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    resetForm();
                                    setOpen(false);
                                }}
                                className="w-full sm:w-auto transition-all duration-200"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !canSubmitForm()}
                                className="w-full sm:w-auto transition-all duration-200 hover:scale-105"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Création...
                                    </>
                                ) : (
                                    'Créer la sortie'
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>

            {/* Alert Dialog pour les lignes sans produit */}
            <ConfirmDialog
                open={showAlertDialog}
                onOpenChange={setShowAlertDialog}
                title="Lignes de commande incomplètes"
                description="Certaines lignes de commande ne contiennent pas de produit sélectionné. Veuillez sélectionner un produit pour toutes les lignes ou supprimer les lignes vides avant de créer la sortie."
                type="error"
                confirmText="Compris"
                cancelText="Fermer"
            />

            {/* Alert Dialog pour numéro BL dupliqué */}
            <ConfirmDialog
                open={showDuplicateBlDialog}
                onOpenChange={setShowDuplicateBlDialog}
                title="Numéro de BL déjà utilisé"
                description="Le numéro de bon de livraison que vous avez saisi existe déjà dans le système. Veuillez utiliser un numéro unique ou générer automatiquement le prochain numéro disponible."
                type="error"
                confirmText="Compris"
                cancelText="Fermer"
                onConfirm={() => {
                    // Optionnel : générer automatiquement le prochain numéro
                    loadNextBlNumber();
                }}
            />
        </Dialog>
    );
}
