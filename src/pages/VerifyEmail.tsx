import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

const VerifyEmail = () => {
    const { currentUser, sendVerificationEmail, logout } = useAuth();
    const navigate = useNavigate();
    const [sending, setSending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Initial check and auto-redirect if verified
    useEffect(() => {
        const checkVerified = async () => {
            if (currentUser) {
                await currentUser.reload();
                if (currentUser.emailVerified) {
                    navigate('/');
                }
            } else {
                navigate('/login');
            }
        };

        const interval = setInterval(checkVerified, 3000);
        return () => clearInterval(interval);
    }, [currentUser, navigate]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0) return;

        try {
            setSending(true);
            await sendVerificationEmail();
            toast({
                title: "Email Sent",
                description: "Verification link has been sent to your email.",
            });
            setCountdown(60); // 60s cooldown
        } catch (error: any) {
            console.error("Error sending verification email:", error);

            // Handle "too many requests" error gracefully
            if (error.code === 'auth/too-many-requests') {
                toast({
                    title: "Please Wait",
                    description: "You've sent too many requests. Please wait a few minutes before trying again.",
                    variant: "destructive"
                });
                setCountdown(60);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to send verification email. Please try again later.",
                    variant: "destructive"
                });
            }
        } finally {
            setSending(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Panel - Hero/Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-primary/5 p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl opacity-50" />

                <div className="relative z-10 text-center max-w-lg">
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <Mail className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-foreground mb-6">
                        Verify Your Email
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        We need to verify your identity to ensure the safety and trust of the FeedReach community.
                    </p>
                </div>
            </div>

            {/* Right Panel - Content */}
            <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-background relative">
                <div className="mx-auto w-full max-w-sm animate-fade-up text-center lg:text-left">
                    <div className="mb-8">
                        <div className="lg:hidden h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                            Check your inbox
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            We've sent a verification link to <span className="font-semibold text-foreground">{currentUser.email}</span>.
                            <br />
                            Please click the link to verify your account.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-11 border-primary/20 hover:border-primary/50 text-foreground"
                            onClick={() => window.location.reload()}
                        >
                            <span className="mr-2">I've verified my email</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Didn't receive the email?
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="default"
                            className="w-full h-11"
                            onClick={handleResend}
                            disabled={sending || countdown > 0}
                        >
                            {sending ? (
                                <>Sending...</>
                            ) : countdown > 0 ? (
                                <>Resend in {countdown}s</>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Resend Verification Email
                                </>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-foreground"
                            onClick={handleLogout}
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
