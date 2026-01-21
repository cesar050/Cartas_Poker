import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/UI/Sidebar';
import GameBoard from './components/Game/GameBoard';
import Alert from './components/UI/Alert';
import ShuffleAnimation from './components/UI/ShuffleAnimation';
import FlipCardAnimation from './components/UI/FlipCardAnimation';
import QuestionModal from './components/UI/QuestionModal';
import PredictionResultModal from './components/UI/PredictionResultModal';
import useCardSounds from './hooks/useCardSounds';
import { gameAPI } from './services/api';
import './App.css';
import './styles/colors.css';

function App() {
  const [gameId, setGameId] = useState('game-' + Date.now());
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [userMessage, setUserMessage] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showPredictionResult, setShowPredictionResult] = useState(false);
  const [unlockedPile, setUnlockedPile] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flippedCard, setFlippedCard] = useState(null);
  const [shuffleData, setShuffleData] = useState(null);
  const [isDealing, setIsDealing] = useState(false);
  const [gameMode, setGameMode] = useState('manual');
  const shuffleCompletePromiseRef = useRef(null);
  const shuffleCompleteResolveRef = useRef(null);
  const gameInitializedRef = useRef(false);
  const isAutoPlayingRef = useRef(false);
  
  const { playShuffle, playFlip, playPlace } = useCardSounds();
  
  const autoPlayIntervalRef = useRef(null);

  const showAlert = useCallback((type, message, duration = 3000) => {
    setAlert({ type, message });
    if (duration > 0) {
      setTimeout(() => setAlert(null), duration);
    }
  }, []);

  const fetchGameState = useCallback(async (skipUpdate = false, specificGameId = null) => {
    try {
      const idToUse = specificGameId || gameId;
      const response = await gameAPI.getGameState(idToUse);
      const gameStateData = response.data.game_state;
      
      if (!isDealing && !skipUpdate) {
        setGameState(gameStateData);
      }
      
      if (gameStateData?.shuffle_count !== undefined) {
        setShuffleCount(gameStateData.shuffle_count);
      }
      return gameStateData;
    } catch (error) {
      console.error('Error al obtener estado:', error);
      return null;
    }
  }, [gameId, isDealing]);

  const handleNewGame = useCallback(async () => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    setIsAutoPlaying(false);
    isAutoPlayingRef.current = false;
    
    setIsLoading(true);
    setPrediction(null);
    setShuffleCount(0);
    setUserMessage('');
    setUnlockedPile(null);
    setShowQuestionModal(false);
    setGameState(null);
    setShuffleData(null);
    setIsShuffling(false);
    
    try {
      const newGameId = 'game-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      console.log('🎮 Creando nuevo juego con ID:', newGameId);
      console.log('   ID anterior era:', gameId);
      
      const createResponse = await gameAPI.createGame(newGameId);
      
      let newGameState;
      if (createResponse.data.game_state) {
        newGameState = createResponse.data.game_state;
      } else {
        const stateResponse = await gameAPI.getGameState(newGameId);
        newGameState = stateResponse.data.game_state;
      }
      
      const isOrdered = newGameState.shuffle_count === 0 && newGameState.cards_remaining === 52;
      
      console.log('🎮 Estado del nuevo juego:', {
        game_id: newGameId,
        shuffle_count: newGameState.shuffle_count,
        status: newGameState.status,
        cards_remaining: newGameState.cards_remaining,
        es_ordenado: isOrdered
      });
      
      if (!isOrdered) {
        console.error('❌ ERROR: El nuevo juego NO tiene el mazo ordenado!', {
          shuffle_count: newGameState.shuffle_count,
          cards_remaining: newGameState.cards_remaining
        });
      }
      
      setGameId(newGameId);
      setGameState(newGameState);
      setShuffleCount(newGameState.shuffle_count || 0);
      
      showAlert('success', '✨ Nuevo juego creado! Barajea las cartas para comenzar.');
    } catch (error) {
      console.error('❌ Error al crear nuevo juego:', error);
      showAlert('error', '❌ Error al crear juego: ' + error.message);
    }
    setIsLoading(false);
  }, [showAlert]);

  useEffect(() => {
    if (!gameInitializedRef.current) {
      gameInitializedRef.current = true;
      const initializeGame = async () => {
        try {
          console.log('🎮 Inicializando juego por primera vez...');
          const initialGameId = 'game-' + Date.now();
          await gameAPI.createGame(initialGameId);
          setGameId(initialGameId);
          
          const response = await gameAPI.getGameState(initialGameId);
          const gameStateData = response.data.game_state;
          setGameState(gameStateData);
          if (gameStateData?.shuffle_count !== undefined) {
            setShuffleCount(gameStateData.shuffle_count);
          }
        } catch (error) {
          console.error('Error al inicializar juego:', error);
        }
      };
      initializeGame();
    }
  }, []);

  const handleShuffle = async (cutPoint) => {
    try {
      const response = await gameAPI.shuffleDeck(gameId, cutPoint);
      const newShuffleCount = response.data.shuffle_count;
      
      console.log('🔄 [HANDLE SHUFFLE] Actualizando shuffleCount:', newShuffleCount);
      
      setShuffleCount(newShuffleCount);
      
      const deckBefore = response.data.deck_before || null;
      const deckAfter = response.data.deck_after || null;
      
      setShuffleData({ 
        cutPoint, 
        deckBefore, 
        deckAfter
      });
      
      setIsShuffling(true);
      
      showAlert('info', `🔀 Barajeo #${newShuffleCount} en posición ${cutPoint}`);
    } catch (error) {
      showAlert('error', '❌ Error al barajear: ' + error.message);
    }
  };

  const handleAutoShuffle = async (numShuffles) => {
    if (numShuffles < 1 || numShuffles > 10) {
      showAlert('error', '❌ El número de barajeados debe estar entre 1 y 10');
      return;
    }

    setIsLoading(true);
    showAlert('info', `🔀 Barajeando automáticamente ${numShuffles} vez(es)...`);

    try {
      let lastDeckBefore = null;
      
      for (let i = 0; i < numShuffles; i++) {
        const cutPoint = 20 + (i * 7) % 32;
        
        const response = await gameAPI.shuffleDeck(gameId, cutPoint);
        const newShuffleCount = response.data.shuffle_count;
        setShuffleCount(newShuffleCount);
        
        const deckBefore = lastDeckBefore || response.data.deck_before || null;
        const deckAfter = response.data.deck_after || null;
        
        setShuffleData({ 
          cutPoint, 
          deckBefore, 
          deckAfter,
          autoMode: true,
          shuffleIndex: i + 1,
          totalShuffles: numShuffles
        });
        
        setIsShuffling(true);
        
        shuffleCompletePromiseRef.current = new Promise((resolve) => {
          shuffleCompleteResolveRef.current = resolve;
        });
        
        await shuffleCompletePromiseRef.current;
        
        lastDeckBefore = deckAfter;
        
        if (i < numShuffles - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setIsShuffling(false);
      showAlert('success', `✅ ${numShuffles} barajeo(s) completado(s)`);
    } catch (error) {
      showAlert('error', '❌ Error al barajear automáticamente: ' + error.message);
      setIsShuffling(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShuffleComplete = async () => {
    setIsShuffling(false);
    if (shuffleCompleteResolveRef.current) {
      shuffleCompleteResolveRef.current();
      shuffleCompleteResolveRef.current = null;
      shuffleCompletePromiseRef.current = null;
    }
    const updatedState = await fetchGameState();
    console.log('✅ [SHUFFLE COMPLETE] Estado actualizado, shuffle_count:', updatedState?.shuffle_count);
  };

  const handleShuffleFromAnimation = async (cutPoint) => {
    try {
      const response = await gameAPI.shuffleDeck(gameId, cutPoint);
      const newShuffleCount = response.data.shuffle_count;
      
      console.log('🔄 [SHUFFLE FROM ANIMATION] Barajeo #' + newShuffleCount);
      console.log('   Deck antes (primeras 10):', response.data.deck_before?.slice(0, 10));
      console.log('   Deck después (primeras 10):', response.data.deck_after?.slice(0, 10));
      
      setShuffleCount(newShuffleCount);
      
      setShuffleData(prev => ({
        cutPoint,
        deckBefore: response.data.deck_before || prev?.deckAfter || null,
        deckAfter: response.data.deck_after || null
      }));
      
      showAlert('info', `🔀 Barajeo #${newShuffleCount} en posición ${cutPoint}`);
    } catch (error) {
      showAlert('error', '❌ Error al barajear: ' + error.message);
    }
  };

  const handleStartGame = async () => {
    if (shuffleCount === 0) {
      showAlert('warning', '⚠️ Debes barajear las cartas primero');
      return;
    }

    setShowQuestionModal(true);
  };

  const handleQuestionSubmit = async (question) => {
    console.log('📝 Pregunta guardada:', question);
    setUserMessage(question);
    setShowQuestionModal(false);
    
    setIsLoading(true);
    try {
      if (gameMode === 'auto') {
        console.log('🤖 Modo automático: validando que los lugares estén vacíos...');
        
        const currentState = await fetchGameState(true);
        
        if (currentState?.status !== 'waiting') {
          showAlert('error', '❌ Error: El juego ya está iniciado. Por favor, inicia un nuevo juego.');
          setIsLoading(false);
          return;
        }
        
        const piles = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'];
        let hasCards = false;
        for (const pile of piles) {
          const faceDownCount = currentState?.face_down_cards?.[pile] || 0;
          const faceUpCount = Array.isArray(currentState?.piles?.[pile]) ? currentState.piles[pile].length : 0;
          if (faceDownCount > 0 || faceUpCount > 0) {
            hasCards = true;
            console.warn(`⚠️ Pila ${pile} no está vacía: ${faceDownCount} abajo, ${faceUpCount} arriba`);
          }
        }
        
        if (hasCards) {
          showAlert('error', '❌ Error: Las pilas no están vacías. Por favor, inicia un nuevo juego.');
          setIsLoading(false);
          return;
        }
        
        console.log('✅ Validación exitosa: Todas las pilas están vacías, procediendo con el reparto...');
      }
      
      const response = await gameAPI.startGame(gameId);
      const newGameState = response.data.game_state;
      
      console.log(`🎮 Modo ${gameMode}: mostrando cartas directamente`);
      console.log('📊 Estado inicial del juego:', {
        status: newGameState.status,
        faceDownCards: newGameState.face_down_cards,
        piles: Object.entries(newGameState.piles || {}).map(([p, cards]) => ({
          pile: p,
          cards: Array.isArray(cards) ? cards.length : 0,
          faceDown: newGameState.face_down_cards?.[p] || 0
        }))
      });
      setGameState(JSON.parse(JSON.stringify(newGameState)));
      setUnlockedPile('K');
      setIsDealing(false);
      setIsLoading(false);
      
      if (gameMode === 'auto') {
        console.log('🤖 Modo automático: validando que todas las pilas tengan 4 cartas...');
        
        const piles = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'];
        let allComplete = true;
        const pileStatus = {};
        
        for (const pile of piles) {
          const faceDownCount = newGameState?.face_down_cards?.[pile] || 0;
          const faceUpCount = Array.isArray(newGameState?.piles?.[pile]) ? newGameState.piles[pile].length : 0;
          const totalCount = faceDownCount + faceUpCount;
          
          pileStatus[pile] = { total: totalCount, faceUp: faceUpCount, faceDown: faceDownCount };
          
          if (totalCount !== 4) {
            allComplete = false;
            console.error(`❌ Pile ${pile} NO tiene 4 cartas (tiene ${totalCount})`);
          }
        }
        
        if (allComplete) {
          console.log('✅ VALIDACIÓN EXITOSA: Todas las pilas tienen 4 cartas');
          console.log('   Estado de todas las pilas:', pileStatus);
          
          setTimeout(() => {
            if (newGameState?.status === 'playing') {
              console.log('✅ Estado confirmado como "playing", iniciando juego automático');
              startAutoPlay();
            } else {
              console.error('❌ El juego no está en estado "playing", estado:', newGameState?.status);
              showAlert('error', '❌ Error: El juego no está en estado "playing"');
            }
          }, 500);
        } else {
          console.error('❌ VALIDACIÓN FALLIDA: No todas las pilas tienen 4 cartas');
          console.error('   Estado de las pilas:', pileStatus);
          showAlert('error', '❌ Error: No todas las pilas tienen 4 cartas. El juego automático no puede iniciar.');
        }
      } else {
        showAlert('success', '🚀 ¡Juego iniciado!', 2000);
      }
      
    } catch (error) {
      showAlert('error', '❌ Error al iniciar: ' + error.message);
      setIsLoading(false);
      setIsDealing(false);
    }
  };

  const handleFlipCard = useCallback(async (pile) => {
    if (isDealing) {
      console.warn('⚠️ No se puede voltear cartas durante el reparto');
      return;
    }
    
    try {
      const response = await gameAPI.flipCard(gameId, pile);
      
      if (response.data.success) {
        setFlippedCard(response.data.card);
        setIsFlipping(true);
        
        playFlip();
        
        return new Promise((resolve) => {
          setTimeout(async () => {
            setIsFlipping(false);
            setFlippedCard(null);
            
            if (!isDealing) {
              await new Promise(resolve => setTimeout(resolve, 100));
              
              const updatedState = await fetchGameState(false);
              if (updatedState) {
                console.log('🔄 Estado actualizado después de voltear carta de', pile, ':', {
                  currentCard: updatedState.current_card,
                  faceDownCount: updatedState.face_down_cards?.[pile] || 0,
                  pileCards: updatedState.piles?.[pile] || [],
                  status: updatedState.status
                });
                setGameState(JSON.parse(JSON.stringify(updatedState)));
              } else if (response.data.game_state) {
                const newGameState = response.data.game_state;
                console.log('🔄 Usando estado de la respuesta (fallback):', {
                  currentCard: newGameState.current_card,
                  faceDownCount: newGameState.face_down_cards?.[pile] || 0
                });
                setGameState(JSON.parse(JSON.stringify(newGameState)));
              }
            }
            resolve();
          }, 600);
        });
      }
    } catch (error) {
      showAlert('error', 'Error al voltear carta: ' + error.message);
      throw error;
    }
  }, [gameId, fetchGameState, showAlert, playFlip, isDealing]);





  const handlePlaceCard = useCallback(async (pile) => {
    if (isDealing) {
      console.warn('⚠️ No se puede colocar cartas durante el reparto');
      return;
    }
    
    try {
      const response = await gameAPI.placeCard(gameId, pile);

      if (!response.data.success) {
        showAlert('error', response.data.message);
        return;
      }

      playPlace();

      if (!isDealing) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updatedState = await fetchGameState(false);
        if (updatedState) {
          console.log('📍 Estado actualizado después de colocar carta en', pile, ':', {
            pile: updatedState.piles?.[pile] || [],
            count: Array.isArray(updatedState.piles?.[pile]) ? updatedState.piles[pile].length : 0,
            faceDownCount: updatedState.face_down_cards?.[pile] || 0,
            currentCard: updatedState.current_card,
            status: updatedState.status,
            allPiles: Object.entries(updatedState.piles || {}).map(([p, cards]) => ({
              pile: p,
              count: Array.isArray(cards) ? cards.length : 0,
              faceDown: updatedState.face_down_cards?.[p] || 0,
              cards: Array.isArray(cards) ? cards : []
            }))
          });
          setGameState(JSON.parse(JSON.stringify(updatedState)));
        } else if (response.data.game_state) {
          const newGameState = response.data.game_state;
          console.log('📍 Usando estado de la respuesta (fallback):', {
            pile: newGameState.piles?.[pile] || [],
            count: newGameState.piles?.[pile]?.length || 0,
            faceDownCount: newGameState.face_down_cards?.[pile] || 0
          });
          setGameState(JSON.parse(JSON.stringify(newGameState)));
        }
      }

      if (response.data.game_over) {
        console.log('🎮 JUEGO TERMINADO', response.data);

        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
          autoPlayIntervalRef.current = null;
        }
        setIsAutoPlaying(false);

        showAlert(response.data.won ? 'success' : 'error', response.data.message, 2000);
        setUnlockedPile(null);

        if (userMessage && userMessage.trim() !== '') {
          setTimeout(() => {
            setShowPredictionResult(true);
            setPrediction({
              won: response.data.won,
              message: userMessage
            });
          }, 1000);
        }
      } else {
        setUnlockedPile(pile);
        console.log('🔓 Pila desbloqueada:', pile, '- Todas las demás están bloqueadas');
      }

    } catch (error) {
      console.error('❌ Error al colocar carta:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
      console.error('   Detalles del error:', {
        status: error.response?.status,
        error: errorMessage,
        pile: pile
      });
      
      try {
        const updatedState = await fetchGameState(false);
        if (updatedState) {
          console.log('   Estado actualizado después del error:', {
            status: updatedState.status,
            currentCard: updatedState.current_card,
            gameOver: updatedState.status !== 'playing'
          });
          
          if (updatedState.status !== 'playing') {
            setGameState(updatedState);
            return;
          }
        }
      } catch (fetchError) {
        console.error('   Error al obtener estado actualizado:', fetchError);
      }
      
      if (!isAutoPlaying) {
        showAlert('error', `Error al colocar carta: ${errorMessage}`);
      }
      
      throw error;
    }
  }, [gameId, fetchGameState, showAlert, userMessage, playPlace, isDealing, isAutoPlaying]);

  const autoPlayMove = useCallback(async () => {
    try {
      const currentState = await fetchGameState(false);
      
      if (!currentState) {
        console.error('🤖 AUTO: No se pudo obtener el estado del juego');
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
          autoPlayIntervalRef.current = null;
        }
        setIsAutoPlaying(false);
        return;
      }

      if (currentState.status !== 'playing') {
        console.log('🤖 AUTO: El juego terminó. Estado:', currentState.status);
        setGameState(currentState);
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
          autoPlayIntervalRef.current = null;
        }
        setIsAutoPlaying(false);
        return;
      }

      if (currentState.current_card) {
        const cardValue = currentState.current_card[0];
        console.log('🤖 AUTO: Colocando carta', currentState.current_card, 'automáticamente en', cardValue);
        
        const latestState = await fetchGameState(false);
        if (!latestState) {
          console.warn('🤖 AUTO: No se pudo obtener el estado, esperando siguiente movimiento...');
          return;
        }
        
        if (latestState.status !== 'playing') {
          console.log('🤖 AUTO: El juego terminó. Estado:', latestState.status);
          setGameState(latestState);
          if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
          }
          setIsAutoPlaying(false);
          return;
        }
        
        if (!latestState.current_card) {
          console.warn('🤖 AUTO: No hay carta actual, esperando siguiente movimiento...');
          setGameState(latestState);
          return;
        }
        
        const latestCardValue = latestState.current_card[0];
        if (latestCardValue !== cardValue) {
          console.warn('🤖 AUTO: La carta cambió. Era', currentState.current_card, 'ahora es', latestState.current_card);
          setGameState(latestState);
          return;
        }
        
        setGameState(latestState);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
          await handlePlaceCard(cardValue);
          
          await new Promise(resolve => setTimeout(resolve, 200));
          const finalState = await fetchGameState(false);
          if (finalState) {
            setGameState(JSON.parse(JSON.stringify(finalState)));
          }
        } catch (error) {
          console.error('🤖 AUTO: Error al colocar carta:', error);
          const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
          console.error('   Detalles:', {
            status: error.response?.status,
            error: errorMessage,
            card: latestState.current_card,
            targetPile: cardValue
          });
          
          if (errorMessage.includes('No hay carta actual')) {
            console.log('🤖 AUTO: La carta ya fue colocada o cambió, continuando...');
            const updatedState = await fetchGameState(false);
            if (updatedState) {
              setGameState(JSON.parse(JSON.stringify(updatedState)));
            }
            isAutoPlayingRef.current = false;
            return;
          }
          
          const updatedState = await fetchGameState(false);
          if (updatedState) {
            setGameState(JSON.parse(JSON.stringify(updatedState)));
            if (updatedState.status !== 'playing') {
              if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
                autoPlayIntervalRef.current = null;
              }
              setIsAutoPlaying(false);
              isAutoPlayingRef.current = false;
              return;
            }
          }
          isAutoPlayingRef.current = false;
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }

      const piles = ['K', 'Q', 'J', '0', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
      let pileToFlip = unlockedPile || 'K';
      
      const faceDownCount = currentState.face_down_cards?.[pileToFlip] || 0;
      
      if (faceDownCount === 0) {
        let nextPile = null;
        for (const p of piles) {
          const count = currentState.face_down_cards?.[p] || 0;
          if (count > 0) {
            nextPile = p;
            break;
          }
        }
        
        if (!nextPile) {
          console.log('🤖 AUTO: No hay más cartas boca abajo');
          isAutoPlayingRef.current = false;
          if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
          }
          setIsAutoPlaying(false);
          return;
        }
        
        setUnlockedPile(nextPile);
        pileToFlip = nextPile;
      }
      
      const targetPile = pileToFlip;
      
      console.log('🤖 AUTO: Volteando carta de', targetPile);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        await handleFlipCard(targetPile);
        await new Promise(resolve => setTimeout(resolve, 1500));
        isAutoPlayingRef.current = false;
        return;
      } catch (error) {
        console.error('🤖 AUTO: Error al voltear carta:', error);
        const errorState = await fetchGameState(false);
        if (errorState) {
          setGameState(JSON.parse(JSON.stringify(errorState)));
          if (errorState.status !== 'playing') {
            if (autoPlayIntervalRef.current) {
              clearInterval(autoPlayIntervalRef.current);
              autoPlayIntervalRef.current = null;
            }
            setIsAutoPlaying(false);
            isAutoPlayingRef.current = false;
            return;
          }
        }
        isAutoPlayingRef.current = false;
        return;
      }

    } catch (error) {
      console.error('🤖 AUTO: Error general', error);
      isAutoPlayingRef.current = false;
      const errorState = await fetchGameState(false);
      if (errorState) {
        setGameState(JSON.parse(JSON.stringify(errorState)));
        if (errorState.status !== 'playing') {
          if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
          }
          setIsAutoPlaying(false);
        }
      }
    }
  }, [fetchGameState, handleFlipCard, handlePlaceCard, unlockedPile]);

  const startAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      console.log('⚠️ El juego automático ya está activo');
      return;
    }
    
    setIsAutoPlaying(true);
    showAlert('success', '🤖 Modo automático activado', 2000);
    
    setTimeout(() => {
      autoPlayMove();
    }, 3000);
    
    autoPlayIntervalRef.current = setInterval(() => {
      autoPlayMove();
    }, 4500);
  }, [autoPlayMove, showAlert, isAutoPlaying]);

  const handleAutoPlay = useCallback(() => {
    const currentStatus = gameState?.status;
    if (currentStatus !== 'playing') {
      fetchGameState().then((updatedState) => {
        if (updatedState?.status !== 'playing') {
          showAlert('warning', '⚠️ Debes iniciar el juego primero');
          return;
        }
        startAutoPlay();
      });
      return;
    }

    if (isAutoPlaying) {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      setIsAutoPlaying(false);
      showAlert('info', '⏸️ Modo automático detenido');
    } else {
      startAutoPlay();
    }
  }, [gameState?.status, isAutoPlaying, startAutoPlay, showAlert, fetchGameState]);

  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="App">
      <ShuffleAnimation 
        key={`shuffle-${gameId}-${shuffleCount}`}
        isShuffling={isShuffling}
        cutPoint={shuffleData?.cutPoint}
        deckBefore={shuffleData?.deckBefore}
        deckAfter={shuffleData?.deckAfter}
        onComplete={handleShuffleComplete}
        playShuffle={playShuffle}
        onShuffleRequest={handleShuffleFromAnimation}
        autoMode={shuffleData?.autoMode || false}
      />
      <FlipCardAnimation isFlipping={isFlipping} card={flippedCard} />
      
      {showQuestionModal && (
        <QuestionModal 
          isOpen={showQuestionModal}
          onSubmit={handleQuestionSubmit}
          onClose={() => setShowQuestionModal(false)}
          onSkip={async () => {
            setUserMessage('');
            setShowQuestionModal(false);
            setIsLoading(true);
            try {
              if (gameMode === 'auto') {
                console.log('🤖 Modo automático: validando que los lugares estén vacíos...');
                
                const currentState = await fetchGameState(true);
                
                if (currentState?.status !== 'waiting') {
                  showAlert('error', '❌ Error: El juego ya está iniciado. Por favor, inicia un nuevo juego.');
                  setIsLoading(false);
                  return;
                }
                
                const piles = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'];
                let hasCards = false;
                for (const pile of piles) {
                  const faceDownCount = currentState?.face_down_cards?.[pile] || 0;
                  const faceUpCount = Array.isArray(currentState?.piles?.[pile]) ? currentState.piles[pile].length : 0;
                  if (faceDownCount > 0 || faceUpCount > 0) {
                    hasCards = true;
                    console.warn(`⚠️ Pila ${pile} no está vacía: ${faceDownCount} abajo, ${faceUpCount} arriba`);
                  }
                }
                
                if (hasCards) {
                  showAlert('error', '❌ Error: Las pilas no están vacías. Por favor, inicia un nuevo juego.');
                  setIsLoading(false);
                  return;
                }
                
                console.log('✅ Validación exitosa: Todas las pilas están vacías, procediendo con el reparto...');
              }
              
              const response = await gameAPI.startGame(gameId);
              const newGameState = response.data.game_state;
              
              console.log(`🎮 Modo ${gameMode}: mostrando cartas directamente`);
              console.log('📊 Estado inicial del juego:', {
                status: newGameState.status,
                faceDownCards: newGameState.face_down_cards,
                piles: Object.entries(newGameState.piles || {}).map(([p, cards]) => ({
                  pile: p,
                  cards: Array.isArray(cards) ? cards.length : 0,
                  faceDown: newGameState.face_down_cards?.[p] || 0
                }))
              });
              setGameState(JSON.parse(JSON.stringify(newGameState)));
              setUnlockedPile('K');
              setIsDealing(false);
              setIsLoading(false);
              
              if (gameMode === 'auto') {
                console.log('🤖 Modo automático: validando que todas las pilas tengan 4 cartas...');
                
                const piles = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'];
                let allComplete = true;
                const pileStatus = {};
                
                for (const pile of piles) {
                  const faceDownCount = newGameState?.face_down_cards?.[pile] || 0;
                  const faceUpCount = Array.isArray(newGameState?.piles?.[pile]) ? newGameState.piles[pile].length : 0;
                  const totalCount = faceDownCount + faceUpCount;
                  
                  pileStatus[pile] = { total: totalCount, faceUp: faceUpCount, faceDown: faceDownCount };
                  
                  if (totalCount !== 4) {
                    allComplete = false;
                    console.error(`❌ Pile ${pile} NO tiene 4 cartas (tiene ${totalCount})`);
                  }
                }
                
                if (allComplete) {
                  console.log('✅ VALIDACIÓN EXITOSA: Todas las pilas tienen 4 cartas');
                  console.log('   Estado de todas las pilas:', pileStatus);
                  
                  setTimeout(() => {
                    if (newGameState?.status === 'playing') {
                      console.log('✅ Estado confirmado como "playing", iniciando juego automático');
                      startAutoPlay();
                    } else {
                      console.error('❌ El juego no está en estado "playing", estado:', newGameState?.status);
                      showAlert('error', '❌ Error: El juego no está en estado "playing"');
                    }
                  }, 500);
                } else {
                  console.error('❌ VALIDACIÓN FALLIDA: No todas las pilas tienen 4 cartas');
                  console.error('   Estado de las pilas:', pileStatus);
                  showAlert('error', '❌ Error: No todas las pilas tienen 4 cartas. El juego automático no puede iniciar.');
                }
              } else {
                showAlert('success', '🚀 ¡Juego iniciado!', 2000);
              }
              
            } catch (error) {
              showAlert('error', '❌ Error al iniciar: ' + error.message);
              setIsLoading(false);
              setIsDealing(false);
            }
          }}
        />
      )}
      
      <Sidebar
        onNewGame={handleNewGame}
        onShuffle={handleShuffle}
        onStartGame={handleStartGame}
        gameState={gameState}
        isLoading={isLoading}
        shuffleCount={shuffleCount}
        prediction={prediction}
        onAutoPlay={handleAutoPlay}
        isAutoPlaying={isAutoPlaying}
        onAutoShuffle={handleAutoShuffle}
        onModeChange={setGameMode}
      />

      <div className="game-area">
        <AnimatePresence>
          {alert && (
            <div className="alert-container">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {gameState ? (
          <GameBoard
            gameState={gameState}
            onFlipCard={handleFlipCard}
            onPlaceCard={handlePlaceCard}
            currentCard={gameState.current_card}
            unlockedPile={unlockedPile}
            isDealing={isDealing}
            onDealComplete={() => {
              setIsDealing(false);
            }}
          />
        ) : (
          <div className="game-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              🃏
            </motion.div>
            <p>Cargando juego...</p>
          </div>
        )}

        {isAutoPlaying && (
          <motion.div
            className="auto-play-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <span className="auto-play-pulse">🤖</span>
            <span>Jugando automáticamente...</span>
          </motion.div>
        )}

        {}
        {showPredictionResult && prediction && (
          <PredictionResultModal
            isOpen={showPredictionResult}
            won={prediction.won}
            question={userMessage}
            onClose={() => {
              setShowPredictionResult(false);
              setPrediction(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;