import { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MessageSquare, Zap, Shield, Globe } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ username: 'alice', email: 'alice@example.com', password: 'demo123' });
    setMode('login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        
        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">SyncSpace</span>
        </div>

        {/* Center content */}
        <div className="space-y-8 relative">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Real-Time Collaboration,{' '}
              <span className="text-gradient">Without Limits</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              A production-grade platform built on WebSockets, JWT auth with Redis token rotation, and MongoDB persistence.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap, label: 'WebSocket real-time', desc: 'Sub-50ms message delivery' },
              { icon: Shield, label: 'JWT + Redis auth', desc: 'Access & refresh token rotation' },
              { icon: Globe, label: 'Room-based channels', desc: 'Create, join, and broadcast' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-card">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{label}</div>
                  <div className="text-sm text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground relative">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--online))] animate-pulse-slow" />
          <span>WebSocket server connected</span>
          <span className="mx-2">·</span>
          <span className="font-mono">ws://api.syncspace.dev</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">SyncSpace</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted-foreground">
              {mode === 'login'
                ? 'Sign in with your credentials to continue'
                : 'Join the collaboration platform'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  placeholder="john_doe"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  className="bg-secondary border-border focus-visible:ring-primary h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="bg-secondary border-border focus-visible:ring-primary h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className="bg-secondary border-border focus-visible:ring-primary h-11"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 gradient-primary font-semibold shadow-glow hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-border bg-transparent hover:bg-secondary text-muted-foreground text-sm"
              onClick={fillDemo}
            >
              Use demo credentials
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-primary hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="mt-8 p-4 rounded-xl bg-card border border-border/50 text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground mb-2 font-mono text-xs">POST /auth/login</div>
            <div className="font-mono">→ accessToken (15m) + refreshToken (7d)</div>
            <div className="font-mono">→ Refresh token stored in Redis</div>
            <div className="font-mono">→ Token rotation on /auth/refresh</div>
          </div>
        </div>
      </div>
    </div>
  );
}
