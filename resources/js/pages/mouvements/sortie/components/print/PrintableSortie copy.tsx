import React, { useMemo } from 'react';
import { Sortie } from '../../types';

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

    // Diviser les produits en pages - seulement s'il y a des produits
    const productPages = useMemo(() => {
      if (sortedProducts.length === 0) {
        return []; // Aucune page si pas de produits
      }

      const pages: typeof sortedProducts[] = [];
      let currentIndex = 0;

      while (currentIndex < sortedProducts.length) {
        // Calculer combien de produits mettre sur cette page
        const remainingProducts = sortedProducts.length - currentIndex;
        const productsForThisPage: number = Math.min(PRODUCTS_PER_PAGE, remainingProducts);

        pages.push(sortedProducts.slice(currentIndex, currentIndex + productsForThisPage));
        currentIndex += productsForThisPage;
      }

      return pages;
    }, [sortedProducts]);

    // Le nombre de pages est maintenant productPages.length

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

              .page-break-after {
                page-break-after: always;
                break-after: page;
              }

              .avoid-break {
                page-break-inside: avoid;
                break-inside: avoid;
              }

              /* Éviter les pages vides */
              .print-content > div:last-child {
                page-break-after: avoid;
                break-after: avoid;
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
          <div key={pageIndex} className={pageIndex > 0 ? 'page-break' : ''}>
            {/* Header - répété sur chaque page */}
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
                  {productPages.length > 1 && (
                    <div style={{ display: 'flex' }}>
                      <span style={{ width: '120px', fontWeight: 'bold' }}>Nombre de Pages:</span>
                      <span>{productPages.length}</span>
                    </div>
                  )}
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
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Livreur:</span>
                    <span>{sortie.livreur?.nom || ''}</span>
                  </div>
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

            {/* Tableau des Produits pour cette page - seulement s'il y a des produits */}
            {pageProducts.length > 0 && (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
                border: '1px solid #ccc',
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
                  // Calculer l'index global (toutes les pages ont 25 produits max)
                  const globalIndex = pageIndex * PRODUCTS_PER_PAGE + index;
                  return (
                    <tr key={globalIndex}>
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
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    border: '3px double #000',
                    padding: '10px',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    minWidth: '250px'
                  }}>
                    {/* Calcul: total_general - montant_remise_especes - remise_speciale - remise_trimestrielle + valeur_ajoutee + retour */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', textAlign: 'left' }}><strong>Montant:</strong></span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', textAlign: 'right' }}>{formatNumber(sortie.total_general || 0)}</span>
                    </div>

                    {/* Remise Es - affichée seulement si significative */}
                    {isSignificantValue(sortie.montant_remise_especes) && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        backgroundColor: '#fefce8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #fde047'
                      }}>
                        <span style={{ fontSize: '13px', textAlign: 'left' }}>Remise Es ({sortie.remise_es || '0'}%):</span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626', textAlign: 'right' }}>-{formatNumber(sortie.montant_remise_especes || 0)}</span>
                      </div>
                    )}

                    {/* Remise Spéciale - affichée seulement si significative */}
                    {isSignificantValue(sortie.remise_speciale) && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        backgroundColor: '#fefce8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #fde047'
                      }}>
                        <span style={{ fontSize: '13px', textAlign: 'left' }}>Remise Spéciale:</span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626', textAlign: 'right' }}>-{formatNumber(sortie.remise_speciale || 0)}</span>
                      </div>
                    )}

                    {/* Remise Trimestrielle - affichée seulement si significative */}
                    {isSignificantValue(sortie.remise_trimestrielle) && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        backgroundColor: '#fefce8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #fde047'
                      }}>
                        <span style={{ fontSize: '13px', textAlign: 'left' }}>Remise Trimestrielle:</span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626', textAlign: 'right' }}>-{formatNumber(sortie.remise_trimestrielle || 0)}</span>
                      </div>
                    )}

                    {/* Valeur Ajoutée - affichée seulement si significative */}
                    {isSignificantValue(sortie.valeur_ajoutee) && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        backgroundColor: '#fefce8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #fde047'
                      }}>
                        <span style={{ fontSize: '13px', textAlign: 'left' }}>Valeur Ajoutée:</span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>+{formatNumber(sortie.valeur_ajoutee || 0)}</span>
                      </div>
                    )}

                    {/* Retour - affiché seulement si significatif */}
                    {isSignificantValue(sortie.retour) && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        backgroundColor: '#fefce8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #fde047'
                      }}>
                        <span style={{ fontSize: '13px', textAlign: 'left' }}>Retour:</span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>+{formatNumber(sortie.retour || 0)}</span>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #000',
                      paddingTop: '4px',
                      marginTop: '4px'
                    }}>
                      <span style={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'left' }}><strong>Montant Total:</strong></span>
                      <span style={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'right' }}><strong>{formatNumber(sortie.montant_total_final || 0)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Espace pour le footer */}
                <div style={{ height: '20mm' }}></div>
              </>
            )}

            {/* Footer - sur chaque page */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'fixed',
              bottom: '10mm',
              left: '10mm',
              right: '10mm',
              fontSize: '10px',
              color: '#666',
              borderTop: '1px solid #ccc',
              paddingTop: '5px'
            }}>
              <div>
                {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR')}
              </div>
              <div>
                {pageIndex + 1} / {productPages.length}
              </div>
            </div>
          </div>
        ))
        ) : (
          // Page vide si aucun produit
          <div>
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
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '120px', fontWeight: 'bold' }}>Livreur:</span>
                    <span>{sortie.livreur?.nom || ''}</span>
                  </div>
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'fixed',
              bottom: '10mm',
              left: '10mm',
              right: '10mm',
              fontSize: '10px',
              color: '#666',
              borderTop: '1px solid #ccc',
              paddingTop: '5px'
            }}>
              <div>
                {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR')}
              </div>
              <div>
                1 / 1
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PrintableSortie.displayName = 'PrintableSortie';
