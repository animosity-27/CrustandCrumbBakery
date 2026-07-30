import { Wheat, ScoreSlash } from '@/components/Decorations';

const ITEMS = [
  'Freshly baked every pickup window',
  'Hand-shaped brioche',
  'Small batches · no shortcuts',
  'Cream cheese garlic brioche is today\'s feature',
  'Bring your own container — less waste',
  'Made with love at BPP Laboratory',
];

export function Ticker() {
  // duplicate the list so the marquee loops seamlessly (translateX -50%)
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="ticker bg-espresso-800 py-2.5 text-cream-100">
      <div className="ticker-track items-center">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-3 px-6 text-xs font-bold uppercase tracking-[0.2em]">
            <Wheat className="h-3.5 w-3.5 text-gold-400" />
            {item}
            <ScoreSlash className="h-3.5 w-3.5 text-sage-300" />
          </span>
        ))}
      </div>
    </div>
  );
}
