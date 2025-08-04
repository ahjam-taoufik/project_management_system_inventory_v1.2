# Analyse MERISE - Structure Générale du Projet

## Vue d'ensemble
Ce document présente l'analyse MERISE du système de gestion commerciale et de stock, basée sur l'analyse des migrations Laravel du projet.

## 1. ENTITÉS PRINCIPALES

### 1.1 Gestion des Utilisateurs et Sécurité
- **USERS** : Utilisateurs du système
  - Attributs : id, name, email, email_verified_at, password, remember_token, timestamps
  - Clé primaire : id

### 1.2 Gestion Géographique
- **VILLES** : Villes
  - Attributs : id, nameVille, timestamps
  - Clé primaire : id

- **SECTEURS** : Secteurs d'activité par ville
  - Attributs : id, nameSecteur, idVille, timestamps
  - Clé primaire : id
  - Clé étrangère : idVille → VILLES

### 1.3 Gestion Commerciale
- **COMMERCIAUX** : Représentants commerciaux
  - Attributs : id, commercial_code, commercial_fullName, commercial_telephone, timestamps
  - Clé primaire : id

- **CLIENTS** : Clients de l'entreprise
  - Attributs : id, code, fullName, idVille, idSecteur, idCommercial, remise_special, pourcentage, telephone, timestamps
  - Clé primaire : id
  - Clés étrangères : 
    - idVille → VILLES
    - idSecteur → SECTEURS
    - idCommercial → COMMERCIAUX
  - Contraintes d'unicité : fullName (unique)

### 1.4 Gestion des Produits
- **BRANDS** : Marques
  - Attributs : id, brand_name, timestamps
  - Clé primaire : id

- **CATEGORIES** : Catégories de produits par marque
  - Attributs : id, category_name, brand_id, timestamps
  - Clé primaire : id
  - Clé étrangère : brand_id → BRANDS

- **PRODUCTS** : Produits
  - Attributs : id, product_Ref, product_libelle, prix_achat_colis, prix_achat_unite, prix_vente_colis, prix_vente_unite, brand_id, category_id, product_Poids, nombre_unite_par_colis, product_isActive, observation, timestamps
  - Clé primaire : id
  - Clés étrangères :
    - brand_id → BRANDS
    - category_id → CATEGORIES
  - Contraintes d'unicité : product_libelle (unique)
  - Notes : prix_achat_unite et prix_vente_unite sont nullable

### 1.5 Gestion du Stock
- **STOCKS** : État des stocks par produit
  - Attributs : id, product_id, quantite_totale_entree, quantite_totale_sortie, stock_disponible, stock_minimum, stock_maximum, valeur_stock, derniere_entree, derniere_sortie, timestamps
  - Clé primaire : id
  - Clé étrangère : product_id → PRODUCTS
  - Contrainte unique : product_id

### 1.6 Gestion des Mouvements
- **TRANSPORTEURS** : Transporteurs pour les entrées
  - Attributs : id, conducteur_name, vehicule_matricule, conducteur_cin, conducteur_telephone, vehicule_type, timestamps
  - Clé primaire : id

- **LIVREURS** : Livreurs pour les sorties
  - Attributs : id, nom, telephone, timestamps
  - Clé primaire : id

- **ENTRERS** : Entrées en stock
  - Attributs : id, product_id, ref_produit, prix_achat_produit, quantite_produit, numero_bl, transporteur_id, date_charge, date_decharge, manque, timestamps
  - Clé primaire : id
  - Clés étrangères :
    - product_id → PRODUCTS
    - transporteur_id → TRANSPORTEURS

- **SORTIES** : Sorties de stock (Bons de livraison)
  - Attributs : id, numero_bl, commercial_id, client_id, date_bl, livreur_id, remise_speciale, remise_trimestrielle, valeur_ajoutee, retour, remise_es, client_gdg, total_general, montant_total_final, total_poids, montant_remise_especes, total_bl, timestamps
  - Clé primaire : id
  - Clés étrangères :
    - commercial_id → COMMERCIAUX
    - client_id → CLIENTS
    - livreur_id → LIVREURS
  - Contraintes d'unicité : numero_bl (unique)
  - Index : (numero_bl, date_bl), (commercial_id, client_id)

- **SORTIE_PRODUCTS** : Détail des produits dans les sorties
  - Attributs : id, sortie_id, product_id, ref_produit, prix_produit, quantite_produit, poids_produit, total_ligne, timestamps
  - Clé primaire : id
  - Clés étrangères :
    - sortie_id → SORTIES
    - product_id → PRODUCTS

### 1.7 Gestion des Promotions
- **PROMOTIONS** : Promotions commerciales
  - Attributs : id, produit_promotionnel_id, quantite_produit_promotionnel, produit_offert_id, quantite_produit_offert, is_active, timestamps
  - Clé primaire : id
  - Clés étrangères :
    - produit_promotionnel_id → PRODUCTS
    - produit_offert_id → PRODUCTS
  - Notes : is_active permet d'activer/désactiver les promotions

