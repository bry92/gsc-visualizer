import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AuthContext } from '@/contexts/app-context';

type RedirectState = {
  from?: {
    pathname?: string;
  };
};

export default function Login() {
  const { login, register, isAuthenticated, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RedirectState | null;

  const redirectTo = useMemo(() => state?.from?.pathname || '/dashboard', [state]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password.');
      return;
    }

    if (!email.includes('@') || password.length < 6) {
      setError('Use a valid email and a password with at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-dark-light border border-white/10 rounded-2xl p-8 shadow-card">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-dark" />
          </div>
          <span className="font-display font-bold text-xl text-text-primary">SEO Pro</span>
        </Link>

        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Sign in</h1>
        <p className="text-text-secondary text-sm mb-6">
          {mode === 'signin'
            ? 'Log in to access your SEO dashboard and tools.'
            : 'Create an account to access your SEO dashboard and tools.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-text-secondary text-sm mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-dark w-full"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-text-secondary text-sm mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-dark w-full"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={isSubmitting || authLoading} className="btn-lime w-full disabled:opacity-60">
            {isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === 'signin' ? 'signup' : 'signin'));
            setError(null);
          }}
          className="text-text-secondary hover:text-text-primary text-sm mt-6"
        >
          {mode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </button>
      </div>
    </main>
  );
}
