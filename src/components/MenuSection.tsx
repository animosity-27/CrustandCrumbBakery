import { useEffect, useState } from 'react';
import { Star, Plus, Loader2, Croissant } from 'lucide-react';
import { supabase, formatPeso, type Product } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import { Reveal } from '@/components/Reveal';
import { Wheat, ScoreSlash } from '@/components/Decorations';

export function MenuSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!active) return;
      if (error) { setLoading(false); return; }
      setProducts(data ?? []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const featured = products[0];

  return (
    <section id="menu" className="relative bg-cream-100 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <div className="mb-3 flex items-center justify-center gap-2 text-sage-600">
          <span className="h-px w-8 bg-sage-500/50" />
          <Wheat className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.3em]">Featured Specialty</span>
          <span className="h-px w-8 bg-sage-500/50" />
        </div>
        <h2 className="font-display text-3xl font-extrabold text-espresso-800 sm:text-4xl md:text-5xl">Our Menu</h2>
        <div className="scoring-divider mx-auto mt-5 w-48 opacity-60" />
        <p className="mx-auto mt-5 max-w-xl text-espresso-600">
          Small batches baked fresh every pickup window. Add what you crave to your basket.
        </p>
      </Reveal>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sage-500" />
        </div>
      ) : (
        <>
          {featured && <FeaturedSpotlight product={featured} onAdd={() => add(featured)} />}

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 px-5 sm:px-8 md:grid-cols-3">
            {products.slice(1).map((item, i) => (
              <MenuCard key={item.id} product={item} index={i} onAdd={() => add(item)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* --- BLUE-INSPIRED FEATURED SPOTLIGHT (Green colors, Green props) --- */
function FeaturedSpotlight({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <Reveal delay={120} className="mx-auto mt-12 max-w-5xl px-5 sm:px-8">
      <div className="relative flex flex-col md:flex-row gap-8 items-center bg-parchment/90 backdrop-blur-sm p-8 lg:p-12 shadow-soft border border-kraft-200 card-lift">
        {/* Best Seller badge using Green's mustard */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          {/* Paper/Kraft background circle */}
          <div className="h-20 w-20 rounded-full bg-kraft-200 shadow-lg border-2 border-espresso-800/30 flex items-center justify-center p-2 transform -rotate-3">
            {/* Your transparent cookie icon */}
            <img
              src="https://res.cloudinary.com/mxabywb7/image/upload/v1785448063/cookie-removebg-preview_lxfjmp.png"
              alt="Best Seller"
              className="h-14 w-14 object-contain"
            />
          </div>

          {/* Tiny "BEST SELLER" text tucked right under it */}
          <span className="mt-1 bg-cream-100 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-espresso-800 border border-espresso-800/10 shadow-sm transform rotate-1">
            Best Seller
          </span>
        </div>

        {/* Image side */}
        <div className="w-full md:w-1/2 relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-auto object-cover shadow-soft"
          />
          {/* Steam wisps from Green */}
          <div className="pointer-events-none absolute top-0 left-[20%] h-20 w-32">
            <span className="steam" />
            <span className="steam" />
            <span className="steam" />
          </div>
        </div>

        {/* Text side */}
        <div className="w-full md:w-1/2 space-y-4">
          <span className="text-sage-600 font-bold uppercase tracking-[0.25em] text-xs">The Spotlight</span>
          <h3 className="font-display text-4xl lg:text-5xl text-espresso-800 font-bold">
            {product.name}
          </h3>
          <p className="text-espresso-600 text-lg leading-relaxed">{product.description}</p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="bg-kraft-200 px-4 py-2 font-receipt text-xl font-extrabold text-espresso-900 shadow-press">
              {formatPeso(Number(product.price))}
            </span>
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center justify-center gap-2 bg-sage-500 px-6 py-3 font-bold text-white transition-all duration-300 shadow-press hover:bg-sage-600 hover:-translate-y-px active:translate-y-1"
            >
              Add to basket <Plus className="h-4 w-4" />
            </button>
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-mustard-700 mt-2">
              <ScoreSlash className="h-3.5 w-3.5" /> Only {product.stock} left!
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* --- ORIGINAL GREEN MENU CARD (Kept as-is) --- */
function MenuCard({ product, index, onAdd }: { product: Product; index: number; onAdd: () => void }) {
  const soldOut = product.stock <= 0;
  return (
    <Reveal
      as="article"
      delay={index * 120}
      className="parchment scoring-top cc-card group relative flex flex-col overflow-hidden shadow-soft ring-1 ring-kraft-300/70 hover:shadow-card"
    >
      <div className="cc-zoom relative aspect-[4/3] overflow-hidden">
        <img src={product.image} alt={product.name} loading="lazy" className={`h-full w-full object-cover ${soldOut ? 'opacity-60 grayscale' : ''}`} />
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-espresso-900/40 text-lg font-extrabold uppercase tracking-widest text-cream-100">Sold Out</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold text-espresso-800">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-espresso-600">{product.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="price-stamp font-receipt text-base font-extrabold text-espresso-900">
            {formatPeso(Number(product.price))}
          </span>
          <button type="button" onClick={onAdd} disabled={soldOut} className="cc-notch inline-flex items-center gap-1.5 bg-sage-500 px-4 py-2 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        {product.stock > 0 && product.stock <= 5 && (
          <p className="mt-2 text-[11px] font-bold text-mustard-700">{product.stock} left in stock</p>
        )}
      </div>
    </Reveal>
  );
}