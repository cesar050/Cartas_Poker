import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../Cards/Card';
import Pile from './Pile';
import DealAnimation from '../UI/DealAnimation';
import './GameBoard.css';

const GameBoard = ({ gameState, onFlipCard, onPlaceCard, currentCard, unlockedPile, isDealing, onDealComplete }) => {
  
  const displayGameState = isDealing ? {
    ...gameState,
    piles: { A: [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], '0': [], J: [], Q: [], K: [] },
    face_down_cards: { A: 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '0': 0, J: 0, Q: 0, K: 0 },
    current_card: null,
    kings_revealed: 0
  } : gameState;
  
  const isLocked = (pile) => {
    if (gameState?.status === 'won' || gameState?.status === 'lost') {
      return true;
    }

    if (currentCard) {
      const cardValue = currentCard[0];
      return pile !== cardValue;
    }

    // Si hay una carta actual, solo desbloquear la pila correspondiente
    if (currentCard) {
      const cardValue = currentCard[0];
      return pile !== cardValue;
    }

    // Verificar si la pila tiene cartas boca abajo
    const faceDownCount = gameState?.face_down_cards?.[pile] || 0;
    const pileCards = Array.isArray(gameState?.piles?.[pile]) ? gameState.piles[pile] : [];
    const isPileComplete = pileCards.length === 4 && faceDownCount === 0;

    // Si la pila está completa, está bloqueada para voltear
    if (isPileComplete) {
      return true;
    }

    // Si no hay unlockedPile, permitir voltear de cualquier pila con cartas boca abajo
    if (!unlockedPile) {
      return faceDownCount === 0;
    }

    // Si hay unlockedPile, verificar si está completa
    const unlockedFaceDown = gameState?.face_down_cards?.[unlockedPile] || 0;
    const unlockedPileCards = Array.isArray(gameState?.piles?.[unlockedPile]) ? gameState.piles[unlockedPile] : [];
    const isUnlockedComplete = unlockedPileCards.length === 4 && unlockedFaceDown === 0;

    // Si la pila desbloqueada está completa, permitir voltear de cualquier pila con cartas boca abajo
    if (isUnlockedComplete) {
      return faceDownCount === 0;
    }

    // Si la pila desbloqueada no está completa, solo permitir voltear de esa pila
    if (unlockedPile === pile) {
      return faceDownCount === 0;
    }

    return true;
  };

  const handleCardClick = (pile) => {
    if (currentCard) {
      onPlaceCard(pile);
    }
  };

  const handleFlipFromPile = (pile) => {
    if (!currentCard && !isLocked(pile)) {
      onFlipCard(pile);
    }
  };

  return (
    <div className="game-board">
      {}
      <DealAnimation 
        isDealing={isDealing}
        onComplete={onDealComplete}
      />
      
      <AnimatePresence>
        {currentCard && (
          <motion.div 
            className="card-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentCard && !isDealing && (
          <motion.div
            className="current-card-display"
            initial={{ scale: 0.5, rotateY: 180, opacity: 0 }}
            animate={{ scale: 1.2, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <Card code={currentCard} faceUp={true} draggable={false} />
            <div className="drag-hint">👆 Click donde corresponde</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="game-layout">
        
        {}
        <div className="top-row">
          {['A', '2', '3', '4'].map((value) => (
            <div 
              key={value}
              data-pile={value}
              onClick={() => handleCardClick(value)}
              className={`pile-wrapper ${isLocked(value) ? 'locked' : 'unlocked'} ${currentCard && !isLocked(value) ? 'clickable' : ''}`}
            >
              <Pile 
                value={value} 
                cards={Array.isArray(displayGameState?.piles?.[value]) ? displayGameState.piles[value] : []}
                faceDownCount={displayGameState?.face_down_cards?.[value] || 0}
                isCenter={false}
                onFlipCard={() => handleFlipFromPile(value)}
              />
            </div>
          ))}
        </div>

        {}
        <div className="middle-container">
          
          {}
          <div className="left-column">
            <div 
              data-pile="Q"
              onClick={() => handleCardClick('Q')}
              className={`pile-wrapper ${isLocked('Q') ? 'locked' : 'unlocked'} ${currentCard && !isLocked('Q') ? 'clickable' : ''}`}
            >
              <Pile 
                value="Q" 
                cards={Array.isArray(displayGameState?.piles?.['Q']) ? displayGameState.piles['Q'] : []}
                faceDownCount={displayGameState?.face_down_cards?.['Q'] || 0}
                isCenter={false}
                onFlipCard={() => handleFlipFromPile('Q')}
              />
            </div>
            <div 
              data-pile="J"
              onClick={() => handleCardClick('J')}
              className={`pile-wrapper ${isLocked('J') ? 'locked' : 'unlocked'} ${currentCard && !isLocked('J') ? 'clickable' : ''}`}
            >
              <Pile 
                value="J" 
                cards={Array.isArray(displayGameState?.piles?.['J']) ? displayGameState.piles['J'] : []}
                faceDownCount={displayGameState?.face_down_cards?.['J'] || 0}
                isCenter={false}
                onFlipCard={() => handleFlipFromPile('J')}
              />
            </div>
          </div>

          {}
          <div className="center-king-container">
            <div 
              data-pile="K"
              className={`pile-wrapper ${isLocked('K') ? 'locked' : 'unlocked'}`}
              onClick={() => handleCardClick('K')}
            >
              <Pile 
                value="K" 
                cards={Array.isArray(displayGameState?.piles?.['K']) ? displayGameState.piles['K'] : []}
                faceDownCount={displayGameState?.face_down_cards?.['K'] || 0}
                onFlipCard={() => handleFlipFromPile('K')}
                isCenter={true}
              />
            </div>

            <div className="king-counter">
              <span>👑 {displayGameState?.kings_revealed || 0}/4</span>
            </div>
          </div>

          {}
          <div className="right-column">
            <div 
              data-pile="5"
              onClick={() => handleCardClick('5')}
              className={`pile-wrapper ${isLocked('5') ? 'locked' : 'unlocked'} ${currentCard && !isLocked('5') ? 'clickable' : ''}`}
            >
              <Pile 
                value="5" 
                cards={Array.isArray(displayGameState?.piles?.['5']) ? displayGameState.piles['5'] : []}
                faceDownCount={displayGameState?.face_down_cards?.['5'] || 0}
                isCenter={false}
                onFlipCard={() => handleFlipFromPile('5')}
              />
            </div>
            <div 
              data-pile="6"
              onClick={() => handleCardClick('6')}
              className={`pile-wrapper ${isLocked('6') ? 'locked' : 'unlocked'} ${currentCard && !isLocked('6') ? 'clickable' : ''}`}
            >
              <Pile 
                value="6" 
                cards={Array.isArray(displayGameState?.piles?.['6']) ? displayGameState.piles['6'] : []}
                faceDownCount={displayGameState?.face_down_cards?.['6'] || 0}
                isCenter={false}
                onFlipCard={() => handleFlipFromPile('6')}
              />
            </div>
          </div>

        </div>

        {}
        <div className="bottom-row">
          {['0', '9', '8', '7'].map((value) => (
            <div 
              key={value}
              data-pile={value}
              onClick={() => handleCardClick(value)}
              className={`pile-wrapper ${isLocked(value) ? 'locked' : 'unlocked'} ${currentCard && !isLocked(value) ? 'clickable' : ''}`}
            >
              <Pile 
                value={value === '0' ? '10' : value}
                cards={Array.isArray(displayGameState?.piles?.[value]) ? displayGameState.piles[value] : []}
                faceDownCount={displayGameState?.face_down_cards?.[value] || 0}
                isCenter={false}
                onFlipCard={() => handleFlipFromPile(value)}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default GameBoard;