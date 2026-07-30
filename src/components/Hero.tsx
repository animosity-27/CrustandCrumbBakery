import { ArrowRight, ChevronDown, Croissant } from 'lucide-react';
import { ScoreSlash } from '@/components/Decorations';

const HERO_IMG =
  'https://images.pexels.com/photos/14841924/pexels-photo-14841924.jpeg?auto=compress&cs=tinysrgb&w=1920';

type HeroProps = {
  onOrder: () => void;
};

export function Hero({ onOrder }: HeroProps) {
  return (
    <section id="home" className="relative bg-cream-100">
      <div className="relative h-[88vh] min-h-[580px] w-full overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Cream cheese garlic brioche fresh from the oven"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        {/* oven-warm ambient glow pulsing over the bake */}
        <div className="oven-glow pointer-events-none absolute inset-0" />
        {/* steam wisps rising */}
        <div className="pointer-events-none absolute left-1/2 top-[18%] z-20 h-24 w-40 -translate-x-1/2">
          <span className="steam" />
          <span className="steam" />
          <span className="steam" />
          <span className="steam" />
          <span className="steam" />
        </div>

        {/* top scallop + bottom fade */}
        <div className="scallop-top pointer-events-none absolute inset-x-0 top-0 z-20 h-[26px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-cream-100 via-cream-100/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3 bg-[radial-gradient(ellipse_at_50%_100%,rgba(249,246,241,0.6),transparent_70%)]" />

        <div className="absolute inset-x-0 bottom-0 z-30 flex translate-y-[-6%] flex-col items-center px-6 text-center">
          <p className="dough-rise mb-4 inline-flex items-center gap-2 bg-sage-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-sage-700 backdrop-blur-sm">
            <ScoreSlash className="h-3.5 w-3.5 text-mustard-600" />
            Crust &amp; Crumb Artisan Bakery
            <ScoreSlash className="h-3.5 w-3.5 text-mustard-600" />
          </p>
          <h1 className="dough-rise font-display max-w-4xl text-4xl font-black leading-[1.05] text-espresso-800 drop-shadow-[0_2px_18px_rgba(249,246,241,0.65)] sm:text-5xl md:text-6xl lg:text-7xl" style={{ animationDelay: '120ms' }}>
            Freshly Baked.
            <br />
            Made with Love.
          </h1>

          {/* scoring slash divider */}
          <div className="dough-rise mt-6 h-3 w-40 opacity-70" style={{ animationDelay: '220ms', backgroundImage: 'repeating-linear-gradient(-58deg, transparent 0 9px, #8d9c7c 9px 11px, transparent 11px 22px)' }} />

          <div className="dough-rise mt-7 flex flex-col items-center gap-3 sm:flex-row" style={{ animationDelay: '320ms' }}>
            <button type="button" onClick={onOrder} className="cc-tag group inline-flex items-center gap-2 bg-sage-500 px-8 py-4 text-base font-extrabold text-white">
              Order Now
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
            <a href="#menu" className="cc-notch inline-flex items-center gap-2 border-2 border-espresso-800/20 bg-cream-100/70 px-8 py-4 text-base font-extrabold text-espresso-800 backdrop-blur-sm transition-colors hover:border-espresso-800/40 hover:bg-cream-100">
              View Menu
            </a>
          </div>
        </div>

        <a href="#menu" className="absolute bottom-5 left-1/2 z-30 hidden -translate-x-1/2 animate-bounce text-espresso-600/70 sm:block" aria-label="Scroll to menu">
          <ChevronDown className="h-6 w-6" />
        </a>
      </div>
    </section>
  );
}
