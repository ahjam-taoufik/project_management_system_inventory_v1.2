"use client";

export type Product = {
  id: number;
  product_libelle: string;
  product_Ref: string;
  product_isActive?: boolean;
};

export type Promotion = {
  id: number;
  produit_promotionnel_id: number;
  quantite_produit_promotionnel: number;
  produit_offert_id: number;
  quantite_produit_offert: number;
  mouvement_type?: PromotionContext;
  produit_promotionnel?: {
    id: number;
    product_libelle: string;
    product_Ref: string;
  };
  produit_offert?: {
    id: number;
    product_libelle: string;
    product_Ref: string;
  };
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export type PromotionContext = "entrer" | "sortie";


