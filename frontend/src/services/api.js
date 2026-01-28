import axios from 'axios';

const API_URL = 'http://localhost:5000/api/game';

export const gameAPI = {
  createGame: (gameId, gameRules = 'original') => {  // ✨ NUEVO PARÁMETRO
    return axios.post(`${API_URL}/new`, { 
      game_id: gameId,
      game_rules: gameRules  // ✨ ENVIAR REGLAS AL BACKEND
    });
  },

  shuffleDeck: (gameId, cutPoint) => {
    return axios.post(`${API_URL}/shuffle`, {
      game_id: gameId,
      cut_point: cutPoint
    });
  },

  startGame: (gameId) => {
    return axios.post(`${API_URL}/start`, { 
      game_id: gameId 
    });
  },

  flipCard: (gameId, pile) => {
    return axios.post(`${API_URL}/flip-card`, {
      game_id: gameId,
      pile: pile
    });
  },

  placeCard: (gameId, pile) => {
    return axios.post(`${API_URL}/place-card`, {
      game_id: gameId,
      pile: pile
    });
  },

  getGameState: (gameId) => {
    return axios.get(`${API_URL}/state`, {
      params: { game_id: gameId }
    });
  },

  resetGame: (gameId) => {
    return axios.post(`${API_URL}/reset`, { 
      game_id: gameId 
    });
  }
};