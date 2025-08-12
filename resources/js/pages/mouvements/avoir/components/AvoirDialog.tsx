"use client";
import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Loader2, Plus, Trash2, Check, ChevronsUpDown, RotateCcw, AlertCircle, CheckCircle, XCircle, Truck, RotateCcw as RotateCcwIcon } from "lucide-react";
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from "@/lib/utils";
import React from 'react';
import ProtectedCombobox from '@/components/patterns/ProtectedCombobox';

interface Product {
  id: number;
  product_libelle: string;
  product_Ref: string;
  product_isActive: boolean;
  prix_vente_colis: number;
}

interface Client {
  id: number;
  fullName: string;
  code: string;
  idCommercial?: number;
}

interface Commercial {
  id: number;
  commercial_fullName: string;
  commercial_code: string;
}

interface Livreur {
  id: number;
  nom: string;
  telephone: string;
}

interface ProductLine {
  id: string;
  product_id: string;
  ref_produit: string;
  prix_unitaire: string;
  prix_original: string;
  prix_personnalise: boolean;
  quantite_retournee: string;
  montant_ligne: string;
  raison_detail: string;
}

// Composant ProductCombobox pour la sélection avec recherche
function ProductCombobox({
  products,
  value,
  onValueChange,
  disabled = false,
  placeholder = "Sélectionnez un produit..."
}: {
  products: Product[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const comboboxRef = React.useRef<HTMLDivElement>(null);

  const selectedProduct = products.find(product => product.id.toString() === value);

  // Filtrer les produits basé sur la recherche
  const filteredProducts = products.filter(product => {
    if (!searchValue) return true;
    const searchLower = searchValue.toLowerCase();
    return (
      product.product_libelle.toLowerCase().includes(searchLower) ||
      product.product_Ref.toLowerCase().includes(searchLower)
    );
  });

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id.toString() === productId);
    if (product && product.product_isActive) {
      onValueChange(productId);
      setOpen(false);
      setSearchValue("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Ajout: fermeture du dropdown lors d'un clic extérieur
  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={comboboxRef}
      className="relative"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between h-10 sm:h-11 transition-all duration-200 hover:shadow-sm"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {selectedProduct ? (
          <span className={cn(
            "truncate",
            !selectedProduct.product_isActive && "text-gray-400"
          )}>
            {selectedProduct.product_libelle}
            {!selectedProduct.product_isActive && " (inactif)"}
          </span>
        ) : (
          placeholder
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div
          className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[300px] overflow-hidden animate-in slide-in-from-top-2 duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="p-2 border-b bg-gray-50">
            <Input
              placeholder="Rechercher un produit..."
              value={searchValue}
              onChange={handleInputChange}
              className="mb-2"
              autoFocus
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Aucun produit trouvé.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    "flex items-center gap-2 p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 transition-colors duration-150",
                    !product.product_isActive && "opacity-50 cursor-not-allowed",
                    value === product.id.toString() && "bg-blue-100"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleProductSelect(product.id.toString());
                  }}
                  onMouseDown={() => {
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      value === product.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={cn(
                      "truncate font-medium",
                      !product.product_isActive && "text-gray-400"
                    )}>
                      {product.product_libelle}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      Ref: {product.product_Ref}
                    </span>
                  </div>
                  {!product.product_isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactif
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AvoirDialog({
  clients = [],
  commerciaux = [],
  livreurs = [],
  products = []
}: {
  clients?: Client[];
  commerciaux?: Commercial[];
  livreurs?: Livreur[];
  products?: Product[];
}) {
  const [open, setOpen] = useState(false);
  const { can } = usePermissions();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { data, setData, errors, reset, processing } = useForm({
    numero_avoir: "",
    date_avoir: "",
    client_id: "",
    commercial_id: "",
    livreur_id: "",
    raison_retour: "",
    ajustement_financier: "",
  });

  // État pour gérer les lignes de produits
  const [productLines, setProductLines] = useState<ProductLine[]>(() => {
    const initialId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    return [{
      id: initialId,
      product_id: '',
      ref_produit: '',
      prix_unitaire: '',
      prix_original: '',
      prix_personnalise: false,
      quantite_retournee: '',
      montant_ligne: '',
      raison_detail: '',
    }];
  });

  // Fonction pour récupérer les détails du produit sélectionné
  const handleProductChange = async (productId: string, lineId: string) => {
    if (!productId) {
      updateProductLine(lineId, {
        ref_produit: '',
        prix_unitaire: '',
        prix_original: '',
        prix_personnalise: false,
        montant_ligne: '',
      });
      return;
    }

    try {
      // Utiliser directement les données des produits disponibles
      const selectedProduct = products.find(product => product.id.toString() === productId);
      if (selectedProduct) {
        const prix = selectedProduct.prix_vente_colis ? selectedProduct.prix_vente_colis.toString() : '0';
        const currentLine = productLines.find(line => line.id === lineId);
        const total = calculateTotal(prix, currentLine?.quantite_retournee || '');

        updateProductLine(lineId, {
          ref_produit: selectedProduct.product_Ref || '',
          prix_unitaire: prix,
          prix_original: prix,
          prix_personnalise: false,
          montant_ligne: total,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du produit:', error);
    }
  };

  // Fonction pour mettre à jour une ligne de produit
  const updateProductLine = (lineId: string, updates: Partial<ProductLine>) => {
    setProductLines(prev => prev.map(line =>
      line.id === lineId ? { ...line, ...updates } : line
    ));
  };

  // Fonction pour ajouter une nouvelle ligne
  const addProductLine = () => {
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newLine = {
      id: newId,
      product_id: '',
      ref_produit: '',
      prix_unitaire: '',
      prix_original: '',
      prix_personnalise: false,
      quantite_retournee: '',
      montant_ligne: '',
      raison_detail: '',
    };
    setProductLines(prev => [newLine, ...prev]);
  };

  // Fonction pour supprimer une ligne
  const removeProductLine = (lineId: string) => {
    setProductLines(prev => prev.filter(line => line.id !== lineId));
  };

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

  // Fonction pour calculer le total d'une ligne
  const calculateTotal = (prix: string, quantite: string): string => {
    const prixNum = parseFloat(prix) || 0;
    const quantiteNum = parseInt(quantite) || 0;
    return (prixNum * quantiteNum).toString();
  };

  // Fonction pour réinitialiser complètement le formulaire
  const resetForm = () => {
    reset(); // Réinitialiser les erreurs d'Inertia
    setValidationErrors({});
    const resetId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setProductLines([{
      id: resetId,
      product_id: '',
      ref_produit: '',
      prix_unitaire: '',
      prix_original: '',
      prix_personnalise: false,
      quantite_retournee: '',
      montant_ligne: '',
      raison_detail: '',
    }]);
  };

  // Calculer le total général
  const totalGeneral = productLines.reduce((total, line) => {
    const lineTotal = parseFloat(line.montant_ligne) || 0;
    return total + lineTotal;
  }, 0);

  // Ajouter l'ajustement financier au total
  const ajustementFinancier = parseFloat(data.ajustement_financier) || 0;
  const totalFinal = totalGeneral + ajustementFinancier;

  // Vérifier si une ligne est valide
  const isLineValid = (line: ProductLine): boolean => {
    return !!(line.product_id && line.quantite_retournee && parseInt(line.quantite_retournee) > 0);
  };

  // Vérifier si un champ a une erreur
  const hasError = (field: string): boolean => {
    return !!(
      (errors as Record<string, string>)[field] ||
      (validationErrors as Record<string, string>)[field]
    );
  };

  // Vérifier si un champ est valide
  const isValid = (field: string): boolean => {
    return !hasError(field) && !!(data as Record<string, unknown>)[field];
  };

  // Fonction pour effacer les erreurs de validation d'un champ spécifique
  const clearFieldError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };



  // Charger le prochain numéro d'avoir
  const loadNextNumeroAvoir = async () => {
    try {
      const response = await fetch(route('avoirs.next-numero'));
      if (response.ok) {
        const data = await response.json();
        setData('numero_avoir', data.numero_avoir);
      } else {
        // Fallback local si l'API échoue
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2); // Année sur 2 chiffres (25 pour 2025)
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Mois sur 2 chiffres
        const fallbackNumero = `AV${year}${month}001`;
        setData('numero_avoir', fallbackNumero);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du numéro d\'avoir:', error);
      // Fallback local en cas d'erreur
      const now = new Date();
      const year = String(now.getFullYear()).slice(-2); // Année sur 2 chiffres (25 pour 2025)
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Mois sur 2 chiffres
      const fallbackNumero = `AV${year}${month}001`;
      setData('numero_avoir', fallbackNumero);
    }
  };

  // Effet pour charger le numéro d'avoir quand la modal s'ouvre
  useEffect(() => {
    if (open) {
      loadNextNumeroAvoir();
    }
  }, [open]);

  if (!can('avoirs.create')) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté client avant soumission
    const validationErrors: Record<string, string> = {};

    // Vérifier les champs obligatoires
    if (!data.numero_avoir.trim()) {
      validationErrors.numero_avoir = 'Le champ "Numéro Avoir" est obligatoire';
    }
    if (!data.date_avoir) {
      validationErrors.date_avoir = 'Le champ "Date Avoir" est obligatoire';
    }
    if (!data.client_id) {
      validationErrors.client_id = 'Le champ "Client" est obligatoire';
    }
    if (!data.commercial_id) {
      validationErrors.commercial_id = 'Le champ "Commercial" est obligatoire';
    }

    // Vérifier qu'il y a au moins un produit avec des données valides
    const validProductLines = productLines.filter(line =>
      line.product_id && line.quantite_retournee && parseInt(line.quantite_retournee) >= 1
    );

    if (validProductLines.length === 0) {
      toast.error('Veuillez ajouter au moins un produit avec une quantité valide dans la section "Produits Retournés"');
      return;
    } else {
      // Vérifier chaque ligne de produit
      let hasProductErrors = false;
      productLines.forEach((line, index) => {
        if (line.product_id && (!line.quantite_retournee || parseInt(line.quantite_retournee) < 1)) {
          toast.error(`Ligne ${index + 1} : La quantité doit être supérieure à 0`);
          hasProductErrors = true;
        }
      });
      if (hasProductErrors) {
        return;
      }
    }

    // Si il y a des erreurs de validation, les afficher et arrêter
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      // Faire défiler vers le premier champ avec une erreur pour une meilleure UX
      setTimeout(() => {
        const firstErrorField = document.querySelector('[id*="numero-avoir"], [id*="date-avoir"], [id*="client-select"], [id*="quantite-"]');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstErrorField as HTMLElement).focus();
        }
      }, 100);
      return;
    }

    // Réinitialiser les erreurs de validation
    setValidationErrors({});

    // Préparer les données pour l'envoi (seulement les lignes valides)
    const submitData = {
      ...data,
      products: validProductLines.map(line => ({
        product_id: line.product_id,
        ref_produit: line.ref_produit,
        prix_unitaire: parseFloat(line.prix_unitaire.toString().replace(/\s/g, '').replace(',', '.')),
        prix_original: parseFloat(line.prix_original.toString().replace(/\s/g, '').replace(',', '.')),
        prix_personnalise: line.prix_personnalise,
        quantite_retournee: line.quantite_retournee,
        montant_ligne: line.montant_ligne,
        raison_detail: line.raison_detail,
      })),
    };

    // Utiliser router.post pour envoyer les données
    router.post(route('avoirs.store'), submitData, {
      onSuccess: () => {
        toast.success('Avoir créé avec succès!');
        reset();
        const resetId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        setProductLines([{
          id: resetId,
          product_id: '',
          ref_produit: '',
          prix_unitaire: '',
          prix_original: '',
          prix_personnalise: false,
          quantite_retournee: '',
          montant_ligne: '',
          raison_detail: '',
        }]);
        setOpen(false);
        // Forcer le rechargement de la page pour afficher le nouvel avoir
        window.location.reload();
      },
      onError: (errors) => {
        console.log('Backend errors:', errors);
      },
      preserveScroll: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        // Réinitialiser complètement quand la modal se ferme
        resetForm();
      } else {
        // Réinitialiser les erreurs quand la modal s'ouvre
        setValidationErrors({});
      }
    }}>
      <DialogTrigger asChild>
        <Button id="add-avoir-button" className="h-10 w-full sm:w-auto justify-start transition-all duration-200 hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un Avoir
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] max-w-[1200px] max-h-[95vh] overflow-y-auto p-4 sm:p-6 sm:max-w-[1200px] md:p-7 md:px-8 poppins mt-8"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-[22px] text-center sm:text-left flex items-center gap-2">
            <RotateCcwIcon className="w-6 h-6 text-blue-600" />
            Ajouter un Avoir
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire pour ajouter un nouvel avoir
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section des informations générales avec Card moderne */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <RotateCcwIcon className="w-5 h-5" />
                Informations générales de l'Avoir
              </CardTitle>
              <CardDescription>
                Renseignez les détails principaux de l'avoir de retour
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Première ligne : 3 éléments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-1 w-full">
                  <Label htmlFor="numero-avoir" className="text-sm font-medium flex items-center gap-1">
                    Numéro Avoir
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative w-full">
                    <Input
                      id="numero-avoir"
                      name="numero_avoir"
                      type="text"
                      placeholder="AV2024-001"
                      className="h-10 sm:h-11 transition-all duration-200 w-full"
                      value={data.numero_avoir}
                      onChange={(e) => {
                        setData('numero_avoir', e.target.value);
                        clearFieldError('numero_avoir');
                      }}
                      aria-describedby={hasError('numero_avoir') ? 'numero-avoir-error' : undefined}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValid('numero_avoir') && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {hasError('numero_avoir') && <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                  {errors.numero_avoir && (
                    <p id="numero-avoir-error" className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" />
                      {errors.numero_avoir}
                    </p>
                  )}
                  {validationErrors.numero_avoir && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200 bg-red-50 px-2 py-1 rounded border border-red-200">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.numero_avoir}
                    </p>
                  )}
                </div>

                <div className="space-y-1 w-full">
                  <Label htmlFor="date-avoir" className="text-sm font-medium flex items-center gap-1">
                    Date Avoir
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date-avoir"
                    name="date_avoir"
                    type="date"
                    className="h-10 sm:h-11 transition-all duration-200 w-full"
                    value={data.date_avoir}
                    onChange={(e) => {
                      setData('date_avoir', e.target.value);
                      clearFieldError('date_avoir');
                    }}
                    aria-describedby={hasError('date_avoir') ? 'date-avoir-error' : undefined}
                  />
                  {errors.date_avoir && (
                    <p id="date-avoir-error" className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" />
                      {errors.date_avoir}
                    </p>
                  )}
                  {validationErrors.date_avoir && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200 bg-red-50 px-2 py-1 rounded border border-red-200">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.date_avoir}
                    </p>
                  )}
                </div>

                <div className="space-y-1 w-full">
                  <Label htmlFor="livreur-select" className="text-sm font-medium flex items-center gap-2">
                    Livreur
                    <Badge variant="secondary" className="text-xs">Optionnel</Badge>
                  </Label>
                  <ProtectedCombobox
                    items={livreurs.map(livreur => ({
                      id: livreur.id,
                      label: livreur.nom,
                      subLabel: livreur.telephone,
                      isActive: true
                    }))}
                    value={data.livreur_id}
                    onValueChange={(value) => {
                      setData('livreur_id', value);
                      clearFieldError('livreur_id');
                    }}
                    placeholder="Sélectionnez un livreur..."
                    searchPlaceholder="Rechercher un livreur..."
                    buttonClassName="h-10 sm:h-11 w-full"
                  />
                  {errors.livreur_id && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200 bg-red-50 px-2 py-1 rounded border border-red-200">
                      <AlertCircle className="w-3 h-3" />
                      {errors.livreur_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Deuxième ligne : 3 éléments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 w-full">
                  <Label htmlFor="client-select" className="text-sm font-medium flex items-center gap-1">
                    Client
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative w-full">
                    <ProtectedCombobox
                      items={clients
                        .sort((a, b) => a.code.localeCompare(b.code))
                        .map(client => ({
                          id: client.id,
                          label: client.fullName,
                          subLabel: client.code,
                          isActive: true
                        }))}
                      value={data.client_id}
                      onValueChange={(value) => {
                        setData('client_id', value);
                        clearFieldError('client_id');
                        // Récupérer l'ID du commercial du client
                        if (value) {
                          const selectedClient = clients.find(client => client.id.toString() === value);
                          if (selectedClient && selectedClient.idCommercial !== undefined) {
                            setData('commercial_id', selectedClient.idCommercial.toString());
                          }
                        }
                      }}
                      placeholder="Sélectionnez un client..."
                      searchPlaceholder="Rechercher un client..."
                      buttonClassName="h-10 sm:h-11 w-full"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValid('client_id') && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {hasError('client_id') && <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                  {errors.client_id && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200 bg-red-50 px-2 py-1 rounded border border-red-200">
                      <AlertCircle className="w-3 h-3" />
                      {errors.client_id}
                    </p>
                  )}
                  {validationErrors.client_id && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200 bg-red-50 px-2 py-1 rounded border border-red-200">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.client_id}
                    </p>
                  )}
                </div>

                <div className="space-y-1 w-full">
                  <Label htmlFor="commercial-info" className="text-sm font-medium flex items-center gap-1">
                    Commercial
                    {/* <span className="text-red-500">*</span> */}
                  </Label>
                  <div className="h-10 sm:h-11 px-3 py-2 bg-muted rounded-md border flex items-center text-sm w-full">
                    {data.commercial_id ? (
                      (() => {
                        const selectedCommercial = commerciaux.find(com => com.id.toString() === data.commercial_id);
                        return selectedCommercial ? (
                          <span className="text-muted-foreground">
                            {selectedCommercial.commercial_fullName} - {selectedCommercial.commercial_code}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Commercial sélectionné automatiquement</span>
                        );
                      })()
                    ) : (
                      <span className="text-muted-foreground">Sélectionnez un client pour voir le commercial</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 w-full">
                  <Label htmlFor="ajustement-financier" className="text-sm font-medium flex items-center gap-2">
                    Ajustement Financier
                    <Badge variant="secondary" className="text-xs">Optionnel</Badge>
                  </Label>
                  <Input
                    id="ajustement-financier"
                    name="ajustement_financier"
                    type="text"
                    placeholder="0,00"
                    className="h-10 sm:h-11 transition-all duration-200 w-full"
                    value={data.ajustement_financier}
                    onChange={(e) => {
                      setData('ajustement_financier', e.target.value);
                      clearFieldError('ajustement_financier');
                    }}
                  />
                  {errors.ajustement_financier && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200 bg-red-50 px-2 py-1 rounded border border-red-200">
                      <AlertCircle className="w-3 h-3" />
                      {errors.ajustement_financier}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section des produits avec Card moderne */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Produits Retournés
                  </CardTitle>
                  <CardDescription>
                    Gestion des produits retournés et calculs automatiques
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  {/* Indicateur de total avec badge */}
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total général</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-green-600">
                        {formatNumber(totalFinal)} DH
                      </p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Calculé
                      </Badge>
                    </div>
                  </div>
                  {/* Bouton d'ajout avec animation */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProductLine}
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
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-lg border">
                  <div className="md:col-span-3">
                    <Label className="text-sm font-medium text-gray-700">Nom de produit</Label>
                  </div>
                  <div className="md:col-span-1">
                    <Label className="text-sm font-medium text-gray-700">Quantité</Label>
                  </div>
                  <div className="md:col-span-1">
                    <Label className="text-sm font-medium text-gray-700">Référence</Label>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Prix unitaire</Label>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Total</Label>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Raison détail</Label>
                  </div>
                  <div className="md:col-span-1">
                    <Label className="text-sm font-medium text-gray-700">Action</Label>
                  </div>
                </div>

                {productLines.map((line, index) => (
                  <div
                    key={line.id}
                    className="border rounded-lg p-4 bg-background hover:shadow-md transition-all duration-200 group relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-3">
                        <ProductCombobox
                          products={products}
                          value={line.product_id}
                          onValueChange={async (value) => {
                            updateProductLine(line.id, { product_id: value });
                            await handleProductChange(value, line.id);
                          }}
                          placeholder="Sélectionnez un produit..."
                        />

                      </div>

                      <div className="md:col-span-1">
                        <Input
                          id={`quantite-${line.id}`}
                          name={`product_lines[${index}][quantite_retournee]`}
                          type="number"
                          min="1"
                          placeholder="Qté"
                          className="h-10 sm:h-11 w-[calc(100%+8px)]"
                          value={line.quantite_retournee}
                          onChange={(e) => {
                            const newQuantite = e.target.value;
                            const newTotal = calculateTotal(line.prix_unitaire, newQuantite);
                            updateProductLine(line.id, {
                              quantite_retournee: newQuantite,
                              montant_ligne: newTotal
                            });
                          }}
                        />

                      </div>

                      <div className="md:col-span-1">
                        <Input
                          id={`ref-produit-${line.id}`}
                          name={`product_lines[${index}][ref_produit]`}
                          type="text"
                          placeholder="Référence automatique"
                          className="h-10 sm:h-11 bg-muted"
                          value={line.ref_produit}
                          readOnly
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          id={`prix-unitaire-${line.id}`}
                          name={`product_lines[${index}][prix_unitaire]`}
                          type="text"
                          placeholder="Prix automatique"
                          className={cn(
                            "h-10 sm:h-11",
                            line.prix_personnalise ? "bg-yellow-100" : ""
                          )}
                          value={line.prix_unitaire ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d.,]/g, '');
                            const normalized = raw.replace(/,/g, '.');
                            const newTotal = calculateTotal(normalized, line.quantite_retournee);
                            updateProductLine(line.id, {
                              prix_unitaire: raw,
                              prix_personnalise: true,
                              montant_ligne: newTotal
                            });
                          }}
                          onBlur={(e) => {
                            const blurRaw = e.target.value.replace(/[^\d.,]/g, '');
                            const blurNormalized = blurRaw.replace(/,/g, '.');
                            const blurNum = parseFloat(blurNormalized);
                            const blurFormatted = isNaN(blurNum) ? '' : formatNumber(blurNum);
                            updateProductLine(line.id, {
                              prix_unitaire: blurFormatted
                            });
                          }}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          id={`total-${line.id}`}
                          name={`product_lines[${index}][montant_ligne]`}
                          type="text"
                          placeholder="Total"
                          className="h-10 sm:h-11 bg-muted font-medium"
                          value={line.montant_ligne ? formatNumber(line.montant_ligne) : ''}
                          readOnly
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          id={`raison-detail-${line.id}`}
                          name={`product_lines[${index}][raison_detail]`}
                          type="text"
                          placeholder="Raison détail (optionnel)"
                          className="h-10 sm:h-11"
                          value={line.raison_detail}
                          onChange={(e) => updateProductLine(line.id, { raison_detail: e.target.value })}
                        />
                      </div>

                      <div className="md:col-span-1 flex items-end justify-center">
                        {productLines.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProductLine(line.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 sm:h-11 w-full transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Indicateur de statut de ligne */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          isLineValid(line)
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        )}
                      >
                        {isLineValid(line) ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Valide
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Incomplet
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Affichage du badge "prix personnalisé" si applicable */}
                    {line.prix_personnalise && (
                      <Badge
                        variant="outline"
                        className="absolute top-2 left-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
                      >
                        Prix modifié
                      </Badge>
                    )}
                  </div>
                ))}

                {/* Message si aucun produit */}
                {productLines.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun produit ajouté</p>
                    <p className="text-sm">Cliquez sur "Ajouter un produit" pour commencer</p>
                  </div>
                )}
              </div>


            </CardContent>
          </Card>

          {/* Section Raison du Retour avec Card moderne */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Raison du Retour
              </CardTitle>
              <CardDescription>
                Décrivez la raison du retour pour ce client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Label htmlFor="raison-retour" className="text-sm font-medium flex items-center gap-2">
                  Description
                  <Badge variant="secondary" className="text-xs">Optionnel</Badge>
                </Label>
                <Textarea
                  id="raison-retour"
                  name="raison_retour"
                  placeholder="Décrivez la raison du retour..."
                  className="transition-all duration-200"
                  value={data.raison_retour}
                  onChange={(e) => setData('raison_retour', e.target.value)}
                  rows={3}
                />
                {errors.raison_retour && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.raison_retour}
                  </p>
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
                disabled={processing}
                className="w-full sm:w-auto transition-all duration-200 hover:scale-105"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Check className="mr-2 h-4 w-4" />
                Créer
              </Button>
            </DialogFooter>
          </div>

          {/* Indicateur de progression */}
          {processing && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '33%' }}></div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Traitement en cours...
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
