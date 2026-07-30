import { Heart, Lock } from 'lucide-react';
import { StampSeal } from '@/components/Decorations';

export function Footer({ onAdmin }: { onAdmin: () => void }) {
  return (
    <footer className="bg-espresso-900 text-parchment border-t-4 border-mustard-500">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Column 1: Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/mxabywb7/image/upload/v1785448063/cookie-removebg-preview_lxfjmp.png"
              alt="Cookie Icon"
              className="h-12 w-12 object-contain animate-spin-slow hover:animate-spin-fast transition-all duration-300"
            />
            <div>
              <h3 className="font-display text-xl text-parchment font-bold">Crust & Crumb</h3>
              <p className="text-kraft-300 text-xs">Artisan Bakery</p>
            </div>
          </div>
          <p className="text-kraft-300 text-sm leading-relaxed flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 fill-gold-500 text-gold-500" /> at BPP Laboratory
          </p>
        </div>

        {/* Column 2: Explore */}
        <div className="space-y-3">
          <h4 className="font-semibold text-parchment uppercase tracking-wider text-sm">Explore</h4>
          <ul className="space-y-2 text-kraft-300 text-sm">
            <li><a href="#menu" className="hover:text-mustard-500 transition-colors">Menu</a></li>
            <li><a href="#reviews" className="hover:text-mustard-500 transition-colors">Reviews</a></li>
            <li><a href="#contact" className="hover:text-mustard-500 transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-parchment uppercase tracking-wider text-sm">Info</h4>
          <ul className="space-y-2 text-kraft-300 text-sm">
            <li>BPP Laboratory</li>
            <li>Pickup: 1:30–2:00 PM</li>
            <li>Pickup: 2:30–3:00 PM</li>
          </ul>
        </div>

        {/* Column 4: Manage */}
        <div className="space-y-3">
          <h4 className="font-semibold text-parchment uppercase tracking-wider text-sm">Manage</h4>
          <button onClick={onAdmin} className="inline-flex items-center gap-1.5 text-kraft-300 text-sm hover:text-mustard-500 transition-colors">
            <Lock className="h-3 w-3" /> Staff Login
          </button>
        </div>
      </div>

      <div className="border-t border-kraft-700/30 py-6 text-center text-kraft-400 text-sm">
        © {new Date().getFullYear()} Crust & Crumb. Freshly baked daily.
      </div>
    </footer>
  );
}