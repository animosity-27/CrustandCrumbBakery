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
      
      // If Supabase fails or returns empty, use hardcoded fallback
      if (error || !data || data.length === 0) {
        setProducts([
          {
            id: 'fallback-1',
            name: 'Cream Cheese Garlic Brioche',
            description: 'Golden, buttery brioche stuffed with gooey cream cheese, topped with savory garlic butter and fresh parsley.',
            price: 120,
            image: 'https://res.cloudinary.com/mxabywb7/image/upload/v1785455580/346155078_789048169485930_2229338423857853064_n_duiyyi.jpg',
            warm_filter: true,
            stock: 20,
            is_active: true,
            sort_order: 1,
          },
          {
            id: 'fallback-2',
            name: 'Choco Banana Bread',
            description: 'Rich, moist banana bread loaded with dark chocolate chunks and ripe bananas.',
            price: 100,
            image: 'https://res.cloudinary.com/mxabywb7/image/upload/v1785455580/758480124_2098362501103201_1744164549062994860_n_ekipxh.jpg',
            warm_filter: false,
            stock: 15,
            is_active: true,
            sort_order: 2,
          },
          {
            id: 'fallback-3',
            name: 'Fudgy Brownies',
            description: 'Deep, dark chocolate brownies with a crackly top and gooey center, finished with sea salt.',
            price: 90,
            image: 'https://res.cloudinary.com/mxabywb7/image/upload/v1785455580/346155093_785142339664383_4840433167330828553_n_edzxth.jpg',
            warm_filter: false,
            stock: 25,
            is_active: true,
            sort_order: 3,
          },
        ]);
      } else {
        setProducts(data);
      }
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

function FeaturedSpotlight({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <Reveal delay={120} className="mx-auto mt-12 max-w-5xl px-5 sm:px-8">
      <div className="relative flex flex-col md:flex-row gap-8 items-center bg-parchment/90 backdrop-blur-sm p-8 lg:p-12 shadow-soft border border-kraft-200 card-lift">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-mustard-500 text-espresso-900 px-6 py-2 font-bold uppercase tracking-wider text-sm z-10 shadow-press">
          Best Seller
        </div>
        <div className="w-full md:w-1/2 relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            loading="lazy" 
            className="w-full h-auto object-cover shadow-soft" 
          />
        </div>
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