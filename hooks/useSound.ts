import { useCallback, useState } from 'react';

export const useSound = (url: string) => {
  // Creating audio element once and reusing it.
  const [audio] = useState(() => new Audio(url));

  const play = useCallback(() => {
    // Setting currentTime to 0 allows the sound to be replayed even if it's already playing.
    audio.currentTime = 0;
    // The play() method returns a Promise which can be used to catch errors.
    audio.play().catch(e => console.error("Error playing sound. This can happen if the user hasn't interacted with the page yet.", e));
  }, [audio]);

  return play;
};
