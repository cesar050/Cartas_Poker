import { useEffect, useRef } from 'react';

const useCardSounds = () => {
  const shuffleSound = useRef(null);
  const flipSound = useRef(null);
  const placeSound = useRef(null);

  useEffect(() => {
    shuffleSound.current = new Audio('/sounds/shuffle.mp3');
    flipSound.current = new Audio('/sounds/flip.mp3');
    placeSound.current = new Audio('/sounds/place.mp3');

    shuffleSound.current.volume = 0.6;
    flipSound.current.volume = 0.5;
    placeSound.current.volume = 0.5;

    shuffleSound.current.load();
    flipSound.current.load();
    placeSound.current.load();
  }, []);

  const playShuffle = () => {
    if (shuffleSound.current) {
      shuffleSound.current.currentTime = 0;
      shuffleSound.current.play().catch(e => console.log('Audio error:', e));
    }
  };

  const playFlip = () => {
    if (flipSound.current) {
      flipSound.current.currentTime = 0;
      flipSound.current.play().catch(e => console.log('Audio error:', e));
    }
  };

  const playPlace = () => {
    if (placeSound.current) {
      placeSound.current.currentTime = 0;
      placeSound.current.play().catch(e => console.log('Audio error:', e));
    }
  };

  return { playShuffle, playFlip, playPlace };
};

export default useCardSounds;