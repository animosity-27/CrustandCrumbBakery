import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // 1. Create the audio ONCE
    const audio = new Audio('/bg-music.mp3');
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;

    // 2. Add a global click listener that plays the audio ONCE
    const unlockAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        // Do NOT auto-play. We wait for the user to click the button.
        // But we remove this listener so it doesn't keep firing.
      }
      document.removeEventListener('click', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().catch((e) => console.warn('Audio play failed:', e));
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={toggleMusic}
      className="fixed bottom-5 left-5 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-cream-100/90 backdrop-blur-md border border-kraft-300/60 shadow-lg hover:scale-105 transition-all duration-200"
      aria-label="Toggle background music"
    >
      {isPlaying ? (
        <Volume2 className="h-5 w-5 text-espresso-800" />
      ) : (
        <VolumeX className="h-5 w-5 text-espresso-500" />
      )}
    </button>
  );
}