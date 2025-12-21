import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Loader2, AlertCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email);
            setMessage('Check your inbox for password reset instructions');
        } catch (err: unknown) {
            console.error('Reset password error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
            setError(errorMessage);
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
                        Account Recovery
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Don't worry, it happens to the best of us. We'll help you get back to making a difference.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-muted-foreground">
                    © 2026 FoodShare. Reducing food waste, one meal at a time.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 bg-background relative">
                <div className="lg:hidden absolute top-6 left-6">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Leaf className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-lg font-display font-bold text-foreground">FoodShare</span>
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-md animate-fade-up">
                    <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Sign In
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                            Reset Password
                        </h2>
                        <p className="text-muted-foreground">
                            Enter the email associated with your account and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-3 animate-shake">
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 animate-fade-up">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-600 font-medium">{message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="pl-10 h-11 bg-muted/30 focus:bg-background transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Sending Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
