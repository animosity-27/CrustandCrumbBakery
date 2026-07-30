import { useEffect, useState } from 'react';
import { Search, Loader2, Package, ChefHat, ShoppingBag, CheckCircle2, XCircle, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { formatPeso, PAYMENT_LABELS, type Order, type OrderItem, type OrderStatus } from '@/lib/supabase';
import { ScoreSlash } from '@/components/Decorations';

type TrackProps = { initialCode?: string; onBack: () => void };

const STEPS: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'received', label: 'Order Received', icon: Package },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'ready', label: 'Ready for Pickup', icon: ShoppingBag },
  { status: 'completed', label: 'Completed', icon: CheckCircle2 },
];
const STATUS_ORDER: OrderStatus[] = ['received', 'preparing', 'ready', 'completed'];

export function TrackOrder({ initialCode, onBack }: TrackProps) {
  const [code, setCode] = useState(initialCode ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const lookup = async (codeToFind: string) => {
    if (!codeToFind.trim()) { setError('Enter your order code (e.g. CC-A7F3).'); return; }
    setLoading(true); setError(null); setOrder(null); setItems([]);
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-order?code=${encodeURIComponent(codeToFind.trim().toUpperCase())}`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` } });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || 'Could not find that order.'); return; }
      setOrder(data.order as Order);
      setItems(data.items as OrderItem[]);
    } catch { setError('Network error. Please try again.'); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (initialCode) { setCode(initialCode); lookup(initialCode); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const cancelled = order?.status === 'cancelled';
  const currentIndex = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-cream-100 pt-24 pb-20">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-espresso-600 transition-colors hover:text-sage-600">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold text-espresso-800 sm:text-4xl">Track Your Order</h1>
          <p className="mt-2 text-espresso-600">Enter the code from your receipt to see where your bake is.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); lookup(code); }} className="mt-8 flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CC-XXXX" className="cc-input flex-1 text-center font-receipt font-bold tracking-[0.2em]" />
          <button type="submit" disabled={loading} className="cc-notch group inline-flex items-center gap-2 bg-sage-500 px-6 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Track
          </button>
        </form>

        {error && <div className="mt-6 bg-red-100 px-5 py-4 text-center text-sm font-bold text-red-700">{error}</div>}

        {order && (
          <div className="mt-8 space-y-6">
            <div className="kraft-paper scoring-top p-6 shadow-card sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-600">Order</p>
                  <p className="font-receipt text-2xl font-extrabold tracking-wider text-espresso-900">{order.code}</p>
                </div>
                {cancelled ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-100 px-4 py-2 text-sm font-extrabold text-red-700"><XCircle className="h-4 w-4" /> Cancelled</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-sage-500/15 px-4 py-2 text-sm font-extrabold text-sage-700"><Clock className="h-4 w-4" /> {STEPS.find((s) => s.status === order.status)?.label}</span>
                )}
              </div>

              {!cancelled && (
                <ol className="mt-8 flex flex-col gap-0">
                  {STEPS.map((step, i) => {
                    const done = i <= currentIndex;
                    const current = i === currentIndex;
                    const Icon = step.icon;
                    return (
                      <li key={step.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className={`grid h-11 w-11 place-items-center border-2 transition-all duration-500 ${done ? 'border-sage-500 bg-sage-500 text-white' : 'border-kraft-300 bg-cream-100 text-espresso-400'} ${current ? 'animate-bob ring-4 ring-sage-500/20' : ''}`}>
                            <Icon className="h-5 w-5" />
                          </span>
                          {i < STEPS.length - 1 && <span className={`my-1 w-0.5 flex-1 ${i < currentIndex ? 'bg-sage-500' : 'bg-kraft-300'}`} style={{ minHeight: 28 }} />}
                        </div>
                        <div className="pb-6 pt-2">
                          <p className={`text-sm font-extrabold transition-colors ${done ? 'text-espresso-800' : 'text-espresso-400'}`}>{step.label}</p>
                          {current && <p className="flex items-center gap-1 text-xs text-sage-600"><ScoreSlash className="h-3 w-3" /> In progress now…</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="cc-card scoring-top bg-white/70 p-5 shadow-soft ring-1 ring-kraft-300/60">
                <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-600">Items</p>
                <ul className="mt-2 space-y-1">
                  {items.map((it, i) => (
                    <li key={i} className="flex justify-between font-receipt text-sm text-espresso-700">
                      <span>{it.quantity}× {it.product_name}</span>
                      <span>{formatPeso(Number(it.price) * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-kraft-300/60 pt-3">
                  <span className="text-sm font-bold text-espresso-700">Total</span>
                  <span className="font-receipt font-display text-lg font-extrabold text-espresso-800">{formatPeso(Number(order.total))}</span>
                </div>
              </div>
              <div className="cc-card scoring-top bg-white/70 p-5 shadow-soft ring-1 ring-kraft-300/60">
                <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-600">Pickup Details</p>
                <div className="mt-2 space-y-2 text-sm text-espresso-700">
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold-600" /> {order.pickup_slot}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sage-600" /> BPP Laboratory</p>
                  <p>Payment: <span className="font-bold">{PAYMENT_LABELS[order.payment_method]}</span></p>
                  {order.note && <p className="bg-kraft-100 p-2 text-xs italic">&ldquo;{order.note}&rdquo;</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
