import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Replace this URL with a direct download link to the song
    // (You can upload the song to Imgur or Cloudinary and paste the link here)
    const audio = new Audio('hev.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const resume = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('click', resume);

    return () => {
      document.removeEventListener('click', resume);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const toggle = () => {
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
      onClick={toggle}
      className="fixed bottom-4 left-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-cream-100/90 backdrop-blur-md border border-kraft-300/60 shadow-lg hover:scale-105 transition-all duration-200"
      aria-label="Toggle background music"
      title={isPlaying ? 'Pause music' : 'Play music'}
    >
      {isPlaying ? (
        <Volume2 className="h-5 w-5 text-espresso-800" />
      ) : (
        <VolumeX className="h-5 w-5 text-espresso-500" />
      )}
    </button>
  );
}