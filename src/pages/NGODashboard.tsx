import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Donation, DonationStatus } from '@/types';
import {
  subscribeToAvailableDonations,
  subscribeToNGOAcceptedDonations,
  acceptDonation,
  updateDonationStatus
} from '@/services/donationService';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import DonationCard from '@/components/DonationCard';
import InventoryManager from '@/components/InventoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Package, Clock, CheckCircle, Search, Filter, ClipboardList } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const NGODashboard: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const unsubAvailable = subscribeToAvailableDonations(
      (donations) => {
        setAvailableDonations(donations);
        setLoading(false);
      },
      (err) => {
        console.error("Available donations error:", err);
        toast({
          title: "Error loading donations",
          description: err.message,
          variant: "destructive"
        });
        setLoading(false);
      }
    );

    const unsubMy = subscribeToNGOAcceptedDonations(
      currentUser.uid,
      (donations) => {
        setMyDonations(donations);
      },
      (err) => {
        console.error("My pickups error:", err);
        // Optional: toast or state for this specific error
      }
    );

    return () => {
      unsubAvailable();
      unsubMy();
    };
  }, [currentUser]);

  const handleAccept = async (donation: Donation) => {
    if (!currentUser || !userData) return;

    try {
      await acceptDonation(
        donation.id,
        currentUser.uid,
        userData.organizationName || userData.displayName,
        userData.phone,
        userData.address // Pass address
      );
      toast({
        title: 'Donation accepted!',
        description: 'Navigate to the pickup location to collect the food.',
      });
      setActiveTab('my-pickups');
    } catch (err) {
      console.error('Accept error:', err);
      toast({
        title: 'Error',
        description: 'Failed to accept donation.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (donationId: string, status: any) => { // relaxing type to allow delivery status strings
    try {
      // Check if this is a delivery status update or main status update
      const deliveryStatuses = ['available_for_pickup', 'assigned', 'picked_up', 'delivered'];

      if (deliveryStatuses.includes(status)) {
        // Direct update for delivery status fields
        await updateDoc(doc(db, 'donations', donationId), {
          deliveryStatus: status,
          updatedAt: new Date()
        });
      } else {
        // Regular status update (pending -> accepted -> completed -> cancelled)
        await updateDonationStatus(donationId, status);
      }

      toast({
        title: 'Status updated',
        description: `Donation updated to ${status}.`,
      });
    } catch (err) {
      console.error('Update status error:', err);
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  const stats = {
    available: availableDonations.length,
    myPending: myDonations.filter(d => d.status === 'accepted').length,
    completed: myDonations.filter(d => d.status === 'completed').length,
  };

  const filteredAvailable = availableDonations.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-1">
              Welcome, {userData?.organizationName || userData?.displayName}!
            </h1>
            <p className="text-muted-foreground">Find and manage food donations for your community</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search food, location..."
                className="pl-9 bg-muted/40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Available</p>
                <p className="text-2xl font-bold text-foreground">{stats.available}</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">To Pickup</p>
                <p className="text-2xl font-bold text-foreground">{stats.myPending}</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Completed</p>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/40 p-1 rounded-xl flex-wrap h-auto w-full justify-start overflow-x-auto">
            <TabsTrigger value="available" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none">
              <Package className="h-4 w-4 mr-2" />
              Available Donations
              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{stats.available}</span>
            </TabsTrigger>
            <TabsTrigger value="my-pickups" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none">
              <Clock className="h-4 w-4 mr-2" />
              My Pickups
              <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{myDonations.length}</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none">
              <ClipboardList className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="animate-fade-in">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading available donations...</p>
              </div>
            ) : filteredAvailable.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No donations found</h2>
                <p className="text-muted-foreground max-w-md">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new food donations in your area.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAvailable.map((donation) => (
                  <DonationCard
                    key={donation.id}
                    donation={donation}
                    userRole="ngo"
                    onAccept={handleAccept}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-pickups" className="animate-fade-in">
            {myDonations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Clock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No pickups yet</h2>
                <p className="text-muted-foreground max-w-md">
                  Accept available donations to see them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myDonations.map((donation) => (
                  <DonationCard
                    key={donation.id}
                    donation={donation}
                    userRole="ngo"
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="animate-fade-in">
            <div className="glass-card rounded-xl p-6">
              <InventoryManager />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default NGODashboard;
