"use client";

import React from "react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, FileText } from "lucide-react";
import { Sortie, Commercial, Client, Product } from "../types";
import { router, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import { useState, useRef } from "react";
import SortieEditDialog from "./SortieEditDialog";
import { useReactToPrint } from 'react-to-print';
import { PrintableSortie } from "./print/PrintableSortie";

interface SortieDropDownProps {
  row: Row<Sortie>;
}

export default function SortieDropDown({ row }: SortieDropDownProps) {
  const sortie = row.original;
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Récupérer les données depuis la page
  const { props: { products, commerciaux, clients, livreurs } } = usePage();

  // Ref pour le composant imprimable
  const sortieRef = useRef<HTMLDivElement>(null);

  // Gestionnaire pour imprimer une sortie spécifique
  const handlePrintOriginal = useReactToPrint({
    contentRef: sortieRef,
    documentTitle: `Bon_Livraison_${sortie.numero_bl}_${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        html, body { height: 100%; margin: 0; padding: 0; }
        .print-content { padding: 0 !important; margin: 0 !important; }
      }
    `,
    onBeforePrint: () => {
      return new Promise<void>((resolve) => {
        setTimeout(resolve, 100);
      });
    },
    onAfterPrint: () => {
      setTimeout(() => {
        setIsPrinting(false);
      }, 100);
    },
    onPrintError: (error) => {
      setTimeout(() => {
        setIsPrinting(false);
        console.error("Erreur d'impression:", error);
        toast.error("Erreur lors de l'impression");
      }, 100);
    },
  });

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette sortie ?")) {
      router.delete(route('sorties.destroy', sortie.id), {
        onSuccess: () => {
          toast.success("Sortie supprimée avec succès");
        },
        onError: () => {
          toast.error("Erreur lors de la suppression");
        },
      });
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);

    try {
      // Petit délai pour éviter les problèmes de port déconnecté
      requestAnimationFrame(() => {
        handlePrintOriginal();
      });
    } catch (error) {
      console.error("Erreur lors de la préparation de l'impression:", error);
      requestAnimationFrame(() => {
        setIsPrinting(false);
        toast.error("Erreur lors de la préparation de l'impression");
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint} disabled={isPrinting}>
            <FileText className="mr-2 h-4 w-4" />
            {isPrinting ? "Impression..." : "Imprimer BL"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showEditDialog && (
        <SortieEditDialog
          sortie={sortie}
          products={products as Product[]}
          commerciaux={commerciaux as Commercial[]}
          clients={clients as Client[]}
          livreurs={livreurs as Array<{id: number; nom: string; telephone?: string}>}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}

      {/* Composant caché pour l'impression */}
      <div style={{ display: 'none' }}>
        <div ref={sortieRef}>
          <PrintableSortie sortie={sortie} />
        </div>
      </div>
    </>
  );
}
