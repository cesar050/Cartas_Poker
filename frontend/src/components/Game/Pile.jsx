import React from 'react';
import Card from '../Cards/Card';
import './Pile.css';

const Pile = ({ value, cards, faceDownCount, onFlipCard, isCenter }) => {
  const cardsArray = Array.isArray(cards) ? cards.filter(card => card != null && card !== '') : [];
  
  if (cardsArray.length > 0) {
    console.log(`🎴 Pile ${value}: Mostrando ${cardsArray.length} cartas:`, cardsArray);
  } else if (cards && !Array.isArray(cards)) {
    console.warn(`⚠️ Pile ${value}: cards no es un array:`, cards, typeof cards);
  }
  
  const hasCards = cardsArray.length > 0 || faceDownCount > 0;
  const canFlip = faceDownCount > 0;

  return (
    <div className="pile">
      <div className="pile-label">{value}</div>
      <div 
        className={`pile-cards ${canFlip ? 'pile-clickable' : ''}`}
        onClick={canFlip ? onFlipCard : undefined}
      >
        {!hasCards ? (
          <div className="pile-empty">
            <span>{value}</span>
          </div>
        ) : (
          <div className="pile-stack">
            {}
            {faceDownCount > 0 && [...Array(faceDownCount)].map((_, index) => (
              <div
                key={`back-${index}-${faceDownCount}`}
                className="stacked-card back-card"
                style={{
                  position: 'absolute',
                  top: `${index * 2}px`,
                  left: `${index * 2}px`,
                  zIndex: index,
                  opacity: 1,
                  visibility: 'visible',
                }}
              >
                <Card code="back" faceUp={false} />
              </div>
            ))}
            
            {}
            {cardsArray && cardsArray.length > 0 && cardsArray.map((card, index) => (
              <div
                key={`front-${value}-${card}-${index}-${faceDownCount}-${cardsArray.length}`}
                className="stacked-card front-card"
                style={{
                  position: 'absolute',
                  top: `${(faceDownCount * 2) + (index * 8)}px`,
                  left: `${(faceDownCount * 2) + (index * 2)}px`,
                  zIndex: faceDownCount + index + 100,
                  opacity: 1,
                  visibility: 'visible',
                }}
              >
                <Card code={card} faceUp={true} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {}
      <div className="pile-count">
        {faceDownCount > 0 && `🔒${faceDownCount} `}
        {cardsArray.length > 0 && `✓${cardsArray.length}/4`}
        {cardsArray.length === 4 && faceDownCount === 0 && ` ✅`}
      </div>
    </div>
  );
};

export default Pile;