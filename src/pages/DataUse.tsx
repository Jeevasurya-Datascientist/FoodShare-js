import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const DataUse = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-display mb-6">Data Usage Policy</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>How We Use Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[60vh] rounded-md border p-4">
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">Transparency</h3>
                                    <p>We believe in full transparency regarding how your data is utilized within the Food Connect Hub ecosystem. Data is primarily used to ensure the efficient and safe transfer of food resources.</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">Operational Use</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>Route Optimization:</strong> Addresses are used to calculate optimal delivery routes.</li>
                                        <li><strong>Impact Tracking:</strong> Donation weights and counts are aggregated to generate public impact statistics.</li>
                                        <li><strong>Accountability:</strong> Delivery timestamps and location data are used to verify successful donation hand-offs.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-foreground mb-2">Retention</h3>
                                    <p>We retain donation records indefinitely for historical impact analysis. Personal contact information is minimized in archived records where possible.</p>
                                </section>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DataUse;
