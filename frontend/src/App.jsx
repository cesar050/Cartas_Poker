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
  const [isFlipping, setIsFlipping] = useState(false);
  const [flippedCard, setFlippedCard] = useState(null);
  const [shuffleData, setShuffleData] = useState(null);
  const [isDealing, setIsDealing] = useState(false);
  const [gameMode, setGameMode] = useState('manual');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [gameRules, setGameRules] = useState('original');  // ✨ NUEVO ESTADO
  const shuffleCompletePromiseRef = useRef(null);
  const shuffleCompleteResolveRef = useRef(null);
  const gameInitializedRef = useRef(false);
  const autoPlayActiveRef = useRef(false);
  
  const { playShuffle, playFlip, playPlace } = useCardSounds();

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
        setGameState(JSON.parse(JSON.stringify(gameStateData)));
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
    setIsLoading(true);
    setPrediction(null);
    setShuffleCount(0);
    setUserMessage('');
    setUnlockedPile(null);
    setShowQuestionModal(false);
    setGameState(null);
    setShuffleData(null);
    setIsShuffling(false);
    autoPlayActiveRef.current = false;
    setIsAutoPlaying(false);
    
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const counter = Math.floor(Math.random() * 1000000);
      const newGameId = `game-${timestamp}-${random}-${counter}`;
      
      console.log('🎮 Creando nuevo juego con ID:', newGameId);
      console.log('📜 Reglas seleccionadas:', gameRules);  // ✨ NUEVO
      
      // ✨ PASAR REGLAS AL CREAR EL JUEGO
      const createResponse = await gameAPI.createGame(newGameId, gameRules);
      
      let newGameState;
      if (createResponse.data.game_state) {
        newGameState = createResponse.data.game_state;
      } else {
        const stateResponse = await gameAPI.getGameState(newGameId);
        newGameState = stateResponse.data.game_state;
      }
      
      setGameId(newGameId);
      setGameState(JSON.parse(JSON.stringify(newGameState)));
      setShuffleCount(newGameState.shuffle_count || 0);
      setUnlockedPile(null);
      
      // ✨ MENSAJE CON NOMBRE DE REGLAS
      const rulesName = gameRules === 'original' ? 'Originales (K Especial)' : 'Alternativas';
      showAlert('success', `✨ Nuevo juego creado! Reglas: ${rulesName}`);
    } catch (error) {
      console.error('❌ Error al crear nuevo juego:', error);
      showAlert('error', '❌ Error al crear juego: ' + error.message);
    }
    setIsLoading(false);
  }, [showAlert, gameRules]);  // ✨ AGREGAR gameRules

  useEffect(() => {
    if (!gameInitializedRef.current) {
      gameInitializedRef.current = true;
      const initializeGame = async () => {
        try {
          console.log('🎮 Inicializando juego por primera vez...');
          const initialGameId = 'game-' + Date.now();
          // ✨ PASAR REGLAS INICIALES
          await gameAPI.createGame(initialGameId, gameRules);
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
  }, [gameRules]);  // ✨ AGREGAR gameRules

  const handleShuffle = async (cutPoint) => {
    try {
      const response = await gameAPI.shuffleDeck(gameId, cutPoint);
      const newShuffleCount = response.data.shuffle_count;
      
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
      
      let gameIdHash = 0;
      for (let j = 0; j < gameId.length; j++) {
        const char = gameId.charCodeAt(j);
        gameIdHash = ((gameIdHash << 5) - gameIdHash) + char;
        gameIdHash = gameIdHash & gameIdHash;
      }
      
      const generateRandom = (seed) => {
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);
        const nextSeed = (a * seed + c) % m;
        const random = nextSeed / m;
        return { seed: nextSeed, random: random };
      };
      
      const cutPoints = [];
      let currentSeed = Math.abs(gameIdHash) || 1;
      
      for (let i = 0; i < numShuffles; i++) {
        const combinedSeed = currentSeed + (i * 1000) + (shuffleCount * 10000);
        const result = generateRandom(combinedSeed);
        currentSeed = result.seed;
        
        const cutPoint = Math.floor(result.random * 51) + 1;
        const finalCutPoint = Math.max(1, Math.min(51, cutPoint));
        cutPoints.push(finalCutPoint);
      }
      
      for (let i = 0; i < numShuffles; i++) {
        const cutPoint = cutPoints[i];
        
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
    await fetchGameState();
  };

  const handleShuffleFromAnimation = async (cutPoint) => {
    try {
      const response = await gameAPI.shuffleDeck(gameId, cutPoint);
      const newShuffleCount = response.data.shuffle_count;
      
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
      const response = await gameAPI.startGame(gameId);
      const newGameState = response.data.game_state;
      
      setGameState(JSON.parse(JSON.stringify(newGameState)));
      setUnlockedPile(newGameState.next_flip_pile || 'K');
      setIsDealing(false);
      setIsLoading(false);
      
      if (gameMode === 'auto') {
        setTimeout(() => {
          if (newGameState?.status === 'playing') {
            console.log('✅ Iniciando juego automático');
            startAutoPlay();
          }
        }, 500);
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
    if (isDealing) return;
    
    try {
      console.log('🔄 FLIP desde', pile);
      
      const response = await gameAPI.flipCard(gameId, pile);
      
      if (response.data.success) {
        setFlippedCard(response.data.card);
        setIsFlipping(true);
        playFlip();
        
        return new Promise((resolve) => {
          setTimeout(async () => {
            setIsFlipping(false);
            setFlippedCard(null);
            
            if (response.data.game_state) {
              setGameState(JSON.parse(JSON.stringify(response.data.game_state)));
            }
            resolve();
          }, 600);
        });
      }
    } catch (error) {
      showAlert('error', 'Error al voltear carta: ' + error.message);
      throw error;
    }
  }, [gameId, showAlert, playFlip, isDealing]);

  const handlePlaceCard = useCallback(async (pile) => {
    if (isDealing) return;
    
    try {
      console.log('📍 PLACE en', pile);
      
      const response = await gameAPI.placeCard(gameId, pile);

      if (!response.data.success) {
        showAlert('error', response.data.message);
        return;
      }

      playPlace();

      if (response.data.game_state) {
        setGameState(JSON.parse(JSON.stringify(response.data.game_state)));
      }

      if (response.data.game_over) {
        console.log('🎮 JUEGO TERMINADO');
        autoPlayActiveRef.current = false;
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
        const nextPile = response.data.next_flip_pile;
        setUnlockedPile(nextPile);
        console.log('✅ Siguiente flip desde:', nextPile);
      }

    } catch (error) {
      console.error('❌ Error al colocar carta:', error);
      if (!isAutoPlaying) {
        showAlert('error', `Error al colocar carta: ${error.message}`);
      }
      throw error;
    }
  }, [gameId, showAlert, userMessage, playPlace, isDealing, isAutoPlaying]);

  const executeAutoMove = useCallback(async () => {
    try {
      const currentState = await fetchGameState(true);
      
      if (!currentState || currentState.status !== 'playing') {
        console.log('🤖 Juego terminado');
        autoPlayActiveRef.current = false;
        setIsAutoPlaying(false);
        return false;
      }

      if (currentState.current_card) {
        const cardValue = currentState.current_card[0];
        console.log('🤖 Colocando', currentState.current_card, 'en', cardValue);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        await handlePlaceCard(cardValue);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        return true;
      } 
      
      const nextPile = currentState.next_flip_pile;
      
      if (!nextPile) {
        console.log('🤖 No hay más cartas para voltear');
        autoPlayActiveRef.current = false;
        setIsAutoPlaying(false);
        return false;
      }

      console.log('🤖 Volteando desde', nextPile);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      await handleFlipCard(nextPile);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return true;

    } catch (error) {
      console.error('🤖 Error:', error);
      autoPlayActiveRef.current = false;
      setIsAutoPlaying(false);
      return false;
    }
  }, [fetchGameState, handleFlipCard, handlePlaceCard]);

  const startAutoPlay = useCallback(async () => {
    if (isAutoPlaying || autoPlayActiveRef.current) {
      console.log('🤖 Ya está en modo automático');
      return;
    }
    
    console.log('🤖 Iniciando modo automático...');
    setIsAutoPlaying(true);
    autoPlayActiveRef.current = true;
    showAlert('success', '🤖 Modo automático activado', 2000);
    
    const autoLoop = async () => {
      if (!autoPlayActiveRef.current) {
        console.log('🤖 Bucle detenido');
        return;
      }
      
      const shouldContinue = await executeAutoMove();
      
      if (shouldContinue && autoPlayActiveRef.current) {
        setTimeout(autoLoop, 300);
      }
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    autoLoop();
  }, [isAutoPlaying, showAlert, executeAutoMove]);

  const stopAutoPlay = useCallback(() => {
    autoPlayActiveRef.current = false;
    setIsAutoPlaying(false);
    showAlert('info', '⏸️ Modo automático detenido', 2000);
  }, [showAlert]);

  const handleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      stopAutoPlay();
      return;
    }

    if (gameState?.status !== 'playing') {
      showAlert('warning', '⚠️ Debes iniciar el juego primero');
      return;
    }

    startAutoPlay();
  }, [gameState?.status, isAutoPlaying, startAutoPlay, stopAutoPlay, showAlert]);

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
              const response = await gameAPI.startGame(gameId);
              const newGameState = response.data.game_state;
              
              setGameState(JSON.parse(JSON.stringify(newGameState)));
              setUnlockedPile(newGameState.next_flip_pile || 'K');
              setIsDealing(false);
              setIsLoading(false);
              
              if (gameMode === 'auto') {
                setTimeout(() => {
                  if (newGameState?.status === 'playing') {
                    startAutoPlay();
                  }
                }, 500);
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
        onRulesChange={setGameRules}  // ✨ NUEVO PROP
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