import { useEffect, useState } from 'react';
import { Loader2, Send, Star, MessageSquareQuote } from 'lucide-react';
import { supabase, type Review } from '@/lib/supabase';
import { Reveal } from '@/components/Reveal';
import { StarRating } from '@/components/StarRating';
import { ScoreSlash } from '@/components/Decorations';

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  const [code, setCode] = useState('');
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(12);
    
    // FILTER OUT DEAD REVIEWS (empty body strings)
    const cleanReviews = (data ?? []).filter((r) => r.body && r.body.trim() !== '');
    
    setReviews(cleanReviews);
    if (cleanReviews.length > 0) {
      setAvg(cleanReviews.reduce((s, r) => s + r.rating, 0) / cleanReviews.length);
      setCount(cleanReviews.length);
    } else {
      setAvg(0);
      setCount(0);
    }
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setMsg({ type: 'err', text: 'Enter your order code (e.g. CC-A7F3).' }); return; }
    setSubmitting(true);
    setMsg(null);
    const { data, error } = await supabase.rpc('submit_review', {
      p_order_code: code.trim().toUpperCase(),
      p_rating: rating,
      p_body: body.trim(),
      p_author: author.trim() || 'Anonymous',
    });
    setSubmitting(false);
    if (error) {
      const text = error.message.includes('already has a review')
        ? 'This order already has a review — one review per order.'
        : error.message.includes('No order found')
          ? 'No order found with that code. Double-check your receipt.'
          : 'Could not submit your review. Please try again.';
      setMsg({ type: 'err', text });
      return;
    }
    if (data) {
      setMsg({ type: 'ok', text: 'Thank you! Your review is live.' });
      setCode(''); setAuthor(''); setBody(''); setRating(5);
      loadReviews();
    }
  };

  return (
    <section id="reviews" className="relative bg-cream-200 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center justify-between border-b-2 border-kraft-200 pb-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sage-600">
              <MessageSquareQuote className="h-4 w-4" />
              <h2 className="font-display text-3xl font-extrabold text-espresso-800 sm:text-4xl md:text-5xl">Reviews</h2>
            </div>
            <span className="bg-sage-300 text-espresso-900 px-3 py-1 text-sm font-bold">
              {count}
            </span>
          </div>
          <span className="text-espresso-500 text-sm font-medium hidden sm:block">See all reviews →</span>
        </div>
        
        {count > 0 && (
          <p className="mb-6 text-center text-espresso-600">
            <span className="font-receipt text-2xl font-extrabold text-mustard-600">{avg.toFixed(1)}</span>{' '}
            <StarRating value={avg} size={16} className="align-middle" /> from {count} happy baker{count !== 1 ? 's' : ''}
          </p>
        )}
      </Reveal>

      <div className="mx-auto mt-6 grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <form onSubmit={submit} className="kraft-paper scoring-top relative p-6 shadow-card sm:p-8">
            <h3 className="slash-accent font-display text-xl font-extrabold text-espresso-800">Leave a review</h3>
            <p className="mt-1 text-sm text-espresso-600">Got an order code? One review per order — tell us how it tasted.</p>

            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-espresso-700">Order Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CC-XXXX" className="cc-input mt-1.5 font-receipt tracking-wider" />

            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-espresso-700">Your Name</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Optional" className="cc-input mt-1.5" />

            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-espresso-700">Rating</label>
            <div className="mt-1.5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)} className="transition-transform duration-200 hover:scale-125 active:scale-110" aria-label={`${n} stars`}>
                  <Star className={`h-7 w-7 transition-colors ${n <= (hover || rating) ? 'fill-mustard-500 text-mustard-500' : 'fill-kraft-300 text-kraft-300'}`} />
                </button>
              ))}
            </div>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-espresso-700">Your Review</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="How was your bake?" rows={3} className="cc-input mt-1.5 resize-none" />

            {msg && <p className={`mt-4 px-4 py-2.5 text-sm font-bold ${msg.type === 'ok' ? 'bg-sage-500/15 text-sage-700' : 'bg-red-100 text-red-700'}`}>{msg.text}</p>}

            <button type="submit" disabled={submitting} className="cc-tag group mt-5 inline-flex w-full items-center justify-center gap-2 bg-sage-500 px-6 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              {submitting ? 'Submitting…' : 'Post Review'}
            </button>
          </form>
        </Reveal>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-sage-500" /></div>
          ) : reviews.length === 0 ? (
            <div className="kraft-paper grid place-items-center p-12 text-center">
              <p className="font-display text-xl text-espresso-700">No reviews yet</p>
              <p className="mt-1 text-sm text-espresso-600">Be the first to leave one!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 80} className="cc-card scoring-top relative bg-white/70 p-5 shadow-soft ring-1 ring-kraft-300/60">
                  <div className="flex items-center justify-between">
                    <StarRating value={r.rating} size={15} />
                    <span className="font-receipt text-[11px] font-bold text-espresso-500">{new Date(r.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-espresso-700">"{r.body}"</p>
                  <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-gold-700">— {r.author}</p>
                  {r.admin_reply && (
                    <div className="mt-3 bg-sage-500/10 p-3">
                      <p className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-sage-700">
                        <ScoreSlash className="h-3 w-3" /> Crust &amp; Crumb replied
                      </p>
                      <p className="mt-1 text-xs text-espresso-700">{r.admin_reply}</p>
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}