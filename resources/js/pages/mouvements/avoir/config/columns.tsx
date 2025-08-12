"use client";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import AvoirDropDown from "../components/AvoirDropDown";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { usePage } from "@inertiajs/react";
import { ChevronDown, ChevronRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";



export const columns: ColumnDef<Avoir>[] = [
  {
    id: "expander",
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
    accessorKey: "numero_avoir",
    header: "N° Avoir",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.getValue("numero_avoir")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "date_avoir",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date_avoir") as string;
      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {format(new Date(date), 'dd/MM/yyyy', { locale: fr })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original.client;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{client?.fullName || '-'}</span>
          <span className="text-xs text-muted-foreground">{client?.code || '-'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "commercial",
    header: "Commercial",
    cell: ({ row }) => {
      const commercial = row.original.commercial;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{commercial?.commercial_fullName || '-'}</span>
          <span className="text-xs text-muted-foreground">{commercial?.commercial_code || '-'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const statut = row.getValue("statut") as string;

      const getStatutConfig = (statut: string) => {
        switch (statut) {
          case 'en_attente':
            return {
              icon: <Clock className="w-3 h-3" />,
              label: 'En attente',
              className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
            };
          case 'valide':
            return {
              icon: <CheckCircle className="w-3 h-3" />,
              label: 'Validé',
              className: 'bg-green-100 text-green-800 border-green-200'
            };
          default:
            return {
              icon: <Clock className="w-3 h-3" />,
              label: 'Inconnu',
              className: 'bg-gray-100 text-gray-800 border-gray-200'
            };
        }
      };

      const config = getStatutConfig(statut);

      return (
        <Badge variant="outline" className={`text-xs ${config.className}`}>
          {config.icon}
          <span className="ml-1">{config.label}</span>
        </Badge>
      );
    },
  },

  {
    accessorKey: "montant_total",
    header: "Montant Total (DH)",
    cell: ({ row }) => {
      const montant = row.getValue("montant_total") as number;
      const ajustement = row.original.ajustement_financier;

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
          </span>
          {ajustement !== 0 && (
            <span className={`text-xs ${ajustement > 0 ? 'text-green-600' : 'text-red-600'}`}>
              Ajustement: {ajustement > 0 ? '+' : ''}{ajustement.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
            </span>
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <AvoirDropDown row={row} />;
    },
  },
];