### 1.8 Gestion des Permissions (Spatie Laravel Permission)
- **PERMISSIONS** : Permissions du système
- **ROLES** : Rôles utilisateurs
- **MODEL_HAS_PERMISSIONS** : Association permissions-modèles
- **MODEL_HAS_ROLES** : Association rôles-modèles
- **ROLE_HAS_PERMISSIONS** : Association permissions-rôles

## 2. RELATIONS ENTRE ENTITÉS

### 2.1 Relations Hiérarchiques
```
VILLES (1) ←→ (N) SECTEURS
BRANDS (1) ←→ (N) CATEGORIES
BRANDS (1) ←→ (N) PRODUCTS
CATEGORIES (1) ←→ (N) PRODUCTS
```

### 2.2 Relations Commerciales
```
COMMERCIAUX (1) ←→ (N) CLIENTS
COMMERCIAUX (1) ←→ (N) SORTIES
CLIENTS (1) ←→ (N) SORTIES
```

### 2.3 Relations de Stock
```
PRODUCTS (1) ←→ (1) STOCKS
PRODUCTS (1) ←→ (N) ENTRERS
PRODUCTS (1) ←→ (N) SORTIE_PRODUCTS
```

### 2.4 Relations de Mouvements
```
TRANSPORTEURS (1) ←→ (N) ENTRERS
LIVREURS (1) ←→ (N) SORTIES
SORTIES (1) ←→ (N) SORTIE_PRODUCTS
```

### 2.5 Relations de Promotions
```
PRODUCTS (1) ←→ (N) PROMOTIONS (en tant que produit promotionnel)
PRODUCTS (1) ←→ (N) PROMOTIONS (en tant que produit offert)
```

## 3. RÈGLES MÉTIER IDENTIFIÉES

### 3.1 Gestion des Stocks
- Chaque produit a un seul enregistrement de stock
- Le stock disponible = quantite_totale_entree - quantite_totale_sortie
- Suivi des dates de dernière entrée et sortie
- Gestion des seuils minimum et maximum

### 3.2 Gestion des Prix
- Prix d'achat et de vente au niveau colis et unité
- Calcul automatique des totaux dans les sorties
- Gestion des remises (spéciale, trimestrielle, espèces)

### 3.3 Gestion des Promotions
- Système de promotions actif/inactif
- Promotion basée sur l'achat d'un produit pour obtenir un autre
- Activation/désactivation via le champ is_active

### 3.4 Gestion des Clients
- Chaque client a une remise spéciale et un pourcentage personnalisés
- Contrainte d'unicité sur le nom complet du client
- Association optionnelle avec un commercial

### 3.5 Gestion des Produits
- Contrainte d'unicité sur le libellé du produit
- Prix unitaires optionnels (nullable)
- Gestion des unités par colis avec valeur par défaut

### 3.6 Contraintes d'Intégrité
- Suppression en cascade pour les relations principales
- Contraintes d'unicité sur les codes et références
- Gestion des valeurs nulles appropriée

## 4. FLUX PRINCIPAUX

### 4.1 Flux d'Entrée
```
TRANSPORTEUR → ENTRER → PRODUCT → STOCK
```

### 4.2 Flux de Sortie
```
COMMERCIAL + CLIENT → SORTIE → SORTIE_PRODUCTS → STOCK
```

### 4.3 Flux de Gestion
```
VILLE → SECTEUR → CLIENT
BRAND → CATEGORY → PRODUCT
```

## 5. MIGRATIONS COMPLÉMENTAIRES ET ÉVOLUTION

### 5.1 Modifications des CLIENTS
- **Ajout de champs commerciaux** : remise_special, pourcentage, telephone
- **Contrainte d'unicité** : fullName devient unique
- **Relation commerciale** : Ajout de idCommercial (nullable)

### 5.2 Modifications des PRODUCTS
- **Contrainte d'unicité** : product_libelle devient unique
- **Flexibilité des prix** : prix_achat_unite et prix_vente_unite deviennent nullable
- **Gestion des unités** : nombre_unite_par_colis avec valeur par défaut = 1

### 5.3 Modifications des SORTIES
- **Champs de calcul** : Ajout de nombreux champs de calcul (total_general, montant_total_final, etc.)
- **Gestion des remises** : remise_speciale, remise_trimestrielle, montant_remise_especes
- **Métriques** : total_poids, client_gdg, valeur_ajoutee, retour

### 5.4 Modifications des PROMOTIONS
- **Activation** : Ajout du champ is_active pour activer/désactiver les promotions

## 6. POINTS D'ATTENTION

### 6.1 Performance
- Index sur les clés étrangères
- Index composites sur les requêtes fréquentes
- Optimisation des jointures

### 6.2 Sécurité
- Système de permissions granulaire
- Authentification et autorisation
- Gestion des sessions

### 6.3 Évolutivité
- Structure modulaire
- Séparation claire des responsabilités
- Extensibilité pour de nouvelles fonctionnalités

---

*Document généré automatiquement à partir de l'analyse des migrations Laravel* 
