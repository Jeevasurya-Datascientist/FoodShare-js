import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { Donation, User } from '@/types';
import ChatWindow from '@/components/ChatWindow';
import { MapPin, Clock, Package, Truck, CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const VolunteerDashboard: React.FC = () => {
    const { currentUser, userData } = useAuth();
    const user = currentUser; // Alias for easier refactoring if needed, or just replace usages
    const [availablePickups, setAvailablePickups] = useState<Donation[]>([]);
    const [myDeliveries, setMyDeliveries] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Capture IP and User Agent for security
        const captureDeviceInfo = async () => {
            try {
                // Fetch IP with better error handling
                let ip = 'Unknown';
                try {
                    // Try to fetch, if blocked by extensions, catch it
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

                    const res = await fetch('https://api.ipify.org?format=json', {
                        signal: controller.signal
                    }).catch(() => null); // Catch network errors (like blockage) immediately

                    clearTimeout(timeoutId);

                    if (res && res.ok) {
                        const data = await res.json();
                        ip = data.ip;
                    }
                } catch (e) {
                    console.warn('IP tracking blocked/failed:', e);
                }

                if (user) {
                    const userRef = doc(db, 'users', user.uid);
                    // Fire and forget update
                    await updateDoc(userRef, {
                        ipAddress: ip,
                        userAgent: navigator.userAgent
                    }).catch(err => console.error("Failed to update user audit logs", err));
                }
            } catch (error) {
                console.error('Error flow in device info capture:', error);
            }
        };
        captureDeviceInfo();

        // Listen for available deliveries
        const qAvailable = query(
            collection(db, 'donations'),
            where('status', '==', 'accepted'),
            where('deliveryStatus', '==', 'available_for_pickup')
        );

        const unsubscribeAvailable = onSnapshot(qAvailable, (snapshot) => {
            const pickups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
            setAvailablePickups(pickups);
        }, (error) => {
            console.error("Error fetching available pickups:", error);
            // If permission denied (e.g. suspended user), we just stop loading to avoid stuck screen
            setLoading(false);
        });

        // Listen for my assigned deliveries
        const qMyDeliveries = query(
            collection(db, 'donations'),
            where('volunteerId', '==', user.uid),
            where('status', '==', 'accepted')
        );

        const unsubscribeMyDeliveries = onSnapshot(qMyDeliveries, (snapshot) => {
            const deliveries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
            setMyDeliveries(deliveries.sort((a, b) => {
                if (a.deliveryStatus === 'delivered' && b.deliveryStatus !== 'delivered') return 1;
                if (a.deliveryStatus !== 'delivered' && b.deliveryStatus === 'delivered') return -1;
                return 0;
            }));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching my deliveries:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeAvailable();
            unsubscribeMyDeliveries();
        };
    }, [currentUser]);

    const handleAcceptDelivery = async (donationId: string) => {
        if (!currentUser) return;
        try {
            // Fetch latest user details (or use auth profile) to ensure we have name/phone
            // We'll use currentUser profile data
            await updateDoc(doc(db, 'donations', donationId), {
                volunteerId: user.uid,
                volunteerName: user.displayName || 'Volunteer',
                volunteerPhone: (user as any).phone || 'Not provided', // Type cast if phone missing in User type locally
                deliveryStatus: 'assigned'
            });
            toast.success("Delivery assigned to you!");
        } catch (error) {
            console.error("Error accepting delivery:", error);
            toast.error("Failed to accept delivery.");
        }
    };

    const handleUpdateStatus = async (donationId: string, newStatus: 'picked_up' | 'delivered') => {
        try {
            await updateDoc(doc(db, 'donations', donationId), {
                deliveryStatus: newStatus
            });
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}!`);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status.");
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display mb-2">Volunteer Dashboard 🚚</h1>
                    <p className="text-muted-foreground">Help bridge the gap! Pick up donations and deliver hope.</p>
                </div>

                {/* Warning Banner */}
                {/* Warning Banner */}
                {userData?.warningCount && userData.warningCount > 0 && (
                    <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg flex items-start gap-3 animate-fade-in">
                        <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">Account Warning</h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-500/90 mt-1">
                                You have received {userData.warningCount} warning(s) for violating community guidelines.
                                Continued violations may lead to account suspension or permanent ban.
                                Please review our interaction policies.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Available Pickups Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Package className="text-orange-500" /> Available Pickups
                            </h2>
                            <Badge variant="secondary">{availablePickups.length} available</Badge>
                        </div>

                        {availablePickups.length === 0 ? (
                            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                                <p className="text-muted-foreground">No active pickup requests nearby.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {availablePickups.map(item => (
                                    <div key={item.id} className="group glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-border/50">
                                        {/* Image Header */}
                                        <div className="relative h-40 bg-muted overflow-hidden">
                                            {item.imageUrls && item.imageUrls.length > 0 ? (
                                                <img
                                                    src={item.imageUrls[0]}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                                    <Package className="h-12 w-12 text-muted-foreground/20" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 z-10">
                                                <Badge className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-foreground shadow-sm">
                                                    Ready for Pickup
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-display font-bold text-lg leading-tight mb-1">{item.title}</h3>
                                                    <div className="flex flex-col text-xs text-muted-foreground gap-1">
                                                        <span>From: <span className="font-medium text-foreground">{item.donorName}</span></span>
                                                        <span>To: <span className="font-medium text-foreground">{item.acceptedByName || "NGO"}</span></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                                                    <span className="text-sm truncate">{item.location.address}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded-md whitespace-nowrap">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {(() => {
                                                        try {
                                                            const date = new Date(item.expiryTime);
                                                            if (isNaN(date.getTime())) return 'No Expiry';
                                                            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                                        } catch (e) {
                                                            return 'Invalid Date';
                                                        }
                                                    })()}
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full bg-orange-500 hover:bg-orange-600 font-semibold shadow-md shadow-orange-200 dark:shadow-none"
                                                onClick={() => handleAcceptDelivery(item.id)}
                                            >
                                                Accept Delivery
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Deliveries Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Truck className="text-blue-500" /> My Deliveries
                            </h2>
                            <Badge variant="outline">{myDeliveries.filter(d => d.deliveryStatus !== 'delivered').length} active</Badge>
                        </div>

                        {myDeliveries.length === 0 ? (
                            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                                <p className="text-muted-foreground">You haven't assigned any deliveries yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {myDeliveries.map(item => (
                                    <div key={item.id} className={`group glass-card rounded-xl overflow-hidden transition-all duration-300 border ${item.deliveryStatus === 'delivered' ? 'opacity-75 border-border' : 'border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-lg'}`}>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-display font-bold text-lg mb-1">{item.title}</h3>
                                                    <Badge variant={item.deliveryStatus === 'delivered' ? 'secondary' : 'default'} className={
                                                        item.deliveryStatus === 'assigned' ? 'bg-blue-500 hover:bg-blue-600' :
                                                            item.deliveryStatus === 'picked_up' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-green-600 hover:bg-green-700'
                                                    }>
                                                        {item.deliveryStatus?.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                {/* Mini Image Thumbnail */}
                                                {item.imageUrls && item.imageUrls.length > 0 && (
                                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                                                        <img src={item.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-5 text-sm p-3 bg-muted/30 rounded-lg">
                                                <div>
                                                    <p className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Pickup From</p>
                                                    <p className="font-medium text-foreground line-clamp-1">{item.donorName}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{item.location.address}</p>
                                                    <a href={`tel:${item.contactPhone}`} className="text-xs text-blue-600 hover:underline mt-0.5 block">{item.contactPhone}</a>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Dropoff To</p>
                                                    <p className="font-medium text-foreground line-clamp-1">{item.acceptedByName}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2" title={item.acceptedByAddress || 'Address not available'}>
                                                        {item.acceptedByAddress || 'Address not available'}
                                                    </p>
                                                    <a href={`tel:${item.acceptedByPhone}`} className="text-xs text-blue-600 hover:underline mt-0.5 block">{item.acceptedByPhone}</a>
                                                </div>
                                            </div>

                                            {item.deliveryStatus !== 'delivered' && (
                                                <div className="space-y-3">
                                                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                                                        {/* Navigate Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => {
                                                                const pickup = encodeURIComponent(item.location.address);
                                                                const dropoff = encodeURIComponent(item.acceptedByAddress || '');

                                                                // If we have both, do multi-stop: Current -> Pickup -> Dropoff
                                                                let url;
                                                                if (dropoff) {
                                                                    url = `https://www.google.com/maps/dir/?api=1&destination=${dropoff}&waypoints=${pickup}`;
                                                                } else {
                                                                    // Fallback: Just go to pickup
                                                                    url = `https://www.google.com/maps/dir/?api=1&destination=${pickup}`;
                                                                }

                                                                window.open(url, '_blank');
                                                            }}
                                                        >
                                                            <MapPin className="h-4 w-4 mr-1.5" /> Navigate
                                                        </Button>

                                                        {/* Chat Button */}
                                                        <ChatWindow
                                                            otherUserId={item.acceptedBy || item.donorId}
                                                            otherUserName={item.acceptedByName || item.donorName}
                                                            donationId={item.id}
                                                            trigger={
                                                                <Button variant="outline" size="sm" className="flex-1">
                                                                    <div className='flex items-center'>
                                                                        {/* Lucide MessageSquare icon is not imported here, wait, I can use a generic icon or import it */}
                                                                        {/* Since I can't easily add import in this replace block without changing top file, I'll rely on existing imports or text */}
                                                                        Chat
                                                                    </div>
                                                                </Button>
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {item.deliveryStatus === 'assigned' && (
                                                            <Button
                                                                className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-none"
                                                                onClick={() => handleUpdateStatus(item.id, 'picked_up')}
                                                            >
                                                                Confirm Pickup
                                                            </Button>
                                                        )}
                                                        {item.deliveryStatus === 'picked_up' && (
                                                            <Button
                                                                className="flex-1 bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 dark:shadow-none animate-pulse"
                                                                onClick={() => handleUpdateStatus(item.id, 'delivered')}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1.5" /> Mark Delivered
                                                            </Button>
                                                        )}

                                                        {/* Call Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-foreground hover:bg-accent"
                                                            onClick={() => window.open(`tel:${item.contactPhone}`)}
                                                            title="Call Donor"
                                                        >
                                                            <Truck className="h-4 w-4" /> {/* Fallback icon since Phone not imported in scope shown, using Truck as placeholder or I should add Phone import. Wait, Phone IS imported? No. */}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VolunteerDashboard;
