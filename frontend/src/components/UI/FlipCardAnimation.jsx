import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../Cards/Card';
import './FlipCardAnimation.css';

const FlipCardAnimation = ({ isFlipping, card }) => {
  return (
    <AnimatePresence>
      {isFlipping && card && (
        <motion.div
          className="flip-card-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flip-card-container"
            initial={{ 
              scale: 0.8,
              rotateY: 0,
              opacity: 0
            }}
            animate={{ 
              scale: 1.2,
              rotateY: 180,
              opacity: 1
            }}
            exit={{ 
              scale: 0.8,
              rotateY: 180,
              opacity: 0
            }}
            transition={{ 
              duration: 0.6,
              ease: "easeInOut"
            }}
          >
            {}
            <motion.div 
              className="flip-card-face flip-card-back"
              style={{ rotateY: 0 }}
            >
              <Card code="back" faceUp={false} />
            </motion.div>

            {}
            <motion.div 
              className="flip-card-face flip-card-front"
              style={{ rotateY: 180 }}
            >
              <Card code={card} faceUp={true} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlipCardAnimation;