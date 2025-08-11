import React from 'react';

interface FooterProps {
  currentPage: number;
  totalPages: number;
  showDate?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  currentPage,
  totalPages,
  showDate = true
}) => {
  // Configuration centralisée - modifier ici pour changer tous les footers
  const config = {
    logoHeight: '50px', // légèrement agrandi
    logoOpacity: 0.40,
    logoWidth: 50, // largeur approximative de chaque logo en px
    margin: 1, // marge de chaque côté en pourcentage
    startPosition: 10 // position du premier logo en px
  };

  // Liste des logos
  const logos = [
    { src: '/images/fix.png', alt: 'Fix Ultra' },
    { src: '/images/claires.png', alt: "Claire's" },
    { src: '/images/zen.png', alt: 'Zen' },
    { src: '/images/bandoux.png', alt: 'Blandoux' },
    { src: '/images/hand.PNG', alt: 'Hand' },
    { src: '/images/iris.PNG', alt: 'Iris' },
    { src: '/images/loux.PNG', alt: 'Loux' },
    { src: '/images/mala.PNG', alt: 'Mala' },
    { src: '/images/pappillont.png', alt: 'Papillon' },
    { src: '/images/pena.PNG', alt: 'Pena' },
    { src: '/images/verde.PNG', alt: 'Verde' },
    { src: '/images/vita_fresh.PNG', alt: 'Vita Fresh' }
  ];

  // Calcul de l'espacement pour occuper toute la largeur avec marges égales
  const totalLogos = logos.length;
  const startPosition = config.margin;
  const endPosition = 100 - config.margin;
  const actualSpacing = (endPosition - startPosition) / (totalLogos - 1);

  // Debug: afficher les valeurs pour vérification
//   console.log('Footer spacing:', {
//     totalLogos,
//     startPosition,
//     endPosition,
//     actualSpacing,
//     margin: config.margin,
//     logoWidth: config.logoWidth
//   });

  return (
    <div className="footer-fixed" style={{
      fontSize: '8px',
      color: '#666',
      borderTop: '1px solid #ccc',
      paddingTop: '2px',
      paddingLeft: '5px',
      paddingRight: '5px',
      paddingBottom: '5px',
      lineHeight: '1',
      height: '60px',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Date et numérotation directement sous la ligne */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: '20px',
        position: 'relative',
        zIndex: 2
      }}>
        {showDate && (
          <div>
            {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR')}
          </div>
        )}
        <div>
          Page {currentPage} sur {totalPages}
        </div>
      </div>

      {/* Logos en arrière-plan - après le texte */}
      {logos.map((logo, index) => (
        <img
          key={logo.alt}
          src={logo.src}
          alt={logo.alt}
          style={{
            position: 'absolute',
            left: `${startPosition + (index * actualSpacing)}%`,
            top: '25px', // Positionné après le texte
            height: config.logoHeight,
            width: 'auto',
            maxWidth: `${config.logoWidth}px`,
            opacity: config.logoOpacity,
            zIndex: 1,
            objectFit: 'contain',
            pointerEvents: 'none'
          }}
        />
      ))}
    </div>
  );
};
