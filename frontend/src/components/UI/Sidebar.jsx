import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Sidebar.css';
import { FaHourglassHalf, FaGamepad, FaTrophy, FaSkull, FaRobot, FaRandom, FaCrown, FaThLarge, FaChartBar, FaRocket, FaStar, FaBook } from 'react-icons/fa';

const Sidebar = ({ 
  onNewGame, 
  onShuffle, 
  onStartGame, 
  gameState,
  isLoading,
  shuffleCount,
  prediction,
  onAutoPlay,
  isAutoPlaying,
  onAutoShuffle,
  onModeChange,
  onRulesChange  // ✨ NUEVO
}) => {
  const [mode, setMode] = useState('manual');
  const [rules, setRules] = useState('original');  // ✨ NUEVO
  const [autoShuffleCount, setAutoShuffleCount] = useState(3);
  const autoPlayAttemptedRef = useRef(false);

  useEffect(() => {
    if (mode !== 'auto' || gameState?.status !== 'playing' || isAutoPlaying || !onAutoPlay || autoPlayAttemptedRef.current) {
      return;
    }
    
    const hasCards = gameState?.piles && Object.values(gameState.piles).some(pile => Array.isArray(pile) && pile.length > 0);
    const hasFaceDownCards = gameState?.face_down_cards && Object.values(gameState.face_down_cards).some(count => 
      (Array.isArray(count) && count.length > 0) || (typeof count === 'number' && count > 0)
    );
    
    if (hasCards || hasFaceDownCards) {
      console.log('Auto-iniciando modo automático...');
      autoPlayAttemptedRef.current = true;
      onAutoPlay();
    }
  }, [gameState?.status, mode, isAutoPlaying, onAutoPlay]);
  
  useEffect(() => {
    if (gameState?.status !== 'playing') {
      autoPlayAttemptedRef.current = false;
    }
  }, [gameState?.status]);

  const handleShuffle = () => {
    onShuffle(26);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    
    if (onModeChange) {
      onModeChange(newMode);
    }
    
    if (newMode === 'auto' && gameState?.status === 'playing' && !isAutoPlaying && onAutoPlay) {
      onAutoPlay();
    }
  };

  const handleRulesChange = (newRules) => {
    setRules(newRules);
    if (onRulesChange) {
      onRulesChange(newRules);
    }
  };

  const handleAutoShuffle = () => {
    if (onAutoShuffle && autoShuffleCount > 0) {
      onAutoShuffle(autoShuffleCount);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1><FaThLarge className="icon-inline" /> Póker Místico</h1>
        <p>Juego de Cartas</p>
      </div>

      {/* ESTADO DEL JUEGO */}
      {gameState?.status && (
        <div className="sidebar-section">
          <div className={`game-status status-${gameState.status}`}>
            {gameState.status === 'waiting' && <><FaHourglassHalf className="icon-inline" /> Esperando inicio</>}
            {gameState.status === 'playing' && <><FaGamepad className="icon-inline" /> En juego</>}
            {gameState.status === 'won' && <><FaTrophy className="icon-inline" /> Victoria</>}
            {gameState.status === 'lost' && <><FaSkull className="icon-inline" /> Derrota</>}
          </div>
        </div>
      )}

      {/* ✨ SELECTOR DE REGLAS */}
      <div className="sidebar-section">
        <h3><FaBook className="icon-inline" /> Reglas del Juego</h3>
        <div className="rules-selector">
          <button
            className={`rule-btn ${rules === 'original' ? 'active' : ''}`}
            onClick={() => handleRulesChange('original')}
            disabled={gameState?.status === 'playing'}
          >
            <div className="rule-info">
              <div className="rule-title">Originales</div>
              <div className="rule-subtitle">K especial</div>
            </div>
          </button>
          <button
            className={`rule-btn ${rules === 'alternative' ? 'active' : ''}`}
            onClick={() => handleRulesChange('alternative')}
            disabled={gameState?.status === 'playing'}
          >
            <span className="rule-emoji">⚡</span>
            <div className="rule-info">
              <div className="rule-title">Alternativas</div>
              <div className="rule-subtitle">Victoria final</div>
            </div>
          </button>
        </div>
        {gameState?.status === 'playing' && (
          <div className="rules-locked-message">
            ⚠️ No puedes cambiar reglas durante el juego
          </div>
        )}
      </div>

      {/* SELECTOR DE MODO */}
      <div className="sidebar-section">
        <h3>Modo de Juego</h3>
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => handleModeChange('manual')}
          >
            <FaGamepad className="icon-inline" />
            <span>Manual</span>
          </button>
          <button
            className={`mode-btn ${mode === 'auto' ? 'active' : ''}`}
            onClick={() => handleModeChange('auto')}
          >
            <FaRobot className="icon-inline" />
            <span>Auto</span>
          </button>
        </div>
      </div>

      {/* BARAJEAR */}
      <div className="sidebar-section">
        <h3>Barajear</h3>
        <div className="shuffle-controls">
          {mode === 'manual' ? (
            <>
              <button 
                className="btn btn-shuffle"
                onClick={handleShuffle}
                disabled={isLoading || gameState?.status === 'playing'}
              >
                <FaRandom className="icon-inline" /> Ir a barajeo
              </button>
              {shuffleCount > 0 && (
                <button 
                  className="btn btn-shuffle-again"
                  onClick={handleShuffle}
                  disabled={isLoading || gameState?.status === 'playing'}
                >
                  <FaRandom className="icon-inline" /> Barajear nuevamente
                </button>
              )}
            </>
          ) : (
            <>
              <div className="auto-shuffle-controls">
                <label className="auto-shuffle-label">
                  Número de barajeados:
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={autoShuffleCount}
                    onChange={(e) => setAutoShuffleCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="auto-shuffle-input"
                    disabled={isLoading || gameState?.status === 'playing'}
                  />
                </label>
                <button 
                  className="btn btn-shuffle"
                  onClick={handleAutoShuffle}
                  disabled={isLoading || gameState?.status === 'playing'}
                >
                  <FaRandom className="icon-inline" /> Barajear automáticamente
                </button>
              </div>
            </>
          )}
          <div className="shuffle-info">
            Barajeos: <strong>{shuffleCount}</strong>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="sidebar-section">
        <h3>Estadísticas</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FaCrown /></div>
            <div className="stat-data">
              <div className="stat-value">{gameState?.kings_revealed || 0}</div>
              <div className="stat-label">Reyes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaThLarge /></div>
            <div className="stat-data">
              <div className="stat-value">{gameState?.cards_remaining || 52}</div>
              <div className="stat-label">Restantes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaChartBar /></div>
            <div className="stat-data">
              <div className="stat-value">{gameState?.moves_count || 0}</div>
              <div className="stat-label">Movimientos</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaRandom /></div>
            <div className="stat-data">
              <div className="stat-value">{shuffleCount}</div>
              <div className="stat-label">Barajeos</div>
            </div>
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="sidebar-actions">
        {gameState?.status === 'waiting' && shuffleCount > 0 && (
          <motion.button 
            className="btn btn-start"
            onClick={onStartGame}
            disabled={isLoading}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaRocket className="icon-inline" /> Iniciar
          </motion.button>
        )}

        {gameState?.status === 'playing' && mode === 'auto' && (
          <motion.button 
            className={`btn ${isAutoPlaying ? 'btn-stop' : 'btn-auto'}`}
            onClick={onAutoPlay}
            disabled={isLoading}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAutoPlaying ? (
              <><FaRobot className="icon-inline" /> Detener Auto</>
            ) : (
              <><FaRobot className="icon-inline" /> Jugar Automático</>
            )}
          </motion.button>
        )}

        <button 
          className="btn btn-new"
          onClick={onNewGame}
          disabled={isLoading}
        >
          <FaStar className="icon-inline" /> Nuevo Juego
        </button>
      </div>
    </div>
  );
};

export default Sidebar;