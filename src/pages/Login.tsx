import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Hero/Branding */}
      <div className="hidden lg:relative lg:flex flex-col justify-between bg-primary/5 p-12 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl opacity-50" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">FoodShare</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-display font-bold text-foreground mb-6 leading-tight">
            Connect Surplus Food with Those in Need
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of donors and NGOs making a difference every day.
          </p>

          <div className="space-y-4">
            {[
              "Real-time donation tracking",
              "Instant notifications for NGOs",
              "Impact analytics dashboard"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${0.1 * i}s` }}>
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground">
          © 2026 FoodShare. Reducing food waste, one meal at a time.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-background relative">
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">FoodShare</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-3 animate-shake">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-11 bg-muted/30 focus:bg-background transition-colors"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-11 bg-muted/30 focus:bg-background transition-colors"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base group" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
