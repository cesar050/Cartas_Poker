import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Alert.css';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const Alert = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: <FaCheck />,
    error: <FaTimes />,
    warning: <FaExclamationTriangle />,
    info: <FaInfoCircle />
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`alert alert-${type}`}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <span className="alert-icon">{icons[type]}</span>
          <span className="alert-message">{message}</span>
          {onClose && (
            <button className="alert-close" onClick={onClose} aria-label="Cerrar">
              <FaTimes />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;