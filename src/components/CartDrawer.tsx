import { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, CheckCircle2, ArrowRight, Banknote, Smartphone, QrCode, Upload } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setClosing(false);
      setStage('cart');
      setError(null);
      setOrder(null);
    }
  }, [isOpen]);

  if (!isOpen && !closing) return null;

  const placeOrder = async () => {
    if (!name.trim() || !contact.trim()) { setError('Please add your name and contact so we can reach you.'); return; }
    if (items.length === 0) return;
    setPlacing(true);
    setError(null);
    const payload = items.map((i) => ({ product_id: i.product_id, name: i.name, price: i.price, quantity: i.quantity }));
    const { data, error: rpcError } = await supabase.rpc('create_order', {
      p_items: payload, p_name: name.trim(), p_contact: contact.trim(),
      p_slot: slot, p_payment: payment, p_total: subtotal, p_note: note.trim(),
    });
    setPlacing(false);
    if (rpcError || !data) { setError('Something went wrong placing your order. Please try again.'); return; }
    setOrder(data as Order);
    clear();
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
    <div className={`fixed inset-0 z-50 flex justify-end ${closing ? 'pointer-events-none' : 'pointer-events-auto'}`}>
      <div
        className={`absolute inset-0 bg-espresso-900/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${closing ? 'opacity-0' : 'opacity-100'
          }`}
        onClick={() => handleClose()}
      />

      <aside
        className={`relative flex h-full w-full max-w-md flex-col bg-cream-100 shadow-2xl transition-transform duration-300 ease-in-out ${closing ? 'translate-y-full' : 'translate-y-0'
          }`}
      >
        <div className="flex items-center justify-between border-b border-kraft-300/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-sage-600" />
            <h2 className="font-display text-lg font-extrabold text-espresso-800">
              {stage === 'success' ? 'Order Confirmed' : stage === 'checkout' ? 'Checkout' : 'Your Basket'}
            </h2>
            {stage === 'cart' && count > 0 && (
              <span className="cc-notch bg-sage-500/15 px-2 py-0.5 font-receipt text-xs font-bold text-sage-700">{count}</span>
            )}
          </div>
          <button type="button" onClick={() => handleClose()} className="grid h-9 w-9 place-items-center text-espresso-700 hover:bg-kraft-200/70" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
          {stage === 'success' && order && (
            <SuccessView
              order={order}
              payment={payment}
              slot={slot}
              onDone={() => handleClose()}
            />
          )}

          {stage === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingBag className="h-12 w-12 text-kraft-400" />
                  <p className="mt-4 font-display text-lg text-espresso-700">Your basket is empty</p>
                  <p className="mt-1 text-sm text-espresso-500">Add some freshly baked goodness!</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose(); // closes drawer with 300ms animation
                      setTimeout(() => {
                        document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
                      }, 350); // wait 350ms (slightly longer than the drawer animation)
                    }}
                    className="cc-notch mt-5 bg-sage-500 px-6 py-3 text-sm font-extrabold text-white"
                  >
                    Browse the menu
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.product_id} className="cc-card scoring-top flex gap-3 bg-white/70 p-3 shadow-soft ring-1 ring-kraft-300/50">
                      <img src={item.image} alt={item.name} className="h-16 w-16 flex-shrink-0 object-cover" />
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-bold text-espresso-800">{item.name}</p>
                        <p className="font-receipt text-xs text-espresso-500">{formatPeso(item.price)} each</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setQty(item.product_id, item.quantity - 1)} className="grid h-7 w-7 place-items-center bg-kraft-200 text-espresso-700 transition-colors hover:bg-kraft-300" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="w-6 text-center font-receipt text-sm font-extrabold text-espresso-800">{item.quantity}</span>
                            <button type="button" onClick={() => setQty(item.product_id, item.quantity + 1)} className="grid h-7 w-7 place-items-center bg-kraft-200 text-espresso-700 transition-colors hover:bg-kraft-300" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-receipt text-sm font-extrabold text-espresso-800">{formatPeso(item.price * item.quantity)}</span>
                            <button type="button" onClick={() => remove(item.product_id)} className="text-espresso-400 transition-colors hover:text-red-600" aria-label={`Remove ${item.name}`}><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {stage === 'checkout' && (
            <div className="space-y-4">
              <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="cc-input" /></Field>
              <Field label="Contact (phone or email)"><input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="0917 000 0000" className="cc-input" /></Field>
              <Field label="Pickup window">
                <div className="grid grid-cols-2 gap-2">
                  {PICKUP_SLOTS.map((s) => (
                    <button key={s} type="button" onClick={() => setSlot(s)} className={`border-2 px-3 py-2.5 text-sm font-bold transition-all ${slot === s ? 'border-sage-500 bg-sage-500/15 text-espresso-800' : 'border-kraft-300 bg-cream-100 text-espresso-600 hover:border-kraft-400'}`}>{s}</button>
                  ))}
                </div>
              </Field>
              <Field label="Payment method">
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'gcash', 'qrph'] as PaymentMethod[]).map((m) => (
                    <button key={m} type="button" onClick={() => setPayment(m)} className={`flex flex-col items-center gap-1 border-2 px-2 py-3 text-xs font-bold transition-all ${payment === m ? 'border-mustard-500 bg-mustard-500/15 text-espresso-800' : 'border-kraft-300 bg-cream-100 text-espresso-600 hover:border-kraft-400'}`}>
                      {m === 'cash' && <Banknote className="h-5 w-5" />}
                      {m === 'gcash' && <Smartphone className="h-5 w-5" />}
                      {m === 'qrph' && <QrCode className="h-5 w-5" />}
                      {PAYMENT_LABELS[m]}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Note (optional)"><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Allergies, special requests…" rows={2} className="cc-input resize-none" /></Field>
              <div className="cc-card scoring-top bg-white/70 p-4 ring-1 ring-kraft-300/50">
                <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-700">Order Summary</p>
                <ul className="mt-2 space-y-1">
                  {items.map((i) => (
                    <li key={i.product_id} className="flex justify-between font-receipt text-sm text-espresso-700">
                      <span>{i.quantity}× {i.name}</span>
                      <span>{formatPeso(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {stage !== 'success' && items.length > 0 && (
          <div className="border-t border-kraft-300/60 px-5 py-4">
            {error && <p className="mb-3 bg-red-100 px-4 py-2.5 text-sm font-bold text-red-700">{error}</p>}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-espresso-600">Subtotal</span>
              <span className="font-receipt font-display text-xl font-extrabold text-espresso-800">{formatPeso(subtotal)}</span>
            </div>
            {stage === 'cart' ? (
              <button type="button" onClick={() => setStage('checkout')} className="cc-tag group flex w-full items-center justify-center gap-2 bg-sage-500 px-6 py-3.5 text-sm font-extrabold text-white">
                Proceed to Checkout <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button type="button" onClick={() => setStage('cart')} className="border-2 border-kraft-300 px-5 py-3.5 text-sm font-bold text-espresso-700 transition-colors hover:border-kraft-400">Back</button>
                <button type="button" onClick={placeOrder} disabled={placing} className="cc-tag group flex flex-1 items-center justify-center gap-2 bg-mustard-500 px-6 py-3.5 text-sm font-extrabold text-espresso-900 disabled:opacity-60">
                  {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {placing ? 'Placing order…' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="text-xs font-bold uppercase tracking-wider text-espresso-700">{label}</span><div className="mt-1.5">{children}</div></label>);
}

function SuccessView({ order, payment, slot, onDone }: { order: Order; payment: PaymentMethod; slot: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="animate-popIn cc-frame grid h-20 w-20 place-items-center bg-sage-500/15 text-sage-600">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h3 className="mt-5 font-display text-2xl font-extrabold text-espresso-800">Order placed!</h3>
      <p className="mt-1 text-sm text-espresso-600">Save this code to track and review your order.</p>

      <div className="notch-ticket mt-6 w-full bg-kraft-200 p-6">
        <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-600">Your order code</p>
        <p className="font-receipt mt-1 text-4xl font-extrabold tracking-[0.15em] text-espresso-900">{order.code}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-left text-sm">
          <div><p className="text-xs font-bold text-espresso-500">Pickup</p><p className="font-bold text-espresso-800">{slot}</p></div>
          <div><p className="text-xs font-bold text-espresso-500">Payment</p><p className="font-bold text-espresso-800">{PAYMENT_LABELS[payment]}</p></div>
          <div><p className="text-xs font-bold text-espresso-500">Total</p><p className="font-receipt font-bold text-espresso-800">{formatPeso(Number(order.total))}</p></div>
          <div><p className="text-xs font-bold text-espresso-500">Location</p><p className="font-bold text-espresso-800">BPP Laboratory</p></div>
        </div>
      </div>

      {payment !== 'cash' && (
        <div className="mt-4 w-full bg-cream-100 p-4 border border-kraft-300/50">
          <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-700">Pay via {PAYMENT_LABELS[payment]}</p>
          <div className="mt-2 flex justify-center">
            <img
              src={payment === 'gcash' ? '/gcash-qr.png' : '/qrph-qr.png'}
              alt={`${PAYMENT_LABELS[payment]} QR`}
              className="h-32 w-32 object-contain border border-kraft-300/50"
            />
          </div>
          <p className="mt-2 text-xs text-espresso-600">Scan the QR to pay. Proof upload coming soon.</p>
        </div>
      )}

      <div className="mt-6 flex w-full flex-col gap-2">
        <button type="button" onClick={() => { onDone(); window.dispatchEvent(new CustomEvent('cc-track', { detail: order.code })); }} className="cc-tag bg-sage-500 px-6 py-3.5 text-sm font-extrabold text-white">Track My Order</button>
        <button type="button" onClick={onDone} className="border-2 border-kraft-300 px-6 py-3 text-sm font-bold text-espresso-700 hover:border-kraft-400">Back to Menu</button>
      </div>
    </div>
  );
}