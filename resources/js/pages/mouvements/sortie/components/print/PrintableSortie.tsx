import React from 'react';
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
    const getClientAddress = (client: any): string => {
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
                min-height: 100vh;
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
                size: auto;
                counter-increment: page;
                @bottom-center {
                  content: "Page " counter(page) " / " counter(pages);
                  font-family: Arial, sans-serif;
                  font-size: 11px;
                  color: #666;
                }
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

                          {/* Header */}
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
                   {/* Debug: {JSON.stringify(sortie.client?.ville)} - {JSON.stringify(sortie.client?.secteur)} */}
                 </span>
               </div>
             </div>
           </div>
         </div>



                 {/* Tableau des Produits */}
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
                 width: '12%'
               }}>Ref</th>
               <th style={{
                 border: '1px solid #ccc',
                 padding: '4px 6px',
                 textAlign: 'left',
                 fontWeight: 'bold',
                 fontSize: '11px',
                 width: '45%'
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
                 width: '20%'
               }}>Total</th>
             </tr>
           </thead>
           <tbody>
             {sortie.products?.map((product, index) => (
               <tr key={index}>
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
             ))}
           </tbody>
         </table>

                          {/* Récapitulatif */}
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
             {/* Utilise les valeurs calculées et stockées en base de données */}
           </div>
         </div>

         {/* Espace pour le footer */}
         <div style={{ height: '20mm' }}></div>

                 {/* Footer */}
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
             1
           </div>
         </div>
      </div>
    );
  }
);

PrintableSortie.displayName = 'PrintableSortie';
