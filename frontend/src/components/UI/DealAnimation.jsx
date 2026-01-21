import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Card from '../Cards/Card';
import './DealAnimation.css';

const PILES_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'];

const DealAnimation = ({ isDealing, onComplete }) => {
  const [dealPhase, setDealPhase] = useState('idle');
  const [currentPileIndex, setCurrentPileIndex] = useState(0);
  const [currentCardInPile, setCurrentCardInPile] = useState(0);
  const [flyingCards, setFlyingCards] = useState([]);
  const [deckRemaining, setDeckRemaining] = useState(52);
  const [pilePositions, setPilePositions] = useState({});
  const [positionsReady, setPositionsReady] = useState(false);
  const [isDealingCard, setIsDealingCard] = useState(false);
  const containerRef = useRef(null);

  console.log('🎬 [DEAL ANIMATION] Renderizado, isDealing:', isDealing);

  useEffect(() => {
    if (isDealing) {
      console.log('🔍 [DEAL ANIMATION] Buscando contenedor .game-board...');
      console.log('🔍 containerRef.current:', containerRef.current);
      
      const timeoutId = setTimeout(() => {
        const positions = {};
        let container = null;
        
        if (containerRef.current) {
          container = containerRef.current.closest('.game-board');
          console.log('🔍 Buscando desde containerRef:', !!container);
        }
        
        if (!container) {
          container = document.querySelector('.game-board');
          console.log('🔍 Buscando en document:', !!container);
        }
        
        if (!container && containerRef.current) {
          container = containerRef.current.parentElement?.closest('.game-board');
          console.log('🔍 Buscando en parentElement:', !!container);
        }
        
        console.log('🔍 [DEAL ANIMATION] Container encontrado:', !!container);
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const centerX = containerRect.left + containerRect.width / 2;
          const centerY = containerRect.top + containerRect.height / 2;

          console.log('📐 Container:', {
            width: containerRect.width,
            height: containerRect.height,
            centerX,
            centerY
          });

          PILES_ORDER.forEach(pile => {
            const pileElement = container.querySelector(`[data-pile="${pile}"]`);
            if (pileElement) {
              const rect = pileElement.getBoundingClientRect();
              const elementCenterX = rect.left + rect.width / 2;
              const elementCenterY = rect.top + rect.height / 2;
              
              const relativeX = elementCenterX - centerX;
              const relativeY = elementCenterY - centerY;
              
              positions[pile] = { x: relativeX, y: relativeY };
              console.log(`📍 Posición ${pile}:`, { 
                x: relativeX, 
                y: relativeY,
                elementRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
              });
            } else {
              console.error(`❌ No se encontró elemento para pile: ${pile}`);
            }
          });
          
          const positionsCount = Object.keys(positions).length;
          console.log(`✅ Posiciones calculadas: ${positionsCount}/${PILES_ORDER.length}`, positions);
          
          if (positionsCount === PILES_ORDER.length) {
            setPilePositions(positions);
            setPositionsReady(true);
          } else {
            console.error('❌ No se calcularon todas las posiciones');
          }
        } else {
          console.error('❌ No se encontró el contenedor .game-board');
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setPositionsReady(false);
    }
  }, [isDealing]);

  useEffect(() => {
    console.log('🔄 [DEAL ANIMATION] isDealing cambió a:', isDealing);
    if (isDealing) {
      console.log('✅ Iniciando animación de reparto...');
      setDealPhase('waiting');
      setCurrentPileIndex(0);
      setCurrentCardInPile(0);
      setFlyingCards([]);
      setDeckRemaining(52);
      setIsDealingCard(false);
    } else {
      setDealPhase('idle');
      setCurrentPileIndex(0);
      setCurrentCardInPile(0);
      setFlyingCards([]);
      setDeckRemaining(52);
      setPositionsReady(false);
      setIsDealingCard(false);
    }
  }, [isDealing]);

  useEffect(() => {
    if (positionsReady && dealPhase === 'waiting') {
      setDealPhase('dealing');
    }
  }, [positionsReady, dealPhase]);

  useEffect(() => {
    if (dealPhase !== 'dealing' || !positionsReady || isDealingCard) {
      return;
    }

    const totalCardsDealt = currentPileIndex * 4 + currentCardInPile;
    if (totalCardsDealt >= 52) {
      console.log('✅ Todas las cartas repartidas, esperando a que lleguen a su destino...');
      setDealPhase('complete');
      setTimeout(() => {
        console.log('✅ Limpiando cartas voladoras y completando animación');
        setFlyingCards([]);
        setDealPhase('idle');
        setTimeout(() => {
          if (onComplete) {
            console.log('✅ Llamando onComplete después del delay de 1 segundo');
            onComplete();
          }
        }, 1000);
      }, 1500);
      return;
    }

    if (currentPileIndex >= PILES_ORDER.length) {
      console.error('❌ Índice de montón inválido:', currentPileIndex);
      return;
    }

    const pile = PILES_ORDER[currentPileIndex];
    const targetPos = pilePositions[pile];
    
    if (!targetPos) {
      console.warn(`⚠️ No hay posición para ${pile}, esperando...`);
      return;
    }

    if (currentCardInPile >= 4) {
      console.error(`❌ Error: Ya se repartieron 4 cartas en ${pile}, avanzando al siguiente montón`);
      setCurrentPileIndex(prev => prev + 1);
      setCurrentCardInPile(0);
      return;
    }

    setIsDealingCard(true);

    const cardId = `card-${currentPileIndex}-${currentCardInPile}-${Date.now()}`;
    const newCard = {
      id: cardId,
      pile,
      cardInPile: currentCardInPile,
      targetX: targetPos.x,
      targetY: targetPos.y,
      startTime: Date.now(),
      zIndex: totalCardsDealt
    };
    
    console.log(`🎴 Repartiendo carta ${totalCardsDealt + 1}/52 a ${pile} (${currentCardInPile + 1}/4)`);
    console.log(`   Montón ${currentPileIndex + 1}/13, Carta ${currentCardInPile + 1}/4 en este montón`);
    
    setFlyingCards(prev => [...prev, newCard]);
    setDeckRemaining(prev => Math.max(0, prev - 1));

    const delay = currentCardInPile === 3 ? 1200 : 700;
    
    setTimeout(() => {
      if (currentCardInPile < 3) {
        setCurrentCardInPile(prev => prev + 1);
      } else {
        console.log(`✅ Montón ${pile} completado con 4 cartas, pasando al siguiente`);
        setCurrentPileIndex(prev => prev + 1);
        setCurrentCardInPile(0);
      }
      setIsDealingCard(false);
    }, delay);
  }, [dealPhase, positionsReady, currentPileIndex, currentCardInPile, pilePositions, isDealingCard, onComplete]);

  if (!isDealing) {
    console.log('⏸️ [DEAL ANIMATION] isDealing es false, no renderizando');
    return null;
  }
  
  if (dealPhase === 'idle') {
    console.log('⏸️ [DEAL ANIMATION] dealPhase es idle, no renderizando');
    return null;
  }
  
  console.log('✅ [DEAL ANIMATION] Renderizando con fase:', dealPhase);

  const sourceX = 0;
  const sourceY = 0;
  
  if (dealPhase === 'dealing') {
    const totalCardsDealt = currentPileIndex * 4 + currentCardInPile;
    console.log('🎯 [DEAL ANIMATION] Estado:', {
      dealPhase,
      currentPileIndex,
      currentPile: PILES_ORDER[currentPileIndex],
      currentCardInPile,
      totalCardsDealt,
      flyingCardsCount: flyingCards.length,
      deckRemaining,
      positionsReady,
      pilePositionsCount: Object.keys(pilePositions).length,
      isDealingCard
    });
  }

  return (
    <div ref={containerRef} className="deal-animation-container">
      {}
      {(dealPhase === 'dealing' || dealPhase === 'waiting') && deckRemaining > 0 && (
        <motion.div
          className="deck-pile-in-game"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          {[...Array(Math.min(deckRemaining, 10))].map((_, index) => (
            <div
              key={`deck-card-${index}`}
              className="deck-card-stack"
              style={{
                position: 'absolute',
                top: `${index * 0.3}px`,
                left: `${index * 0.3}px`,
                zIndex: index,
                opacity: 1 - (index * 0.05)
              }}
            >
              <Card code="back" faceUp={false} />
            </div>
          ))}
          {deckRemaining > 0 && (
            <div className="deck-count-in-game">{deckRemaining}</div>
          )}
        </motion.div>
      )}

      {}
      {flyingCards.map((cardInfo) => {
        const stackOffsetX = cardInfo.cardInPile * 2;
        const stackOffsetY = cardInfo.cardInPile * 8;
        const finalX = cardInfo.targetX + stackOffsetX;
        const finalY = cardInfo.targetY + stackOffsetY;
        
        if (Math.abs(finalX) < 10 && Math.abs(finalY) < 10) {
          console.warn(`⚠️ Carta ${cardInfo.id} tiene coordenadas muy cercanas a (0,0):`, { finalX, finalY, targetX: cardInfo.targetX, targetY: cardInfo.targetY });
        }
        
        const cardWidth = 80;
        const cardHeight = 112;
        const startX = sourceX - cardWidth / 2;
        const startY = sourceY - cardHeight / 2;
        const endX = finalX - cardWidth / 2;
        const endY = finalY - cardHeight / 2;
        
        return (
          <motion.div
            key={cardInfo.id}
            className="flying-card-in-game"
            initial={{
              x: startX,
              y: startY,
              rotate: 0,
              scale: 0.9,
              opacity: 1
            }}
            animate={{
              x: endX,
              y: endY,
              rotate: 0,
              scale: 1,
              opacity: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.8
            }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
              type: 'tween'
            }}
            style={{
              zIndex: 10000 + cardInfo.zIndex
            }}
          >
            <Card code="back" faceUp={false} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default DealAnimation;
