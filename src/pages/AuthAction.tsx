import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Loader2, CheckCircle2, AlertCircle, ArrowRight, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


const AuthAction = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const mode = searchParams.get('mode');
    const actionCode = searchParams.get('oobCode');

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [verified, setVerified] = useState(false);


    useEffect(() => {
        // Initial Verification of the Code
        const verifyCode = async () => {
            if (!actionCode) {
                setError('Invalid or missing action code.');
                setLoading(false);
                return;
            }

            try {
                if (mode === 'resetPassword') {
                    const email = await verifyPasswordResetCode(auth, actionCode);
                    setEmail(email);
                } else if (mode === 'verifyEmail') {
                    await applyActionCode(auth, actionCode);
                    setVerified(true);
                    setSuccess('Your email has been successfully verified.');
                } else if (mode === 'recoverEmail') {
                    // Less common, but good to handle or ignore
                    setError('Email recovery is not supported via this form yet. Please contact support.');
                } else {
                    setError('Unknown action mode.');
                }
            } catch (err: any) {
                console.error("Auth Action Error:", err);
                if (err.code === 'auth/expired-action-code') {
                    setError('The link has expired. Please request a new one.');
                } else if (err.code === 'auth/invalid-action-code') {
                    setError('The link is invalid or has already been used.');
                } else {
                    setError(err.message || 'An error occurred while processing your request.');
                }
            } finally {
                setLoading(false);
            }
        };

        verifyCode();
    }, [actionCode, mode]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            if (actionCode) {
                await confirmPasswordReset(auth, actionCode, newPassword);
                setSuccess('Password has been reset successfully! You can now login with your new password.');
                setVerified(true); // Re-use verified state to show success UI
                // Optional: Auto redirect after few seconds, or let user click
            }
        } catch (err: any) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------------------------
    // Render Logic
    // ----------------------------------------------------------------------

    // 1. Loading State
    if (loading && !email && !verified && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Verifying link...</p>
                </div>
            </div>
        );
    }

    // 2. Generic Error State
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-foreground mb-2">Link Expired or Invalid</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Link to="/login">
                        <Button variant="outline" className="w-full">Back to Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // 3. Email Verified Success (or Password Reset Success)
    if (verified || success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm text-center animate-fade-up">
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                        {mode === 'resetPassword' ? 'Password Reset!' : 'Email Verified!'}
                    </h2>
                    <p className="text-muted-foreground mb-8 text-lg">
                        {success || 'Your email address has been successfully verified. You now have full access to FeedReach.'}
                    </p>
                    <Link to="/login">
                        <Button variant="hero" size="lg" className="w-full h-12 text-base">
                            Continue to Login
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // 4. Reset Password Form
    if (mode === 'resetPassword') {
        return (
            <div className="min-h-screen grid lg:grid-cols-2">
                {/* Left Panel - Branding */}
                <div className="hidden lg:relative lg:flex flex-col justify-between bg-zinc-900 p-12 overflow-hidden text-white">
                    <div className="absolute inset-0 bg-primary/20" />
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50" />

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Leaf className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-display font-bold text-white">FeedReach</span>
                        </Link>
                    </div>

                    <div className="relative z-10 max-w-md">
                        <h1 className="text-4xl font-display font-bold mb-6 leading-tight">
                            Secure Your Account
                        </h1>
                        <p className="text-lg text-white/70 mb-8">
                            Create a strong password to protect your donations and community impact.
                        </p>
                    </div>
                    <div className="relative z-10 text-sm text-white/50">
                        Secure Password Reset
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-background relative">
                    <div className="mx-auto w-full max-w-md animate-fade-up">
                        <div className="mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Set New Password</h2>
                            <p className="text-muted-foreground">
                                Resetting password for <span className="font-semibold text-foreground">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11"
                                    required
                                />
                            </div>



                            <Button type="submit" className="w-full h-11 text-base group" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        Reset Password
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div >
            </div >
        );
    }

    // Fallback
    return <div className="p-10 text-center">Loading Action...</div>;
};

export default AuthAction;
