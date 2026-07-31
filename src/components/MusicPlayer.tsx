import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Create the audio once
    const audio = new Audio('/bg-music.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    // Try to autoplay after user interaction
    const handleInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    };

    document.addEventListener('click', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
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