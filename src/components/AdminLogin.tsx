import { useState, type FormEvent } from 'react';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useAdmin } from '@/lib/admin';
import { ScoreSlash } from '@/components/Decorations';

type AdminLoginProps = { onBack: () => void; onSuccess: () => void };

export function AdminLogin({ onBack, onSuccess }: AdminLoginProps) {
  const { signIn } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) { setError('Invalid credentials. Please try again.'); return; }
    onSuccess();
  };

  return (
    <div className="grid min-h-screen place-items-center bg-cream-200 px-5 py-16">
      <div className="w-full max-w-md">
        <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-espresso-600 transition-colors hover:text-sage-600">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </button>

        <div className="kraft-paper scoring-top relative p-8 shadow-card sm:p-10">
          <div className="text-center">
            <span className="cc-frame mx-auto grid h-14 w-14 place-items-center bg-espresso-800 text-mustard-400">
              <ScoreSlash className="h-8 w-8" />
            </span>
            <h1 className="font-display mt-4 text-2xl font-extrabold text-espresso-800">Staff Access</h1>
            <p className="mt-1 text-sm text-espresso-600">Crust &amp; Crumb admin dashboard</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-espresso-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="cc-input mt-1.5"
                placeholder="Enter your email"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-espresso-700">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="cc-input mt-1.5" placeholder="••••••••" />
            </label>
            {error && <p className="bg-red-100 px-4 py-2.5 text-sm font-bold text-red-700">{error}</p>}
            <button type="submit" disabled={loading} className="cc-tag flex w-full items-center justify-center gap-2 bg-sage-500 px-6 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 bg-kraft-100 p-3 text-center text-xs text-espresso-600">
            Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
