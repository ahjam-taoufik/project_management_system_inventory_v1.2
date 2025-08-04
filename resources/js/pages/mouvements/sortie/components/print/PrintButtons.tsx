import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Printer, ChevronDown, FileText } from 'lucide-react';
import { PrintableSortie } from './PrintableSortie';
import { Sortie } from '../../types';

interface PrintButtonsProps {
  sorties: Sortie[];
}

export function PrintButtons({ sorties }: PrintButtonsProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedSortie, setSelectedSortie] = useState<Sortie | null>(null);

  // Ref pour le composant imprimable
  const sortieRef = useRef<HTMLDivElement>(null);

  // Gestionnaire pour imprimer une sortie spécifique
  const handlePrintSortieOriginal = useReactToPrint({
    contentRef: sortieRef,
    documentTitle: `Bon_Livraison_${selectedSortie?.numero_bl || 'N/A'}_${new Date().toISOString().split('T')[0]}`,
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
        setSelectedSortie(null);
      }, 100);
    },
    onPrintError: (error) => {
      setTimeout(() => {
        setIsPrinting(false);
        setSelectedSortie(null);
        console.error("Erreur d'impression:", error);
      }, 100);
    },
  });

  // Fonction wrapper pour gérer l'impression avec une meilleure gestion des erreurs
  const handlePrintSortie = (sortie: Sortie) => {
    setSelectedSortie(sortie);
    setIsPrinting(true);

    try {
      // Petit délai pour éviter les problèmes de port déconnecté
      requestAnimationFrame(() => {
        handlePrintSortieOriginal();
      });
    } catch (error) {
      console.error("Erreur lors de la préparation de l'impression:", error);
      requestAnimationFrame(() => {
        setIsPrinting(false);
        setSelectedSortie(null);
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isPrinting}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              if (sorties.length === 1) {
                handlePrintSortie(sorties[0]);
              }
            }}
            disabled={sorties.length !== 1 || isPrinting}
          >
            <FileText className="mr-2 h-4 w-4" />
            Imprimer le BL sélectionné
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <FileText className="mr-2 h-4 w-4" />
            Imprimer plusieurs BL (à venir)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Composant caché pour l'impression */}
      <div style={{ display: 'none' }}>
        {selectedSortie && (
          <PrintableSortie
            ref={sortieRef}
            sortie={selectedSortie}
          />
        )}
      </div>
    </>
  );
}
