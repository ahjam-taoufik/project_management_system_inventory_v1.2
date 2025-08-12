export interface Avoir {
  id: number;
  numero_avoir: string;
  date_avoir: string;
  client_id: number;
  commercial_id: number;
  livreur_id?: number;
  raison_retour?: string;
  ajustement_financier: number;

  // ✅ NOUVEAU: Champs de validation
  statut: 'en_attente' | 'valide';
  date_validation?: string;
  commentaire_validation?: string;

  montant_total: number;
  poids_total: number;
  created_at: string;
  updated_at: string;

  // Relations
  client?: Client;
  commercial?: Commercial;
  livreur?: Livreur;
  products?: AvoirProduct[];
}

export interface AvoirProduct {
  id: number;
  avoir_id: number;
  product_id: number;
  quantite_retournee: number;
  prix_unitaire: number;
  prix_original: number;
  prix_personnalise: boolean;
  montant_ligne: number;
  raison_detail?: string;
  sortie_origine_id?: number;
  created_at: string;

  // Relations
  product?: Product;
  sortieOrigine?: Sortie;
}

export interface Client {
  id: number;
  fullName: string;
  code: string;
  idCommercial?: number;
}

export interface Commercial {
  id: number;
  commercial_fullName: string;
  commercial_code: string;
}

export interface Livreur {
  id: number;
  nom: string;
  telephone: string;
}

export interface Product {
  id: number;
  product_libelle: string;
  product_Ref: string;
  product_isActive: boolean;
  prix_vente_colis: number;
  prix_achat_colis: number;
  brand?: Brand;
}

export interface Brand {
  id: number;
  brand_name: string;
}

export interface Sortie {
  id: number;
  numero_bl: string;
}
