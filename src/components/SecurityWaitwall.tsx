import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Ban, Lock, LogOut, Mail } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

interface SecurityWaitwallProps {
    children: React.ReactNode;
}

const SecurityWaitwall: React.FC<SecurityWaitwallProps> = ({ children }) => {
    const { userData, loading } = useAuth();
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!userData || userData.accountStatus !== 'suspended' || !userData.suspendedUntil) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            // Handle both Firestore Timestamp and regular Date objects just in case
            const until = userData.suspendedUntil instanceof Timestamp
                ? userData.suspendedUntil.toDate().getTime()
                : new Date(userData.suspendedUntil!).getTime();

            const distance = until - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("Suspension Expired. Please refresh.");
                // Optionally auto-refresh or update status if we had a cloud function
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [userData]);

    if (loading) return null;

    if (userData?.accountStatus === 'banned') {
        return (
            <div className="min-h-screen bg-destructive/10 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-background rounded-2xl shadow-xl border-2 border-destructive p-8 text-center animate-in zoom-in-95 duration-300">
                    <div className="h-20 w-20 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                        <Ban className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-destructive mb-2">Account Permanently Banned</h1>
                    <p className="text-muted-foreground mb-6">
                        Your access to FeedReach has been revoked due to serious violations of our community guidelines.
                    </p>

                    <div className="bg-muted p-4 rounded-lg text-left text-sm mb-6 space-y-3">
                        <div className="font-semibold flex items-center gap-2">
                            <Mail className="h-4 w-4" /> Appeal Contact:
                        </div>
                        <code className="block bg-background p-2 rounded border select-all">
                            jeevasurya.iotlab@gmail.com
                        </code>
                        <p className="text-xs text-muted-foreground">
                            Please provide a clear explanation of <strong>Why</strong>, <strong>Which</strong> action caused this, and <strong>How</strong> it happened.
                        </p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 p-3 rounded text-xs text-yellow-700 dark:text-yellow-500 mb-6">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        <strong>Disclaimer:</strong> Email approval is for appeal verification only. Un-ban is not guaranteed.
                    </div>

                    <Button variant="outline" onClick={() => signOut(auth)} className="w-full">
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                </div>
            </div>
        );
    }

    if (userData?.accountStatus === 'suspended') {
        return (
            <div className="min-h-screen bg-orange-50 dark:bg-orange-950/10 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-background rounded-2xl shadow-xl border-2 border-orange-500 p-8 text-center">
                    <div className="h-20 w-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-orange-700 mb-2">Account Suspended</h1>
                    <p className="text-muted-foreground mb-6">
                        Your account is temporarily locked. You cannot receive requests or access data during this time.
                    </p>

                    <div className="text-4xl font-mono font-bold text-foreground mb-2">
                        {timeLeft || "Calculating..."}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">Time Remaining</p>

                    <Button variant="outline" onClick={() => signOut(auth)} className="w-full">
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default SecurityWaitwall;
