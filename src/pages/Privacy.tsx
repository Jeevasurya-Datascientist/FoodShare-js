import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-display mb-6">Privacy Policy</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Your Privacy Matters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                            <ShieldAlert className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Important: Volunteer Data Collection</AlertTitle>
                            <AlertDescription>
                                For security and accountability, we collect specific technical data from our volunteers. By using the platform as a volunteer, you explicitly consent to the collection of your Digital Fingerprint.
                            </AlertDescription>
                        </Alert>

                        <ScrollArea className="h-[60vh] rounded-md border p-4">
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">1. Data Collection Overview</h3>
                                    <p>We collect information you provide directly to us, such as your name, email, phone number, and address when you create an account.</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">2. Technical Data & Security Logs</h3>
                                    <p>To ensure the safety of our community and prevent fraud, especially regarding detailed pickup locations, we automatically collect the following from active users (specifically Volunteers):</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 bg-muted p-2 rounded">
                                        <li><strong>IP Address:</strong> To verify location consistency and detect suspicious network activity.</li>
                                        <li><strong>User ID:</strong> Your unique system identifier.</li>
                                        <li><strong>Browser Fingerprint / User Agent:</strong> Information about your browser type, version, and operating system to enable device identifiers.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">3. How We Use Your Data</h3>
                                    <p>We use your information to facilitate food donation, coordinate pickups, improve our services, and communicate with you. Technical data is used strictly for security auditing and fraud prevention.</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">4. Data Sharing</h3>
                                    <p>We do not sell your personal data. We share necessary contact details between Donors, NGOs, and Volunteers solely for the purpose of completing a donation hand-off.</p>
                                </section>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Privacy;
