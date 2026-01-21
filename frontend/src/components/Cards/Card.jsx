import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({ code, faceUp = true, onClick, draggable = false, style = {} }) => {
  const getCardImage = () => {
    if (!faceUp || code === 'back') return '/cards/back.png';
    return `/cards/${code}.png`;
  };

  return (
    <motion.div
      className={`card ${draggable ? 'draggable' : ''}`}
      onClick={onClick}
      style={style}
      whileHover={draggable ? { scale: 1.05, y: -10 } : {}}
      whileTap={draggable ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <img src={getCardImage()} alt={code || 'card'} draggable={false} />
    </motion.div>
  );
};

export default Card;