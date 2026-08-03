import { Heart, Lock } from 'lucide-react';

export function Footer({ onAdmin }: { onAdmin: () => void }) {
  return (
    <footer className="bg-espresso-900 text-parchment">
      
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Column 1: Brand (FIXED: text is now bright so you can see it) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/mxabywb7/image/upload/v1785448063/cookie-removebg-preview_lxfjmp.png"
              alt="Cookie Icon"
              className="h-12 w-12 object-contain animate-spin-slow hover:animate-spin-fast transition-all duration-300"
            />
            <div>
              <h3 className="font-display text-xl text-mustard-400 font-bold">Crust &amp; Crumb</h3>
              <p className="text-kraft-300 text-xs">Artisan Bakery</p>
            </div>
          </div>
          <p className="text-kraft-300 text-sm leading-relaxed flex items-center gap-1.5">
            chocolate sugary happiness speedrun
          </p>
        </div>

        {/* Column 2: Explore */}
        <div className="space-y-3">
          <h4 className="font-semibold text-mustard-400 uppercase tracking-wider text-sm">Explore</h4>
          <ul className="space-y-2 text-kraft-300 text-sm">
            <li><a href="#menu" className="hover:text-mustard-500 transition-colors">Menu</a></li>
            <li><a href="#reviews" className="hover:text-mustard-500 transition-colors">Reviews</a></li>
            <li><a href="#contact" className="hover:text-mustard-500 transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-mustard-400 uppercase tracking-wider text-sm">Info</h4>
          <ul className="space-y-2 text-kraft-300 text-sm">
            <li>Location: HE Crust and Crumb Stall</li>
            <li>Pickup: 1:30–2:00 PM</li>
            <li>Pickup: 2:30–3:00 PM</li>
          </ul>
        </div>

        {/* Column 4: Manage */}
        <div className="space-y-3">
          <h4 className="font-semibold text-mustard-400 uppercase tracking-wider text-sm">Manage</h4>
          <button 
            onClick={onAdmin} 
            className="inline-flex items-center gap-1.5 text-kraft-300 text-sm hover:text-mustard-500 transition-colors"
          >
            <Lock className="h-3 w-3 text-kraft-400" /> Staff Login
          </button>
        </div>
      </div>

      {/* DASHED SEPARATOR LINE */}
      <div className="w-full h-[1px] bg-[repeating-linear-gradient(90deg,#d4a373_0px,#d4a373_6px,transparent_6px,transparent_12px)] opacity-60" />

      {/* BOTTOM TEXT - FAR LEFT + FAR RIGHT */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center text-sm">
        {/* LEFT SIDE */}
        <div className="text-kraft-300">
          © {new Date().getFullYear()} Crust &amp; Crumb Artisan Bakery. Baked with patience in Calapan City.
        </div>
        
        {/* RIGHT SIDE */}
        <div className="text-kraft-300">
Made with <Heart className="h-3.5 w-3.5 fill-mustard-500 text-mustard-500 inline-block align-middle" /> in Oriental Mindoro
        </div>
      </div>
    </footer>
  );
}