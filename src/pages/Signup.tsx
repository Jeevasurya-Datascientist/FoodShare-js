import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types';
import { Leaf, Loader2, AlertCircle, Heart, Building2, CheckCircle2, ArrowRight, Truck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRY_CODES = [
  { code: '+91', country: 'IN' },
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'AU' },
  { code: '+86', country: 'CN' },
  { code: '+81', country: 'JP' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
];

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState<UserRole>('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !displayName || !phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `${countryCode} ${phone}`;
      await signup(email, password, displayName, role, fullPhone, organizationName);

      // Send verification email
      try {
        await sendVerificationEmail();
        navigate('/verify-email');
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
        return;
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        toast({
          title: 'Account created!',
          description: 'Welcome. Please verify your email from settings.',
        });
      }

      if (sessionStorage.getItem('pendingRecipeIngredients')) {
        navigate('/recipes');
      } else if (role === 'volunteer') navigate('/volunteer/dashboard');
      else if (role === 'ngo') navigate('/ngo/dashboard');
      else navigate('/donor/dashboard');
    } catch (err: unknown) {
      console.error('Signup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
      toast({
        title: 'Signup Failed',
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
            <span className="text-xl font-display font-bold text-foreground">FeedReach</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-display font-bold text-foreground mb-6 leading-tight">
            Start Your Journey of Giving
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Whether you're donating surplus food or distributing it, you're a hero in our eyes.
          </p>

          <div className="space-y-4">
            {[
              "Connect with local communities",
              "Reduce environmental impact",
              "Track your social contribution"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${0.1 * i}s` }}>
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground">
          © 2026 FeedReach. Reducing food waste, one meal at a time.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 bg-background relative overflow-y-auto">
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">FeedReach</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md animate-fade-up">
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">
              Create your account
            </h2>
            <p className="text-muted-foreground">
              Join our mission to reduce food waste
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-3 animate-shake">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-8">
            <Label className="mb-3 block text-base font-medium">I am a...</Label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group ${role === 'donor'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-muted bg-background hover:border-primary/50'
                  }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${role === 'donor' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary'
                  }`}>
                  <Heart className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">Donor</p>
                <p className="text-xs text-muted-foreground mt-1">I want to donate food</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('ngo')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group ${role === 'ngo'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-muted bg-background hover:border-primary/50'
                  }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${role === 'ngo' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary'
                  }`}>
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">NGO</p>
                <p className="text-xs text-muted-foreground mt-1">I represents an NGO</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group ${role === 'volunteer'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-muted bg-background hover:border-primary/50'
                  }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${role === 'volunteer' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary'
                  }`}>
                  <Truck className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">Volunteer</p>
                <p className="text-xs text-muted-foreground mt-1">I want to deliver</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName">{role === 'ngo' ? 'Contact Name' : 'Full Name'} *</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                className="h-11 bg-muted/30 focus:bg-background transition-colors"
              />
            </div>

            {role === 'ngo' && (
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="Your Organization"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  disabled={loading}
                  className="h-11 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-11 bg-muted/30 focus:bg-background transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode} disabled={loading}>
                  <SelectTrigger className="w-[100px] bg-muted/30 focus:bg-background">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.code} ({item.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="h-11 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                  I agree to the <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms & Conditions</Link>, <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>, and <Link to="/data-use" target="_blank" className="text-primary hover:underline">Data Usage Policy</Link>.
                </label>
                <p className="text-[0.8rem] text-muted-foreground">
                  I consent to the collection of my data as outlined in the privacy policy.
                </p>
              </div>
            </div>



            <Button type="submit" className="w-full h-11 text-base group" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
