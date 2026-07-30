import { useState } from 'react';
import { MapPin, Clock, Phone, MessageCircle, Send, Loader2 } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { GarlicClove, ParsleySprig, Wheat, ScoreSlash } from '@/components/Decorations';
import { PICKUP_SLOTS } from '@/lib/supabase';

export function ContactSection({ onOrder }: { onOrder: () => void }) {
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setName('');
      setMsg('');
      setTimeout(() => setSent(false), 4000);
    }, 700);
  };

  return (
    <section id="contact" className="relative bg-cream-100 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="kraft-paper torn-paper scoring-top relative px-6 py-14 shadow-ticket sm:px-14 sm:py-16">
          <GarlicClove className="animate-floaty absolute -left-2 bottom-6 h-12 w-9 opacity-80 sm:left-2" />
          <ParsleySprig className="animate-floaty2 absolute -right-1 bottom-10 h-12 w-12 opacity-85 sm:right-4" />
          <GarlicClove className="animate-floaty2 absolute right-10 -top-2 h-9 w-7 opacity-60" />
          <ParsleySprig className="animate-floaty absolute left-10 -top-3 h-9 w-9 opacity-60" />

          <div className="relative text-center">
            <div className="mb-3 flex items-center justify-center gap-2 text-sage-700">
              <span className="h-px w-8 bg-sage-600/40" />
              <Wheat className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Contact &amp; Pickup</span>
              <span className="h-px w-8 bg-sage-600/40" />
            </div>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-espresso-800 sm:text-4xl">
              Baked in small batches,<br className="hidden sm:block" /> reserved just for you.
            </h2>
            <div className="scoring-divider mx-auto mt-5 w-44 opacity-60" />
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            <div className="cc-card scoring-top bg-cream-100 p-5 text-center shadow-soft ring-1 ring-kraft-300/60">
              <Clock className="mx-auto h-6 w-6 text-gold-600" />
              <p className="mt-2 text-xs font-extrabold uppercase tracking-wider text-espresso-700">Pickup Schedule</p>
              {PICKUP_SLOTS.map((s) => <p key={s} className="mt-1 font-display text-base font-bold text-espresso-800">{s}</p>)}
            </div>
            <div className="cc-card scoring-top bg-cream-100 p-5 text-center shadow-soft ring-1 ring-kraft-300/60">
              <MapPin className="mx-auto h-6 w-6 text-sage-600" />
              <p className="mt-2 text-xs font-extrabold uppercase tracking-wider text-espresso-700">Location</p>
              <p className="mt-1 font-display text-lg font-bold text-espresso-800">BPP Laboratory</p>
              <p className="mt-1 text-xs text-espresso-600">Bring your own container — we love less waste.</p>
            </div>
            <div className="cc-card scoring-top bg-cream-100 p-5 text-center shadow-soft ring-1 ring-kraft-300/60">
              <Phone className="mx-auto h-6 w-6 text-mustard-600" />
              <p className="mt-2 text-xs font-extrabold uppercase tracking-wider text-espresso-700">Reach Us</p>
              <p className="mt-1 font-receipt font-bold text-espresso-800">0917 821 4455</p>
              <a href="https://wa.me/639178214455" target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-sage-600 hover:text-sage-700">
                <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="relative mt-10 grid gap-6 sm:grid-cols-2">
            <form onSubmit={submit} className="cc-card scoring-top bg-cream-100 p-5 shadow-soft ring-1 ring-kraft-300/60">
              <p className="slash-accent text-xs font-extrabold uppercase tracking-wider text-espresso-700">Send us a note</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="cc-input mt-3" />
              <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Your message or special request" rows={3} className="cc-input mt-3 resize-none" />
              <button type="submit" disabled={sending} className="cc-notch group mt-3 inline-flex w-full items-center justify-center gap-2 bg-sage-500 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                {sent ? 'Sent — thank you!' : sending ? 'Sending…' : 'Send Message'}
              </button>
              {sent && <p className="mt-2 text-center text-xs font-bold text-sage-700">Thanks! We&apos;ll get back to you soon.</p>}
            </form>

            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-espresso-700">Ready to grab your batch?</p>
              <button type="button" onClick={onOrder} className="cc-tag group mt-4 inline-flex items-center gap-2.5 bg-mustard-500 px-9 py-4 text-lg font-extrabold text-espresso-900">
                Order Your Batch Now
                <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-espresso-600">
                <ScoreSlash className="h-3.5 w-3.5 text-sage-500" /> Spots fill fast — order before each pickup window closes.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
