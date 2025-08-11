"use client";
import PromotionDialogBase from "@/pages/promotion/shared/components/PromotionDialogBase";
import type { Product } from "@/pages/promotion/shared/types";

export default function PromotionDialog({ products = [] }: { products?: Product[] }) {
  return (
    <PromotionDialogBase
      products={products}
      permissionPrefix="promotions_sortie"
      routePrefix="promotions-sortie"
      buttonId="add-promotion-sortie-button"
      title="Ajouter une Promotion (Sortie)"
      description="Remplissez le formulaire pour ajouter une promotion de sortie"
    />
  );
}


