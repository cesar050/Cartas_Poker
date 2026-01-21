import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './QuestionModal.css';

const QuestionModal = ({ isOpen, onSubmit, onClose, onSkip }) => {
  const [question, setQuestion] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim().length >= 10) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onClose();
    }
    setQuestion('');
  };

  const isValid = question.trim().length >= 10;

  if (!isOpen) return null;

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
  }));

  return (
    <AnimatePresence>
      <motion.div
        className="mystic-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {}
        <div className="mystic-particles">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="mystic-particle"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                x: [particle.x + '%', (particle.x + Math.random() * 20 - 10) + '%'],
                y: [particle.y + '%', (particle.y + Math.random() * 20 - 10) + '%'],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {}
        <div className="mystic-modal-container">
          {}
          <motion.h1
            className="mystic-title"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.span
              animate={{
                textShadow: [
                  '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700',
                  '0 0 20px #FFD700, 0 0 30px #FFD700, 0 0 40px #FFD700',
                  '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Pregúntame... Pregúntame...
            </motion.span>
          </motion.h1>

          {}
          <motion.div
            className="crystal-ball-wrapper"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {}
            <div className="crystal-stand"></div>
            
            {}
            <div className="crystal-ball-outer">
              
              {}
              <div className="glass-shine"></div>
              
              {}
              <div className="glass-sphere">
                
                {}
                <div className="mist-container">
                  <div className="mist-cloud mist-1"></div>
                  <div className="mist-cloud mist-2"></div>
                  <div className="mist-cloud mist-3"></div>
                </div>
                
                {}
                <svg className="lightning-svg" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#FFA500" stopOpacity="0.5"/>
                    </linearGradient>
                  </defs>
                  
                  {}
                  <path 
                    className="lightning-bolt lightning-1"
                    d="M100,40 L85,100 L95,100 L80,160" 
                    stroke="url(#lightningGradient)" 
                    strokeWidth="2" 
                    fill="none"
                  />
                  
                  {}
                  <path 
                    className="lightning-bolt lightning-2"
                    d="M100,40 L115,100 L105,100 L120,160" 
                    stroke="url(#lightningGradient)" 
                    strokeWidth="2" 
                    fill="none"
                  />
                </svg>
                
                {}
                <div className="particles">
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                </div>
                
              </div>
              
              {}
              <div className="crystal-shadow"></div>
              
            </div>
          </motion.div>

          {}
          <motion.div
            className="mystic-input-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Escribe tu pregunta al destino..."
              className="mystic-textarea"
              rows={4}
              maxLength={200}
            />
            <div className="mystic-char-count">
              {question.length}/200 {!isValid && question.length > 0 && (
                <span className="mystic-char-warning">(mínimo 10 caracteres)</span>
              )}
            </div>
          </motion.div>

          {}
          <motion.div
            className="mystic-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <motion.button
              type="button"
              onClick={handleSkip}
              className="mystic-btn mystic-btn-secondary"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              Jugar sin Pregunta
            </motion.button>

            <motion.button
              type="submit"
              onClick={handleSubmit}
              className="mystic-btn mystic-btn-primary"
              disabled={!isValid}
              whileHover={isValid ? { scale: 1.05, boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)' } : {}}
              whileTap={isValid ? { scale: 0.95 } : {}}
              animate={isValid ? {
                boxShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.4)',
                  '0 0 30px rgba(255, 215, 0, 0.6)',
                  '0 0 20px rgba(255, 215, 0, 0.4)',
                ],
              } : {}}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              <span className="mystic-btn-icon">🎴</span>
              Hacer Pregunta y Jugar
            </motion.button>
          </motion.div>

          {}
          <motion.p
            className="mystic-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            💡 Haz una pregunta y el destino te responderá al final de la partida
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionModal;
