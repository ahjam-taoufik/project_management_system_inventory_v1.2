import React, { useMemo } from 'react';
import { Sortie } from '../../types';
import { Footer } from './Footer';

interface PrintableSortieProps {
  sortie: Sortie;
}

export const PrintableSortie = React.forwardRef<HTMLDivElement, PrintableSortieProps>(
  ({ sortie }, ref) => {
    const formatNumber = (value: number): string => {
      const num = parseFloat(value?.toString() || '0');
      if (isNaN(num)) return '0,00';

      const formatted = num.toFixed(2);
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

      return parts.join(',');
    };

    // Fonction pour vérifier si une valeur est significative (différente de zéro)
    const isSignificantValue = (value: number | string | null | undefined): boolean => {
      const num = parseFloat(value?.toString() || '0');
      return !isNaN(num) && num !== 0;
    };

    // Fonction pour extraire l'adresse du client
    const getClientAddress = (client: { ville?: string; secteur?: string } | null): string => {
      if (!client) return '';

      const ville = client.ville || '';
      const secteur = client.secteur || '';

      if (ville && secteur) {
        return `${ville} - ${secteur}`;
      } else if (ville) {
        return ville;
      } else if (secteur) {
        return secteur;
      }
      return '';
    };

    // Configuration de pagination - 24 produits par page maximum
    const PRODUCTS_PER_PAGE = 24; // Limite de produits par page
    const sortedProducts = useMemo(() =>
      sortie.products?.sort((a, b) => b.product.product_libelle.localeCompare(a.product.product_libelle)) || [],
      [sortie.products]
    );

    // Compter les options de montants significatives
    const countSignificantAmountOptions = useMemo(() => {
      let count = 0;

      // Remise Es
      if (isSignificantValue(sortie.montant_remise_especes)) count++;

      // Remise Spéciale
      if (isSignificantValue(sortie.remise_speciale)) count++;

      // Remise Trimestrielle
      if (isSignificantValue(sortie.remise_trimestrielle)) count++;

      // Valeur Ajoutée
      if (isSignificantValue(sortie.valeur_ajoutee)) count++;

      // Retour
      if (isSignificantValue(sortie.retour)) count++;

      return count;
    }, [sortie.montant_remise_especes, sortie.remise_speciale, sortie.remise_trimestrielle, sortie.valeur_ajoutee, sortie.retour]);

    // Diviser les produits en pages avec condition spéciale
    const productPages = useMemo(() => {
      if (sortedProducts.length === 0) {
        return []; // Aucune page si pas de produits
      }

      const pages: typeof sortedProducts[] = [];
      let currentIndex = 0;

      while (currentIndex < sortedProducts.length) {
        // Calculer combien de produits mettre sur cette page
        const remainingProducts = sortedProducts.length - currentIndex;
        let productsForThisPage: number = Math.min(PRODUCTS_PER_PAGE, remainingProducts);

        // Condition spéciale : si on a exactement 24 produits ET plus d'une option de montants
        // on réduit à 23 produits pour laisser de l'espace pour la section des montants
        if (productsForThisPage === PRODUCTS_PER_PAGE &&
            sortedProducts.length === PRODUCTS_PER_PAGE &&
            countSignificantAmountOptions > 1) {
          productsForThisPage = PRODUCTS_PER_PAGE - 1; // 23 produits au lieu de 24
        }

        pages.push(sortedProducts.slice(currentIndex, currentIndex + productsForThisPage));
        currentIndex += productsForThisPage;
      }

      return pages;
    }, [sortedProducts, countSignificantAmountOptions]);

    // Le nombre de pages est maintenant productPages.length

    // Afficher uniquement "Montant Total" si égal à "Montant" (tolérance d'arrondi)
    const totalsEqual = useMemo(() => {
      const total = Number(sortie.total_general ?? 0);
      const finalTotal = Number(sortie.montant_total_final ?? 0);
      return Math.abs(finalTotal - total) < 0.005;
    }, [sortie.total_general, sortie.montant_total_final]);

    return (
      <div ref={ref} className="print-content">
        <style>
          {`
            @media print {
              .print-content {
                font-family: Arial, sans-serif;
                font-size: 12px;
                color: #000;
                background: white;
                max-width: 100%;
                margin: 0;
                padding: 0;
                position: relative;
              }

              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              html {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              img {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                display: block !important;
                visibility: visible !important;
              }

              @page {
                margin: 10mm;
                size: A4;
              }

              .page-break {
                page-break-before: always;
                break-before: page;
              }

              .avoid-break {
                page-break-inside: avoid;
                break-inside: avoid;
              }

              /* Éviter les pages vides - CORRIGÉ */
              .print-content > div:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }

              /* AJOUTÉ: Éviter les pages vides sur les derniers éléments */
              .last-page-content {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }

              /* Footer fixe en bas de chaque page */
              .footer-fixed {
                position: relative;
                width: 100%;
                height: 60px;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                background-color: white;
                border-top: 1px solid #ccc;
              }

              /* Conteneur de page pour le positionnement du footer */
              .page-container {
                position: relative;
                min-height: 277mm; /* A4 height minus page margins */
                height: 277mm; /* Hauteur fixe pour A4 */
                display: flex;
                flex-direction: column;
                overflow: hidden; /* évite les débordements qui créent des pages vides */
              }

              /* Filigrane/Arrière-plan de page */
              .page-container::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('/images/mio-arriere-plan.jpg') no-repeat center center;
                background-size: 70% auto; /* Ajustez 60-90% selon rendu voulu */
                opacity: 0.01; /* Filigrane légèrement plus visible */
                z-index: 0;
                pointer-events: none;
              }

              /* S'assurer que le contenu passe au-dessus du filigrane */
              .page-container > * {
                position: relative;
                z-index: 1;
              }

              /* Éviter que les espacements créent des pages vides */
              .summary-spacing {
                margin-bottom: 10mm; /* espace modéré avant le footer */
              }

              /* Contenu principal - éviter qu'il déborde sur le footer */
              .main-content {
                flex: 1;
                min-height: 0;
                max-height: calc(277mm - 60px); /* Hauteur totale moins footer */
              }

              .print-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding: 15px;
              }

              .print-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
              }

              .print-subtitle {
                font-size: 14px;
                color: #666;
                margin-bottom: 10px;
              }

              .print-date {
                font-size: 12px;
                color: #666;
              }

              .info-section {
                margin-bottom: 20px;
                display: flex;
                gap: 20px;
              }

              .info-box {
                flex: 1;
                border: 1px solid #ccc;
                padding: 10px;
                border-radius: 4px;
              }

              .info-title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 8px;
                border-bottom: 1px solid #ccc;
                padding-bottom: 4px;
              }

              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 12px;
              }

              .products-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }

              .products-table th,
              .products-table td {
                border: 1px solid #ccc;
                padding: 8px;
                text-align: left;
                font-size: 11px;
              }

              .products-table th {
                background-color: #f5f5f5;
                font-weight: bold;
                text-align: center;
              }

              .summary-section {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
              }

              .summary-box {
                flex: 1;
                border: 1px solid #ccc;
                padding: 10px;
                border-radius: 4px;
              }

              .footer-section {
                margin-top: 30px;
                display: flex;
                gap: 20px;
                justify-content: space-between;
              }

              .signature-box {
                flex: 1;
                text-align: center;
              }

              .signature-line {
                border-bottom: 1px solid #000;
                height: 40px;
                margin-top: 10px;
              }

              .stamp-box {
                border: 2px solid #000;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
              }
            }
          `}
        </style>

        {/* Affichage conditionnel - seulement s'il y a des produits */}
        {productPages.length > 0 ? (
          productPages.map((pageProducts, pageIndex) => (
          <div key={pageIndex} className={`page-container ${pageIndex > 0 ? 'page-break' : ''} ${pageIndex === productPages.length - 1 ? 'last-page-content' : ''}`}>
            {/* Fallback watermark image (visible même si le pseudo-élément n'est pas imprimé) */}
            <img
              src={"/images/mio-arriere-plan.jpg"}
              alt="Watermark"
              style={{
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                width: '80%',
                height: 'auto',
                opacity: 0.08,
                zIndex: 0,
                pointerEvents: 'none'
              }}
            />
            {/* Contenu principal de la page */}
            <div className="main-content">
              {/* Header - répété sur chaque page */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                borderBottom: '2px solid #333',
                padding: '15px',
                position: 'relative',
                minHeight: '60px'
              }}>
              {/* Logo en haut à gauche */}
              <img
                src={"/images/logo-fmcg-300x183.jpg"}
                alt="Logo"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '50px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
              {/* Titre principal */}
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#333',
                textAlign: 'center'
              }}>
                BON DE LIVRAISON
              </div>

              {/* Deux rectangles d'informations */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>
                {/* Informations générales */}
                <div style={{
                  flex: 1,
                  border: '3px double #000',
                  padding: '8px',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '120px'
                }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Date:</span>
                    <span>{new Date(sortie.date_bl).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Numéro BL:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{sortie.numero_bl}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Poids (KG):</span>
                    <span>{formatNumber(sortie.total_poids || 0)}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Téléphone Client:</span>
                    <span>{sortie.client?.telephone || ''}</span>
                  </div>
                  {sortie.livreur?.nom && sortie.livreur.nom.trim() !== '' && (
                    <div style={{ display: 'flex' }}>
                      <span style={{ width: '120px', fontWeight: 'bold' }}>Livreur:</span>
                      <span>{sortie.livreur.nom}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Nombre de Pages:</span>
                    <span>{productPages.length}</span>
                  </div>
                </div>

                {/* Informations commercial et client */}
                <div style={{
                  flex: 1,
                  border: '3px double #000',
                  padding: '8px',
                  marginLeft: '20px',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '120px'
                }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Commercial:</span>
                    <span>{sortie.commercial?.nom || ''}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Téléphone Com:</span>
                    <span>{sortie.commercial?.telephone || ''}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Type Client :</span>
                    <span>{Math.trunc(Number(sortie.client_gdg ?? 0)).toString()}</span>
                  </div>


                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Code Client:</span>
                    <span>{sortie.client?.code || ''}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Nom Client:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{sortie.client?.nom || ''}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Adresse:</span>
                    <span>
                      {getClientAddress(sortie.client)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau des Produits pour cette page - seulement s'il y a des produits */}
            {pageProducts.length > 0 && (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
                border: '2px solid #ccc',
                tableLayout: 'fixed'
              }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{
                    border: '1px solid #ccc',
                    padding: '4px 6px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    width: '8%'
                  }}>N°</th>
                  <th style={{
                    border: '1px solid #ccc',
                    padding: '4px 6px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    width: '12%'
                  }}>Ref</th>
                  <th style={{
                    border: '1px solid #ccc',
                    padding: '4px 6px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    width: '40%'
                  }}>Désignation</th>
                  <th style={{
                    border: '1px solid #ccc',
                    padding: '4px 6px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    width: '8%'
                  }}>Quantité</th>
                  <th style={{
                    border: '1px solid #ccc',
                    padding: '4px 6px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    width: '15%'
                  }}>Prix Unitaire</th>
                  <th style={{
                    border: '1px solid #ccc',
                    borderRight: '2px solid #ccc',
                    padding: '4px 6px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    paddingRight: '12px',
                    width: '17%'
                  }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {pageProducts.map((product, index) => {
                  // Calculer l'index global en tenant compte des pages précédentes
                  let globalIndex = 0;
                  for (let i = 0; i < pageIndex; i++) {
                    globalIndex += productPages[i].length;
                  }
                  globalIndex += index;

                  // Vérifier si le produit est gratuit (prix = 0)
                  const isFreeProduct = Number(product.prix_produit) === 0;

                  return (
                    <tr key={globalIndex} style={{
                      backgroundColor: isFreeProduct ? '#fae398' : 'transparent'
                    }}>
                      <td style={{
                        border: '1px solid #ccc',
                        padding: '4px 6px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>{globalIndex + 1}</td>
                      <td style={{
                        border: '1px solid #ccc',
                        padding: '4px 6px',
                        textAlign: 'center',
                        fontSize: '11px'
                      }}>{product.ref_produit}</td>
                      <td style={{
                        border: '1px solid #ccc',
                        padding: '4px 6px',
                        fontSize: '11px'
                      }}>{product.product.product_libelle}</td>
                      <td style={{
                        border: '1px solid #ccc',
                        padding: '4px 6px',
                        textAlign: 'center',
                        fontSize: '11px'
                      }}>{product.quantite_produit}</td>
                      <td style={{
                        border: '1px solid #ccc',
                        padding: '4px 6px',
                        textAlign: 'center',
                        fontSize: '11px'
                      }}>{formatNumber(product.prix_produit)}</td>
                      <td style={{
                        border: '1px solid #ccc',
                        borderRight: '2px solid #ccc',
                        padding: '4px 6px',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        paddingRight: '12px'
                      }}>
                        {formatNumber(product.total_ligne)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}

            {/* Récapitulatif - seulement sur la dernière page */}
            {pageIndex === productPages.length - 1 && (
              <div className="summary-spacing" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '20px',
                marginBottom: '10mm',
                pageBreakAfter: 'avoid'
              }}>
                <div style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  minWidth: '250px',
                  backgroundColor: 'rgba(245, 245, 245, 0.3)'
                }}>
                  {totalsEqual ? (
                    // Si égal, n'afficher que "Montant Total"
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 6px'
                    }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'left' }}>Montant Total:</span>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'right' }}>{formatNumber(sortie.montant_total_final || 0)}</span>
                    </div>
                  ) : (
                    <>
                      {/* Calcul: total_general - remises + ajustements */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 6px',
                        borderBottom: '1px solid #ccc'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'left' }}>Montant:</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>{formatNumber(sortie.total_general || 0)}</span>
                      </div>

                      {/* Remise Es - affichée seulement si significative */}
                      {isSignificantValue(sortie.montant_remise_especes) && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          borderBottom: '1px solid #ccc',
                          backgroundColor: 'rgba(255, 255, 255, 0.3)'
                        }}>
                          <span style={{ fontSize: '11px', textAlign: 'left' }}>Remise Es ({sortie.remise_es || '0'}%):</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626', textAlign: 'right' }}>-{formatNumber(sortie.montant_remise_especes || 0)}</span>
                        </div>
                      )}


                      {/* Remise Spéciale - affichée seulement si significative */}
                      {isSignificantValue(sortie.remise_speciale) && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          borderBottom: '1px solid #ccc',
                          backgroundColor: 'rgba(255, 255, 255, 0.3)'
                        }}>
                          <span style={{ fontSize: '11px', textAlign: 'left' }}>Remise Spéciale:</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626', textAlign: 'right' }}>-{formatNumber(sortie.remise_speciale || 0)}</span>
                        </div>
                      )}

                      {/* Remise Trimestrielle - affichée seulement si significative */}
                      {isSignificantValue(sortie.remise_trimestrielle) && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          borderBottom: '1px solid #ccc',
                          backgroundColor: 'rgba(255, 255, 255, 0.3)'
                        }}>
                          <span style={{ fontSize: '11px', textAlign: 'left' }}>Remise Trimestrielle:</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626', textAlign: 'right' }}>-{formatNumber(sortie.remise_trimestrielle || 0)}</span>
                        </div>
                      )}

                      {/* Valeur Ajoutée - affichée seulement si significative */}
                      {isSignificantValue(sortie.valeur_ajoutee) && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          borderBottom: '1px solid #ccc',
                          backgroundColor: 'rgba(255, 255, 255, 0.3)'
                        }}>
                          <span style={{ fontSize: '11px', textAlign: 'left' }}>Valeur Ajoutée:</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>+{formatNumber(sortie.valeur_ajoutee || 0)}</span>
                        </div>
                      )}

                      {/* Retour - affiché seulement si significatif */}
                      {isSignificantValue(sortie.retour) && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          borderBottom: '1px solid #ccc',
                          backgroundColor: 'rgba(255, 255, 255, 0.3)'
                        }}>
                          <span style={{ fontSize: '11px', textAlign: 'left' }}>Retour:</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>+{formatNumber(sortie.retour || 0)}</span>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 6px',
                        borderTop: '2px solid #ccc',
                        backgroundColor: 'rgba(245, 245, 245, 0.35)'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'left' }}>Montant Total:</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>{formatNumber(sortie.montant_total_final || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            </div> {/* Fermeture de main-content */}

            {/* Footer - sur chaque page */}
            <Footer
              currentPage={pageIndex + 1}
              totalPages={productPages.length}
            />
          </div>
        ))
        ) : (
          // Page vide si aucun produit
          <div className="page-container">
            {/* Contenu principal de la page */}
            <div className="main-content">
              {/* Header - page vide */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                borderBottom: '2px solid #333',
                padding: '15px'
              }}>
              {/* Titre principal */}
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#333',
                textAlign: 'left'
              }}>
                BON DE LIVRAISON
              </div>

              {/* Deux rectangles d'informations */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>
                {/* Informations générales */}
                <div style={{
                  flex: 1,
                  border: '3px double #000',
                  padding: '8px',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '120px'
                }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Date:</span>
                    <span>{new Date(sortie.date_bl).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Numéro BL:</span>
                    <span>{sortie.numero_bl}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Poids (KG):</span>
                    <span>{formatNumber(sortie.total_poids || 0)}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Téléphone Client:</span>
                    <span>{sortie.client?.telephone || ''}</span>
                  </div>
                </div>

                {/* Informations commercial et client */}
                <div style={{
                  flex: 1,
                  border: '3px double #000',
                  padding: '8px',
                  marginLeft: '20px',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '120px'
                }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Commercial:</span>
                    <span>{sortie.commercial?.nom || ''}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Téléphone Com:</span>
                    <span>{sortie.commercial?.telephone || ''}</span>
                  </div>
                  {sortie.livreur?.nom && sortie.livreur.nom.trim() !== '' && (
                    <div style={{ display: 'flex' }}>
                      <span style={{ width: '120px', fontWeight: 'bold' }}>Livreur:</span>
                      <span>{sortie.livreur.nom}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Code Client:</span>
                    <span>{sortie.client?.code || ''}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Nom Client:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{sortie.client?.nom || ''}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Adresse:</span>
                    <span>
                      {getClientAddress(sortie.client)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div> {/* Fermeture de main-content */}

            {/* Message d'absence de produits */}
            <div style={{
              textAlign: 'center',
              padding: '50px',
              fontSize: '16px',
              color: '#666',
              border: '2px dashed #ccc',
              margin: '20px'
            }}>
              Aucun produit dans cette sortie
            </div>

            {/* Footer - page sans produits */}
            <Footer
              currentPage={1}
              totalPages={1}
            />
          </div>
        )}
      </div>
    );
  }
);

PrintableSortie.displayName = 'PrintableSortie';
