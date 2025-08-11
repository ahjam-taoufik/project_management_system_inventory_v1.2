"use client";
import PromotionDialogBase from "@/pages/promotion/shared/components/PromotionDialogBase";
import type { Product } from "@/pages/promotion/shared/types";

export default function PromotionDialog({ products = [] }: { products?: Product[] }) {
  return (
    <PromotionDialogBase
      products={products}
      permissionPrefix="promotions_entrer"
      routePrefix="promotions-entrer"
      buttonId="add-promotion-entrer-button"
      title="Ajouter une Promotion (Entrée)"
      description="Remplissez le formulaire pour ajouter une promotion d'entrée"
    />
  );
}


