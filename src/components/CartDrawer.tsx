import { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, CheckCircle2, ArrowRight, Banknote, Smartphone } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { supabase, formatPeso, PICKUP_SLOTS, PAYMENT_LABELS, type PaymentMethod, type Order } from '@/lib/supabase';

export function CartDrawer() {
  const { items, isOpen, closeCart, setQty, remove, subtotal, count, clear } = useCart();
  const [stage, setStage] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [slot, setSlot] = useState(PICKUP_SLOTS[0]);
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [closing, setClosing] = useState(false);

  // 🛑 SCROLL LOCK REMOVED ENTIRELY - Page will never freeze
  useEffect(() => {
    if (isOpen) {
      // We do NOT lock document.body. We let the page scroll naturally.
    } else {
      // Nothing to unlock.
    }
  }, [isOpen]);

  if (!isOpen && !closing) return null;

  const placeOrder = async () => {
    if (!name.trim() || !contact.trim()) {
      setError('Please add your name and contact.');
      return;
    }
    if (items.length === 0) return;
    setPlacing(true);
    setError(null);

    const payload = items.map((i) => ({ 
      product_id: null, 
      name: String(i.name), 
      price: Number(i.price), 
      quantity: Number(i.quantity) 
    }));

    const { data, error: rpcError } = await supabase.rpc('create_order', {
      p_items: payload,
      p_name: name.trim(),
      p_contact: contact.trim(),
      p_slot: slot,
      p_payment: payment,
      p_total: Number(subtotal),
      p_note: note.trim()
    });

    setPlacing(false);
    if (rpcError || !data) { setError('Error placing order.'); return; }

    setOrder(data as Order);
    setStage('success');
  };

  const handleClose = (callback?: () => void) => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      closeCart();
      window.dispatchEvent(new Event('cart-drawer-closed'));
      if (callback) callback();
    }, 300);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end ${closing ? 'pointer-events-none' : 'pointer-events-auto'}`}>
      <div 
        className={`absolute inset-0 bg-espresso-900/40 backdrop-blur-sm transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={() => handleClose()}
      />

      <div className={`h-full w-full max-w-md bg-cream-100 shadow-2xl transform transition-transform duration-300 flex flex-col ${closing ? 'translate-x-full' : 'translate-x-0'}`}>
        
        {/* HEADER */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 border-b border-kraft-300/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-sage-600" />
            <h2 className="font-display text-lg font-extrabold text-espresso-800">
              {stage === 'success' ? 'Order Confirmed' : stage === 'checkout' ? 'Checkout' : 'Your Basket'}
            </h2>
            {stage === 'cart' && count > 0 && (
              <span className="bg-sage-500/15 px-2 py-0.5 font-receipt text-xs font-bold text-sage-700">{count}</span>
            )}
          </div>
          <button onClick={() => handleClose()} className="p-2 hover:bg-kraft-200/70"><X className="h-5 w-5" /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5">
          {stage === 'success' && order ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="grid h-20 w-20 place-items-center bg-sage-500/15 text-sage-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-extrabold text-espresso-800">Order placed!</h3>
              <div className="notch-ticket mt-6 w-full bg-kraft-200 p-6">
                <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-600">Your order code</p>
                <p className="font-receipt mt-1 text-4xl font-extrabold tracking-[0.15em] text-espresso-900">{order.code}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-left text-sm">
                  <div><p className="text-xs font-bold text-espresso-500">Pickup</p><p className="font-bold text-espresso-800">{slot}</p></div>
                  <div><p className="text-xs font-bold text-espresso-500">Payment</p><p className="font-bold text-espresso-800">{PAYMENT_LABELS[payment]}</p></div>
                  <div><p className="text-xs font-bold text-espresso-500">Total</p><p className="font-receipt font-bold text-espresso-800">{formatPeso(Number(order.total))}</p></div>
                  <div><p className="text-xs font-bold text-espresso-500">Location</p><p className="font-bold text-espresso-800">12-Gold</p></div>
                </div>
              </div>
              <button onClick={() => handleClose()} className="mt-6 border-2 border-kraft-300 px-6 py-3 text-sm font-bold text-espresso-700">Back to Menu</button>
            </div>
          ) : stage === 'cart' && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="h-12 w-12 text-kraft-400" />
              <p className="mt-4 font-display text-lg text-espresso-700">Your basket is empty</p>
              <button onClick={() => { handleClose(); setTimeout(() => document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' }), 350); }} className="cc-notch mt-5 bg-sage-500 px-6 py-3 text-sm font-extrabold text-white">Browse the menu</button>
            </div>
          ) : stage === 'cart' ? (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.product_id} className="flex gap-3 bg-white/70 p-3 shadow-soft ring-1 ring-kraft-300/50">
                  <img src={item.image} alt={item.name} className="h-16 w-16 object-cover" />
                  <div className="flex-1 flex flex-col">
                    <p className="text-sm font-bold text-espresso-800">{item.name}</p>
                    <p className="font-receipt text-xs text-espresso-500">{formatPeso(item.price)} each</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQty(item.product_id, item.quantity - 1)} className="grid h-7 w-7 place-items-center bg-kraft-200"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-6 text-center font-receipt text-sm font-extrabold text-espresso-800">{item.quantity}</span>
                        <button onClick={() => setQty(item.product_id, item.quantity + 1)} className="grid h-7 w-7 place-items-center bg-kraft-200"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-receipt text-sm font-extrabold text-espresso-800">{formatPeso(item.price * item.quantity)}</span>
                        <button onClick={() => remove(item.product_id)} className="text-espresso-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {stage === 'checkout' && (
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-espresso-700">Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full border-2 border-kraft-300 bg-cream-100 p-3" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-espresso-700">Contact</label><input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="0917 000 0000" className="w-full border-2 border-kraft-300 bg-cream-100 p-3" /></div>
              <div className="grid grid-cols-2 gap-2">
                {PICKUP_SLOTS.map((s) => <button key={s} onClick={() => setSlot(s)} className={`border-2 px-3 py-2.5 text-sm font-bold ${slot === s ? 'border-sage-500 bg-sage-500/15 text-espresso-800' : 'border-kraft-300 text-espresso-600'}`}>{s}</button>)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['cash', 'gcash'] as PaymentMethod[]).map((m) => <button key={m} onClick={() => setPayment(m)} className={`flex flex-col items-center border-2 px-2 py-3 text-xs font-bold ${payment === m ? 'border-mustard-500 bg-mustard-500/15 text-espresso-800' : 'border-kraft-300 text-espresso-600'}`}>{m === 'cash' ? 'Cash' : 'GCash'}</button>)}
              </div>
              <div className="bg-white/70 p-4 ring-1 ring-kraft-300/50">
                <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-700">Order Summary</p>
                <ul className="mt-2 space-y-1">
                  {items.map((i) => <li key={i.product_id} className="flex justify-between font-receipt text-sm text-espresso-700"><span>{i.quantity}× {i.name}</span><span>{formatPeso(i.price * i.quantity)}</span></li>)}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {stage !== 'success' && items.length > 0 && (
          <div className="flex-shrink-0 border-t border-kraft-300/60 p-5">
            {error && <p className="mb-3 bg-red-100 px-4 py-2.5 text-sm font-bold text-red-700">{error}</p>}
            <div className="flex justify-between mb-3"><span className="text-sm font-bold text-espresso-600">Subtotal</span><span className="font-receipt font-display text-xl font-extrabold text-espresso-800">{formatPeso(subtotal)}</span></div>
            {stage === 'cart' ? (
              <button onClick={() => setStage('checkout')} className="w-full bg-sage-500 py-3.5 text-sm font-extrabold text-white">Proceed to Checkout</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setStage('cart')} className="flex-1 border-2 border-kraft-300 py-3.5 text-sm font-bold text-espresso-700">Back</button>
                <button onClick={placeOrder} disabled={placing} className="flex-1 bg-mustard-500 py-3.5 text-sm font-extrabold text-espresso-900 disabled:opacity-60">
                  {placing ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}