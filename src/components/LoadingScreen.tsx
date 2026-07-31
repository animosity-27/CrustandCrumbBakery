import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-cream-100 transition-opacity duration-700 ease-in-out opacity-100">
      {/* Oven glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fcf9f5_0%,_#ede0d4_100%)]" />
      
      {/* Rotating cookie logo */}
      <div className="relative z-10 animate-spin-slow w-32 h-32">
        <img
          src="https://res.cloudinary.com/mxabywb7/image/upload/v1785448063/cookie-removebg-preview_lxfjmp.png"
          alt="Loading"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Warm text with pulse */}
      <div className="relative z-10 mt-6 flex flex-col items-center gap-2">
        <p className="font-display text-xl font-bold text-espresso-800 animate-pulse">
          Baking your experience...
        </p>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}