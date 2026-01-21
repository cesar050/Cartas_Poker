import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PredictionResultModal.css';

const PredictionResultModal = ({ isOpen, won, question, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const particles = Array.from({ length: won ? 50 : 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: won ? Math.random() * 100 : 100 + Math.random() * 20,
    delay: Math.random() * 3,
    duration: won ? 3 + Math.random() * 2 : 2 + Math.random() * 2,
    size: won ? 4 + Math.random() * 4 : 3 + Math.random() * 3,
  }));

  const title = won 
    ? 'El Destino Sonrie' 
    : 'El Destino Ha Hablado';

  const destinyAnswer = won
    ? 'Excelente! El universo conspira a tu favor. Tus deseos se manifestaran. Sigue adelante con confianza.'
    : 'El destino dice que aun no es tu momento. No te rindas, vuelve a intentarlo cuando las estrellas se alineen.';

  const buttonText = won
    ? 'Celebrar Victoria'
    : 'Intentar Nuevamente';

  return (
    <AnimatePresence>
      <motion.div
        className="prediction-result-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {}
        <div className="prediction-particles">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className={`prediction-particle ${won ? 'particle-success' : 'particle-failure'}`}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              initial={{ opacity: 0, scale: 0, y: won ? 0 : 100 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
                x: [particle.x + '%', (particle.x + Math.random() * 20 - 10) + '%'],
                y: won 
                  ? [particle.y + '%', (particle.y - 20) + '%']
                  : [particle.y + '%', (particle.y - 10) + '%'],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: won ? 'easeOut' : 'easeIn',
              }}
            />
          ))}
        </div>

        {}
        <motion.div
          className="prediction-result-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {}
          <motion.h1
            className={`prediction-title ${won ? 'title-won' : 'title-lost'}`}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {title}
          </motion.h1>

          {}
          <motion.div
            className={`crystal-ball-result-container ${won ? 'won' : 'lost'}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <motion.div
              className="crystal-ball-result"
              animate={{
                rotate: [0, 360],
                y: [-10, 10, -10],
                scale: [1, 1.02, 1],
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                },
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                scale: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              {}
              <div className="result-glass-layer"></div>
              
              {}
              <div className="result-mist-layer">
                <motion.div
                  className={`result-mist-swirl ${won ? 'mist-success' : 'mist-failure'}`}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    rotate: {
                      duration: 12,
                      repeat: Infinity,
                      ease: 'linear',
                    },
                    scale: {
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                    opacity: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                />
              </div>
              
              {}
              <div className="result-lightning-layer">
                <svg className="result-lightning-svg" viewBox="0 0 300 300">
                  {won ? (
                    <>
                      <motion.path
                        d="M150,50 L140,100 L150,100 L145,150 L155,150 L160,100 L150,100 L150,200"
                        stroke="#4caf50"
                        strokeWidth="3"
                        fill="none"
                        opacity="0"
                        animate={{
                          opacity: [0, 0.9, 0],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: 'easeInOut',
                        }}
                      />
                      <motion.path
                        d="M150,80 L160,130 L150,130 L155,180 L145,180 L140,130 L150,130 L150,220"
                        stroke="#FFD700"
                        strokeWidth="2"
                        fill="none"
                        opacity="0"
                        animate={{
                          opacity: [0, 0.7, 0],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatDelay: 1.5,
                          ease: 'easeInOut',
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <motion.path
                        d="M150,50 L130,120 L145,120 L125,200 L150,150 L140,150 L160,80"
                        stroke="#f44336"
                        strokeWidth="3"
                        fill="none"
                        opacity="0"
                        animate={{
                          opacity: [0, 0.9, 0],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: 'easeInOut',
                        }}
                      />
                      <motion.path
                        d="M150,80 L170,150 L155,150 L175,220 L150,170 L160,170 L140,100"
                        stroke="#5c0a6b"
                        strokeWidth="2"
                        fill="none"
                        opacity="0"
                        animate={{
                          opacity: [0, 0.7, 0],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 1.2,
                          ease: 'easeInOut',
                        }}
                      />
                    </>
                  )}
                </svg>
              </div>
              
              {}
              <div className={`result-highlight ${won ? 'highlight-success' : 'highlight-failure'}`}></div>
              
              {}
              <motion.div
                className={`result-glow ${won ? 'glow-success' : 'glow-failure'}`}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
            
            {}
            <motion.div
              className={`result-shadow ${won ? 'shadow-success' : 'shadow-failure'}`}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {}
          <motion.div
            className={`prediction-message ${won ? 'positive' : 'negative'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="user-question">"{question}"</p>
            <p className="destiny-answer">{destinyAnswer}</p>
          </motion.div>

          {}
          <motion.button
            className={`btn-continue ${won ? 'btn-success' : 'btn-failure'}`}
            onClick={onClose}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {buttonText}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PredictionResultModal;
