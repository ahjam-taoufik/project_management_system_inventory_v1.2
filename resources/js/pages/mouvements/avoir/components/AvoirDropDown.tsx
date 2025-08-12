"use client";
import React, { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Avoir } from "@/pages/mouvements/avoir/types";

import { FaRegEdit } from "react-icons/fa";
import { MdContentCopy, MdOutlineDelete } from "react-icons/md";
import { CheckCircle, XCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useForm, router, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import AvoirEditDialog from "@/pages/mouvements/avoir/components/AvoirEditDialog";
import { usePermissions } from '@/hooks/use-permissions';

type MenuItem =
  | {
      icon: React.ReactElement;
      label: string;
      className: string;
      separator?: false | undefined;
      id?: string | undefined;
    }
  | {
      separator: true;
      icon?: undefined;
      label?: undefined;
      className?: undefined;
    };

interface AvoirDropDownProps {
  row: Row<Avoir>;
}

export default function AvoirDropDown({
  row
}: AvoirDropDownProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { delete: destroy } = useForm();
  const { can } = usePermissions();
  const { props: { clients, commerciaux, livreurs, products } } = usePage();
  const avoir = row.original;

  function handleEdit() {
    setIsDropdownOpen(false);
    setTimeout(() => {
      setIsEditDialogOpen(true);
    }, 100);
  }

  async function handleDelete() {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avoir ?')) {
      destroy(route('avoirs.destroy', { avoir: avoir.id }), {
        onSuccess: () => {
          toast.success('Avoir supprimé avec succès');
        },
        onError: () => {
          toast.error('Erreur lors de la suppression de l\'avoir');
        },
        preserveScroll: true,
      });
    }
  }

  async function handleCopy() {
    if (confirm('Êtes-vous sûr de vouloir faire une copie de cet avoir ?')) {
      router.post(route('avoirs.store'), {
        date_avoir: avoir.date_avoir,
        client_id: avoir.client_id,
        commercial_id: avoir.commercial_id,
        livreur_id: avoir.livreur_id,
        raison_retour: `${avoir.raison_retour} - Copie`,
        ajustement_financier: avoir.ajustement_financier,
        products: avoir.products?.map((p: any) => ({
          product_id: p.product_id,
          quantite_retournee: p.quantite_retournee,
          prix_unitaire: p.prix_unitaire,
          prix_original: p.prix_original,
          prix_personnalise: p.prix_personnalise,
          raison_detail: p.raison_detail,
          sortie_origine_id: p.sortie_origine_id,
        })) || [],
      }, {
        onSuccess: () => {
          toast.success('Avoir copié avec succès');
        },
        onError: (errors) => {
          console.error('Erreurs lors de la copie:', errors);
          toast.error('Erreur lors de la copie de l\'avoir');
        },
        preserveScroll: true,
      });
    }
  }

  async function handleValidate() {
    if (confirm('Êtes-vous sûr de vouloir valider cet avoir ? Cela augmentera le stock des produits.')) {
      router.patch(route('avoirs.validate', { avoir: avoir.id }), {
        commentaire: 'Validé par l\'utilisateur'
      }, {
        onSuccess: () => {
          toast.success('Avoir validé avec succès - Stock mis à jour');
        },
        onError: (errors) => {
          console.error('Erreurs lors de la validation:', errors);
          toast.error('Erreur lors de la validation de l\'avoir');
        },
        preserveScroll: true,
      });
    }
  }



  function handleClickedItem(item: MenuItem) {
    if (item.label === "Delete") {
      setIsDropdownOpen(false);
      setTimeout(() => {
        handleDelete();
      }, 100);
    }

    if (item.label === "Copy") {
      setIsDropdownOpen(false);
      setTimeout(() => {
        handleCopy();
      }, 100);
    }

    if (item.label === "Edit") {
      handleEdit();
    }

    if (item.label === "Validate") {
      setIsDropdownOpen(false);
      setTimeout(() => {
        handleValidate();
      }, 100);
    }


  }

  const canEdit = true; // Tous les avoirs peuvent être modifiés
  const canDelete = true; // Tous les avoirs peuvent être supprimés
  const canValidate = avoir.statut === 'en_attente' && can('avoirs.validate'); // Seuls les avoirs en attente peuvent être validés

  const menuItems: MenuItem[] = [
    ...(can('avoirs.create') ? [{ icon: <MdContentCopy />, label: "Copy", className: "" }] : []),
    ...(can('avoirs.edit') && canEdit ? [{ icon: <FaRegEdit />, label: "Edit", className: "" }] : []),
    ...(canValidate ? [{ icon: <CheckCircle />, label: "Validate", className: "text-green-600" }] : []),
    ...(((can('avoirs.create') || can('avoirs.edit') || canValidate) && can('avoirs.delete')) ? [{ separator: true } as const] : []),
    ...(can('avoirs.delete') && canDelete ? [{ icon: <MdOutlineDelete className="text-lg" />, label: "Delete", className: "text-red-600" }] : [])
  ];

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <div>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="poppins">
          {menuItems.map((item, index) =>
            item.separator ? (
              <DropdownMenuSeparator key={index} />
            ) : (
              <DropdownMenuItem
                key={index}
                className={`flex items-center gap-1 p-[10px] ${item.className}`}
                onClick={() => handleClickedItem(item)}
                onSelect={(e) => {
                  if (item.label === "Edit") {
                    e.preventDefault();
                  }
                }}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AvoirEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        avoir={avoir}
        clients={clients}
        commerciaux={commerciaux}
        livreurs={livreurs}
        products={products}
      />
    </div>
  );
}
