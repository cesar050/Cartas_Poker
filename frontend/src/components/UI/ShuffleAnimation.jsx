import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../Cards/Card';
import './ShuffleAnimation.css';

const ShuffleAnimation = ({ isShuffling, cutPoint: initialCutPoint, deckBefore, deckAfter, onComplete, playShuffle, onShuffleRequest, autoMode = false }) => {
  const [phase, setPhase] = useState('idle');
  const [displayCards, setDisplayCards] = useState([]);
  const [currentCutPoint, setCurrentCutPoint] = useState(initialCutPoint || 26);
  const [cutPointInput, setCutPointInput] = useState(String(initialCutPoint || 26));
  const [lastShuffledDeck, setLastShuffledDeck] = useState(null);

  const generateInitialDeck = () => {
    const suits = ['S', 'H', 'D', 'C'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'];
    return suits.flatMap(suit => values.map(value => `${value}${suit}`));
  };

  useEffect(() => {
    if (isShuffling && phase === 'idle') {
      let initialDeck;
      if (deckBefore && deckBefore.length > 0) {
        initialDeck = deckBefore;
        if (!lastShuffledDeck || JSON.stringify(deckBefore) !== JSON.stringify(lastShuffledDeck)) {
          setLastShuffledDeck(null);
        }
      } else if (lastShuffledDeck && lastShuffledDeck.length > 0) {
        initialDeck = lastShuffledDeck;
      } else {
        initialDeck = generateInitialDeck();
      }
      
      console.log('🎬 Iniciando animación con deck:', {
        source: deckBefore ? 'deckBefore (backend)' : lastShuffledDeck ? 'lastShuffled' : 'generated',
        first10: initialDeck.slice(0, 10)
      });
      setDisplayCards(initialDeck);
      setPhase('fanSpread');
      setCurrentCutPoint(initialCutPoint || 26);
      setCutPointInput(String(initialCutPoint || 26));
    } else if (!isShuffling) {
      setPhase('idle');
    }
  }, [isShuffling, deckBefore, initialCutPoint, phase, lastShuffledDeck]);

  useEffect(() => {
    if (deckAfter && deckAfter.length > 0) {
      console.log('📥 deckAfter recibido/actualizado:', {
        length: deckAfter.length,
        first10: deckAfter.slice(0, 10),
        currentPhase: phase,
        currentDisplayLength: displayCards.length,
        currentFirst10: displayCards.slice(0, 10)
      });
      
      setLastShuffledDeck(deckAfter);
      
      if (phase === 'finalFan' || phase === 'shuffling') {
        console.log('✅ Actualizando displayCards con deckAfter (resultado barajeado)');
        setDisplayCards(deckAfter);
      }
    }
  }, [deckAfter]);

  useEffect(() => {
    if (phase === 'finalFan' && deckAfter && deckAfter.length > 0) {
      console.log('🎯 [FINALFAN] Forzando uso de deckAfter en abanico final');
      console.log('   Comparación:');
      console.log('   - Actual:', displayCards.slice(0, 10));
      console.log('   - Barajeado:', deckAfter.slice(0, 10));
      
      const isDifferent = JSON.stringify(displayCards) !== JSON.stringify(deckAfter);
      if (isDifferent) {
        console.log('   ✅ Son diferentes - actualizando');
        setDisplayCards(deckAfter);
      } else {
        console.log('   ⚠️ Son iguales - puede que el barajeo no haya funcionado');
      }
    }
  }, [phase, deckAfter]);

  useEffect(() => {
    if (deckAfter && deckAfter.length > 0) {
      console.log('🔄 deckAfter recibido:', {
        length: deckAfter.length,
        first10: deckAfter.slice(0, 10),
        phase: phase
      });
      
      setLastShuffledDeck(deckAfter);
      
      if (phase === 'shuffling' || phase === 'finalFan') {
        console.log('✅ Actualizando displayCards con deckAfter en fase', phase);
        setDisplayCards(deckAfter);
      }
    }
  }, [deckAfter, phase]);

  useEffect(() => {
    if (initialCutPoint) {
      setCurrentCutPoint(initialCutPoint);
      setCutPointInput(String(initialCutPoint));
    }
  }, [initialCutPoint]);

  const handleCutPointChange = (e) => {
    const value = e.target.value;
    setCutPointInput(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 51) {
      setCurrentCutPoint(numValue);
    }
  };

  const handleNextPhase = () => {
    switch (phase) {
      case 'fanSpread':
        setPhase('closing');
        break;
      case 'closing':
        setPhase('cutting');
        break;
      case 'cutting':
        setPhase('shuffling');
        if (deckAfter && deckAfter.length === displayCards.length) {
          console.log('🔄 [CUTTING→SHUFFLING] Actualizando cartas al resultado barajeado');
          console.log('   Antes (primeras 10):', displayCards.slice(0, 10));
          console.log('   Después (primeras 10):', deckAfter.slice(0, 10));
          setDisplayCards(deckAfter);
          setLastShuffledDeck(deckAfter);
        } else {
          console.log('⚠️ [CUTTING] deckAfter no disponible o tamaño incorrecto:', {
            hasDeckAfter: !!deckAfter,
            deckAfterLength: deckAfter?.length,
            displayCardsLength: displayCards.length
          });
        }
        if (playShuffle) playShuffle();
        break;
      case 'shuffling':
        if (deckAfter && deckAfter.length > 0) {
          console.log('✅ [SHUFFLING→FINALFAN] Aplicando resultado barajeado al abanico final');
          console.log('   Orden actual (primeras 10):', displayCards.slice(0, 10));
          console.log('   Orden barajeado (primeras 10):', deckAfter.slice(0, 10));
          setDisplayCards(deckAfter);
          setLastShuffledDeck(deckAfter);
        } else {
          console.log('⚠️ [SHUFFLING→FINALFAN] No hay deckAfter disponible');
        }
        setPhase('finalFan');
        break;
      case 'finalFan':
        setPhase('idle');
        if (onComplete) {
          console.log('✅ [FINALFAN] Finalizando animación de barajeo');
          onComplete();
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!autoMode || !isShuffling || phase === 'idle') return;

    let timeoutId;
    
    switch (phase) {
      case 'fanSpread':
        timeoutId = setTimeout(() => {
          setPhase('closing');
        }, 2000);
        break;
      case 'closing':
        timeoutId = setTimeout(() => {
          setPhase('cutting');
        }, 1500);
        break;
      case 'cutting':
        timeoutId = setTimeout(() => {
          setPhase('shuffling');
          if (deckAfter && deckAfter.length === displayCards.length) {
            setDisplayCards(deckAfter);
            setLastShuffledDeck(deckAfter);
          }
          if (playShuffle) playShuffle();
        }, 2000);
        break;
      case 'shuffling':
        timeoutId = setTimeout(() => {
          if (deckAfter && deckAfter.length > 0) {
            setDisplayCards(deckAfter);
            setLastShuffledDeck(deckAfter);
          }
          setPhase('finalFan');
        }, 2500);
        break;
      case 'finalFan':
        timeoutId = setTimeout(() => {
          setPhase('idle');
          if (onComplete) {
            onComplete();
          }
        }, 2000);
        break;
      default:
        break;
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [phase, autoMode, isShuffling, deckAfter, displayCards.length, playShuffle, onComplete]);

  useEffect(() => {
    if (!autoMode || !isShuffling || phase === 'idle') return;

    let timeoutId;
    
    switch (phase) {
      case 'fanSpread':
        timeoutId = setTimeout(() => {
          setPhase('closing');
        }, 2000);
        break;
      case 'closing':
        timeoutId = setTimeout(() => {
          setPhase('cutting');
        }, 1500);
        break;
      case 'cutting':
        timeoutId = setTimeout(() => {
          setPhase('shuffling');
          if (deckAfter && deckAfter.length === displayCards.length) {
            setDisplayCards(deckAfter);
            setLastShuffledDeck(deckAfter);
          }
          if (playShuffle) playShuffle();
        }, 2000);
        break;
      case 'shuffling':
        timeoutId = setTimeout(() => {
          if (deckAfter && deckAfter.length > 0) {
            setDisplayCards(deckAfter);
            setLastShuffledDeck(deckAfter);
          }
          setPhase('finalFan');
        }, 2500);
        break;
      case 'finalFan':
        timeoutId = setTimeout(() => {
          setPhase('idle');
          if (onComplete) {
            onComplete();
          }
        }, 2000);
        break;
      default:
        break;
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [phase, autoMode, isShuffling, deckAfter, displayCards.length, playShuffle, onComplete]);

  const handleShuffleNow = () => {
    if (onShuffleRequest && currentCutPoint >= 1 && currentCutPoint <= 51) {
      onShuffleRequest(currentCutPoint);
    }
  };

  const handleShuffleAgain = () => {
    const initialDeck = lastShuffledDeck || deckAfter || displayCards;
    if (initialDeck && initialDeck.length > 0) {
      console.log('🔄 [SHUFFLE AGAIN] Reiniciando con último barajeo:', {
        first10: initialDeck.slice(0, 10),
        totalCards: initialDeck.length,
        source: lastShuffledDeck ? 'lastShuffledDeck' : deckAfter ? 'deckAfter' : 'displayCards'
      });
      setDisplayCards(initialDeck);
      setPhase('fanSpread');
      setCurrentCutPoint(26);
      setCutPointInput('26');
    }
  };

  const getFanPosition = (index, total) => {
    const spread = 1200;
    const centerX = 0;
    const angle = (index / (total - 1) - 0.5) * 60;
    const x = centerX + (index / (total - 1) - 0.5) * spread;
    const y = Math.sin((index / (total - 1) - 0.5) * Math.PI) * 50;
    return { x, y, rotation: angle };
  };

  const getStackPosition = (index) => {
    return {
      x: 0,
      y: index * 0.5,
      rotation: 0,
      zIndex: index
    };
  };

  const getCutPosition = (index, total, cutPoint, originalDeck, currentDeck) => {
    if (index < cutPoint) {
      return {
        x: -200,
        y: index * 0.5,
        rotation: -5,
        zIndex: index
      };
    } else {
      return {
        x: 200,
        y: (index - cutPoint) * 0.5,
        rotation: 5,
        zIndex: index
      };
    }
  };

  const getRifflePosition = (index, total, cutPoint, currentDeck, originalDeck) => {
    if (!currentDeck || !originalDeck || currentDeck.length !== originalDeck.length) {
      return {
        x: [index % 2 === 0 ? -200 : 200, 0],
        y: [Math.floor(index / 2) * 0.5, index * 0.5],
        rotation: [index % 2 === 0 ? -5 : 5, 0],
        zIndex: index
      };
    }

    const currentCard = currentDeck[index];
    const cardIndexInOriginal = originalDeck.indexOf(currentCard);
    
    const isFromLeft = cardIndexInOriginal < cutPoint;
    const sourceIndex = isFromLeft ? cardIndexInOriginal : cardIndexInOriginal - cutPoint;
    
    if (isFromLeft) {
      const startX = -200;
      const startY = sourceIndex * 0.5;
      const midX = -80 + (index / total) * 60;
      const midY = -40 + Math.sin(index * 0.15) * 25;
      const endX = 0;
      const endY = index * 0.5;
      return {
        x: [startX, midX, endX],
        y: [startY, midY, endY],
        rotation: [-5, -2, 0],
        zIndex: index
      };
    } else {
      const startX = 200;
      const startY = sourceIndex * 0.5;
      const midX = 80 - (index / total) * 60;
      const midY = -40 + Math.sin(index * 0.15) * 25;
      const endX = 0;
      const endY = index * 0.5;
      return {
        x: [startX, midX, endX],
        y: [startY, midY, endY],
        rotation: [5, 2, 0],
        zIndex: index
      };
    }
  };

  const getCardPosition = (index, total) => {
    const originalDeck = deckBefore || generateInitialDeck();
    
    switch (phase) {
      case 'fanSpread':
        return getFanPosition(index, total);
      case 'closing':
        const fanPos = getFanPosition(index, total);
        const stackPos = getStackPosition(index);
        return {
          x: [fanPos.x, stackPos.x],
          y: [fanPos.y, stackPos.y],
          rotation: [fanPos.rotation, stackPos.rotation],
          zIndex: stackPos.zIndex
        };
      case 'cutting':
        return getCutPosition(index, total, currentCutPoint, originalDeck, displayCards);
      case 'shuffling':
        return getRifflePosition(index, total, currentCutPoint, displayCards, originalDeck);
      case 'finalFan':
        const finalFanPos = getFanPosition(index, total);
        const finalStackPos = getStackPosition(index);
        return {
          x: [finalStackPos.x, finalFanPos.x],
          y: [finalStackPos.y, finalFanPos.y],
          rotation: [finalStackPos.rotation, finalFanPos.rotation],
          zIndex: finalFanPos.zIndex
        };
      default:
        return getStackPosition(index);
    }
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case 'fanSpread':
        return '📖 Abanico inicial - Ver orden';
      case 'closing':
        return '🔄 Cerrando mazo...';
      case 'cutting':
        return '✂️ Corte del mazo';
      case 'shuffling':
        return '🔀 Barajeando...';
      case 'finalFan':
        return '✨ Abanico final - Resultado barajeado';
      default:
        return '';
    }
  };

  const getNextButtonText = () => {
    switch (phase) {
      case 'fanSpread':
        return 'Cerrar abanico';
      case 'closing':
        return 'Mostrar corte';
      case 'cutting':
        return 'Iniciar barajeo';
      case 'shuffling':
        return 'Ver resultado final';
      case 'finalFan':
        return 'Finalizar';
      default:
        return 'Siguiente';
    }
  };

  if (!isShuffling && phase === 'idle') {
    return null;
  }

  return (
    <AnimatePresence>
      {isShuffling && (
        <motion.div
          className="shuffle-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="shuffle-content">
            <motion.h2
              className="shuffle-title"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {getPhaseTitle()}
            </motion.h2>

            {}
            <div className="shuffle-controls-panel">
              {phase === 'fanSpread' && (
                <div className="control-group">
                  <p className="control-hint">Observa el orden inicial de las cartas</p>
                </div>
              )}

              {phase === 'cutting' && (
                <div className="control-group">
                  <label className="control-label">
                    Punto de corte:
                    <input
                      type="number"
                      min="1"
                      max="51"
                      value={cutPointInput}
                      onChange={handleCutPointChange}
                      className="cut-point-input"
                    />
                  </label>
                  <button
                    className="btn-control btn-shuffle-now"
                    onClick={handleShuffleNow}
                    disabled={currentCutPoint < 1 || currentCutPoint > 51}
                  >
                    🔀 Barajear con corte {currentCutPoint}
                  </button>
                </div>
              )}

              {phase === 'shuffling' && (
                <div className="control-group">
                  <p className="control-hint">Observa el barajeo en acción</p>
                </div>
              )}

              {phase === 'finalFan' && (
                <div className="control-group">
                  <p className="control-hint">Compara el orden final con el inicial</p>
                  <div className="final-buttons-group">
                    <button
                      className="btn-control btn-shuffle-again"
                      onClick={handleShuffleAgain}
                    >
                      🔀 Barajear nuevamente
                    </button>
                    <button
                      className="btn-control btn-next"
                      onClick={handleNextPhase}
                    >
                      {getNextButtonText()} →
                    </button>
                  </div>
                </div>
              )}

              {phase !== 'finalFan' && (
                <button
                  className="btn-control btn-next"
                  onClick={handleNextPhase}
                >
                  {getNextButtonText()} →
                </button>
              )}
            </div>

            <div className="cards-animation-container">
              {displayCards && displayCards.length > 0 && displayCards.map((cardCode, index) => {
                const position = getCardPosition(index, displayCards.length);
                const isArray = Array.isArray(position.x);

                return (
                  <motion.div
                    key={`card-${cardCode}-${index}-${phase}-${displayCards.length}`}
                    className="animated-card"
                    style={{
                      position: 'absolute',
                      zIndex: position.zIndex || index
                    }}
                    initial={
                      phase === 'fanSpread'
                        ? { x: 0, y: 0, rotate: 0, opacity: 0 }
                        : undefined
                    }
                    animate={
                      isArray
                        ? {
                            x: position.x,
                            y: position.y,
                            rotate: position.rotation,
                            opacity: 1
                          }
                        : {
                            x: position.x,
                            y: position.y,
                            rotate: position.rotation,
                            opacity: 1
                          }
                    }
                    transition={
                      phase === 'fanSpread'
                        ? {
                            duration: 1.5,
                            delay: index * 0.02,
                            ease: 'easeOut'
                          }
                        : phase === 'closing'
                        ? {
                            duration: 0.8,
                            delay: (displayCards.length - index) * 0.01,
                            ease: 'easeIn'
                          }
                        : phase === 'cutting'
                        ? {
                            duration: 0.5,
                            delay: index * 0.01,
                            ease: 'easeInOut'
                          }
                        : phase === 'shuffling'
                        ? {
                            duration: 1.5,
                            delay: index * 0.02,
                            ease: 'easeInOut'
                          }
                        : phase === 'finalFan'
                        ? {
                            duration: 1.5,
                            delay: index * 0.02,
                            ease: 'easeOut'
                          }
                        : { duration: 0.3 }
                    }
                  >
                    <Card
                      code={phase === 'fanSpread' || phase === 'finalFan' ? cardCode : 'back'}
                      faceUp={phase === 'fanSpread' || phase === 'finalFan'}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShuffleAnimation;
