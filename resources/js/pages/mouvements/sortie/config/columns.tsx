"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import SortieDropDown from "../components/SortieDropDown";
import { Sortie } from "../types";

export const columns: ColumnDef<Sortie>[] = [
  {
    id: "expand",
    header: "",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => row.toggleExpanded()}
          className="h-8 w-8 p-0"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "numero_bl",
    header: "Numéro BL",
    enableColumnFilter: true,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.getValue("numero_bl")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "date_bl",
    header: "Date BL",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date_bl"));
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{date.toLocaleDateString('fr-FR')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "commercial.commercial_code",
    header: "Commercial",
    cell: ({ row }) => {
      const commercial = row.original.commercial;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{commercial.commercial_code}</span>
          <span className="text-xs text-muted-foreground">{commercial.commercial_fullName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "client.nom",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original.client;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{client.nom}</span>
          <span className="text-xs text-muted-foreground">{client.code} - {client.ville}</span>
        </div>
      );
    },
  },
  {
    id: "livreur",
    accessorKey: "livreur.nom",
    header: "Livreur",
    enableHiding: true,
    enableColumnFilter: false,
    cell: ({ row }) => {
      const livreur = row.original.livreur;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{livreur ? livreur.nom : '-'}</span>
          {livreur && livreur.telephone && (
            <span className="text-xs text-muted-foreground">{livreur.telephone}</span>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "total_poids",
    header: "Poids Total (KG)",
    enableHiding: true,
    enableColumnFilter: false,
    cell: ({ row }) => {
      const poids = row.getValue("total_poids") as number;
      const formatNumber = (value: number): string => {
        const num = parseFloat(value?.toString() || '0');
        if (isNaN(num)) return '0,00';

        // Convertir en chaîne avec 2 décimales
        const formatted = num.toFixed(2);

        // Ajouter les espaces pour les milliers
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return parts.join(',');
      };

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-blue-600">
            {poids ? formatNumber(poids) : '0,00'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "remise_es",
    header: "Remise ES (%)",
    cell: ({ row }) => {
      const remise = row.getValue("remise_es") as number;
      const formatNumber = (value: number): string => {
        const num = parseFloat(value?.toString() || '0');
        if (isNaN(num)) return '0,00';

        // Convertir en chaîne avec 2 décimales
        const formatted = num.toFixed(2);

        // Ajouter les espaces pour les milliers
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return parts.join(',');
      };

      return (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${remise && remise > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {remise ? formatNumber(remise) : '0,00'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "client_gdg",
    header: "Client G/DG (%)",
    cell: ({ row }) => {
      const gdg = row.getValue("client_gdg") as number;
      const formatNumber = (value: number): string => {
        const num = parseFloat(value?.toString() || '0');
        if (isNaN(num)) return '0,00';

        // Convertir en chaîne avec 2 décimales
        const formatted = num.toFixed(2);

        // Ajouter les espaces pour les milliers
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return parts.join(',');
      };

      return (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${gdg && gdg > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {gdg ? formatNumber(gdg) : '0,00'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "remise_trimestrielle",
    header: "Remise Trim (DH)",
    cell: ({ row }) => {
      const remiseTrimestrielle = row.getValue("remise_trimestrielle") as number;
      const formatNumber = (value: number): string => {
        const num = parseFloat(value?.toString() || '0');
        if (isNaN(num)) return '0,00';

        // Convertir en chaîne avec 2 décimales
        const formatted = num.toFixed(2);

        // Ajouter les espaces pour les milliers
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return parts.join(',');
      };

      return (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${remiseTrimestrielle && remiseTrimestrielle > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {remiseTrimestrielle ? formatNumber(remiseTrimestrielle) : '0,00'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "montant_total_final",
    header: "Montant Total (DH)",
    cell: ({ row }) => {
      const sortie = row.original;

      // Calculer le vrai montant total basé sur les produits et les remises
      const totalLignes = sortie.products.reduce((total, product) => {
        return total + Number(product.total_ligne || 0);
      }, 0);

      // Gérer remise_es comme chaîne ou nombre
      const remiseEs = sortie.remise_es === 'Oui' ? 10 : Number(sortie.remise_es || 0);
      const remiseSpeciale = Number(sortie.remise_speciale || 0);
      const remiseTrimestrielle = Number(sortie.remise_trimestrielle || 0);
      const valeurAjoutee = Number(sortie.valeur_ajoutee || 0);
      const retour = Number(sortie.retour || 0);

      // Calculer le montant de remise ES
      const montantRemiseEs = (totalLignes * remiseEs) / 100;

      // Calculer le montant total final
      const montantTotalCalcule = totalLignes - montantRemiseEs - remiseSpeciale - remiseTrimestrielle + valeurAjoutee + retour;

      // Vérifier si la sortie utilise le prix d'achat
      const usesAchatPrice = sortie.products.some(product => product.use_achat_price);

      const formatNumber = (value: number): string => {
        const num = parseFloat(value?.toString() || '0');
        if (isNaN(num)) return '0,00';

        // Convertir en chaîne avec 2 décimales
        const formatted = num.toFixed(2);

        // Ajouter les espaces pour les milliers
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return parts.join(',');
      };

      return (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${usesAchatPrice ? 'text-red-600' : 'text-green-600'}`}>
            {formatNumber(montantTotalCalcule)}
          </span>
          {usesAchatPrice && (
            <span className="text-xs text-red-500 font-medium">
              Prix d'achat
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "archived",
    header: "Archivée",
    cell: ({ row }) => {
      const archived = row.getValue("archived") as boolean;
      const sortie = row.original;

      const handleArchivedChange = (checked: boolean) => {
        console.log('Tentative de modification du statut d\'archivage:', { sortieId: sortie.id, archived: checked });

        router.patch(route('api.sorties.toggle-archived', { sortie: sortie.id }), {
          archived: checked
        }, {
          onSuccess: () => {
            toast.success(checked ? 'Sortie archivée avec succès' : 'Sortie désarchivée avec succès');
          },
          onError: (errors) => {
            console.error('Erreur lors de la modification:', errors);
            toast.error('Erreur lors de la modification du statut d\'archivage');
          },
          preserveScroll: true,
        });
      };

      return (
        <div className="flex items-center justify-center">
          <Switch
            checked={archived}
            onCheckedChange={handleArchivedChange}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <SortieDropDown row={row} />;
    },
  },
];
