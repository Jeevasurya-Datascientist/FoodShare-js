import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const Terms = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-display mb-6">Terms and Conditions</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Agreement to Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[60vh] rounded-md border p-4">
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">1. Introduction</h3>
                                    <p>Welcome to Food Connect Hub. By accessing or using our website and services, you agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">2. User Accounts</h3>
                                    <p>To access certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">3. Acceptable Use</h3>
                                    <p>You agree not to use the platform for any unlawful purpose or in any way that interrupts, damages, or impairs the service. Harassment, spamming, and fraudulent activities is strictly prohibited.</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">4. Volunteer Responsibilities</h3>
                                    <p>Volunteers agree to act professionally and safely. Food Connect Hub acts as a connector and is not liable for incidents during pickup or delivery.</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">5. Donation Standards</h3>
                                    <p>Donors warrant that all food donated is safe for consumption and handled in accordance with local health regulations.</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">6. Termination</h3>
                                    <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users.</p>
                                </section>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Terms;
