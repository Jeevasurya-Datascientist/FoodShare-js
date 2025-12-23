import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { User, Donation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Users, Activity, Lock, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Complaint {
    id: string;
    volunteerId: string;
    volunteerName: string;
    ngoId: string;
    donationId: string;
    reason: string;
    createdAt: any;
    status: 'pending' | 'resolved';
}

const AdminDashboard: React.FC = () => {
    const { currentUser, loading: authLoading } = useAuth(); // Destructure loading
    const navigate = useNavigate();
    const [volunteers, setVolunteers] = useState<User[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    // Strict Admin Access Check
    useEffect(() => {
        if (authLoading) return; // Wait for auth to initialize

        // In production, use Custom Claims or a specific role in DB.
        // For this demo as requested: admin@feedreach / JS12345678
        // We check the email.
        const isAdmin = currentUser?.email === 'admin@foodshare.com' || currentUser?.email === 'admin@feedreach.com' || currentUser?.email === 'admin@timechain.com'; // Allowing fallback

        if (!currentUser || !isAdmin) {
            toast.error("Unauthorized Access. Admins only.");
            navigate('/');
        }
    }, [currentUser, authLoading, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                // Fetch Volunteers
                const usersRef = collection(db, 'users');
                const qVolunteers = query(usersRef, where('role', '==', 'volunteer'));
                const volSnap = await getDocs(qVolunteers);
                const volData = volSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
                setVolunteers(volData);

                // Fetch Complaints
                const complaintsRef = collection(db, 'complaints');
                const qComplaints = query(complaintsRef, orderBy('createdAt', 'desc'));
                const compSnap = await getDocs(qComplaints);
                const compData = compSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
                setComplaints(compData);

                setLoading(false);
            } catch (error) {
                console.error("Admin fetch error:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const handleResolveComplaint = async (id: string) => {
        try {
            await updateDoc(doc(db, 'complaints', id), { status: 'resolved' });
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
            toast.success("Complaint marked as resolved.");
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleUpdateStatus = async (uid: string, status: 'active' | 'suspended' | 'banned') => {
        try {
            let updateData: any = { accountStatus: status };

            if (status === 'suspended') {
                const daysStr = prompt("Enter suspension duration in days:", "1");
                if (daysStr === null) return; // Cancelled
                const days = parseInt(daysStr);
                if (isNaN(days) || days <= 0) {
                    alert("Invalid duration");
                    return;
                }
                const suspendUntil = new Date();
                suspendUntil.setDate(suspendUntil.getDate() + days);
                updateData.suspendedUntil = Timestamp.fromDate(suspendUntil);
            } else if (status === 'active') {
                updateData.suspendedUntil = null; // Clear suspension
                updateData.warningCount = 0; // Optional: Reset warnings on lifting sanction?
            }

            await updateDoc(doc(db, 'users', uid), updateData);
            setVolunteers(prev => prev.map(vol => vol.uid === uid ? { ...vol, ...updateData } : vol));
            toast.success(`User marked as ${status}`);
        } catch (error) {
            console.error("Update status failed", error);
            toast.error("Failed to update user status");
        }
    };

    const handleSendWarning = async (uid: string, count: number) => {
        try {
            await updateDoc(doc(db, 'users', uid), { warningCount: count });
            setVolunteers(prev => prev.map(vol => vol.uid === uid ? { ...vol, warningCount: count } : vol));
            toast.warning(`Warning sent! (Total: ${count})`);
        } catch (error) {
            toast.error("Failed to send warning");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display flex items-center gap-2 text-red-600">
                            <ShieldAlert className="h-8 w-8" /> Admin Panel
                        </h1>
                        <p className="text-muted-foreground">Confidential Area. Authorized Personnel Only.</p>
                    </div>
                </div>

                <Tabs defaultValue="complaints" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
                        <TabsTrigger value="complaints">Complaints</TabsTrigger>
                        <TabsTrigger value="volunteers">Volunteer Monitor</TabsTrigger>
                    </TabsList>

                    <TabsContent value="complaints" className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Active Reports</h2>
                        {complaints.length === 0 ? (
                            <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed">
                                <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-2" />
                                <p>All clean! No complaints found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {complaints.map(complaint => (
                                    <Card key={complaint.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg">Against: {complaint.volunteerName}</h3>
                                                        <Badge variant={complaint.status === 'resolved' ? 'outline' : 'destructive'}>
                                                            {complaint.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-2">Volunteer ID: {complaint.volunteerId}</p>
                                                    <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-red-800 dark:text-red-300 text-sm font-medium">
                                                        "{complaint.reason}"
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {complaint.status !== 'resolved' && (
                                                        <Button size="sm" onClick={() => handleResolveComplaint(complaint.id)}>
                                                            <CheckCircle className="h-4 w-4 mr-2" /> Resolve
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                                                <span>Reported by NGO ID: {complaint.ngoId}</span>
                                                <span>{new Date(complaint.createdAt.seconds * 1000).toLocaleString()}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="volunteers">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    Volunteer Network Data
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                                            <tr>
                                                <th className="p-4">Name / ID</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">IP / Risk</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {volunteers.map(vol => (
                                                <tr key={vol.uid} className={`hover:bg-muted/10 transition-colors ${vol.accountStatus === 'banned' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                                    <td className="p-4">
                                                        <div className="font-semibold flex items-center gap-2">
                                                            {vol.displayName || 'Unknown'}
                                                            {vol.warningCount && vol.warningCount > 0 && (
                                                                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                                                    {vol.warningCount} Warnings
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-mono">{vol.uid}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant={
                                                            vol.accountStatus === 'banned' ? 'destructive' :
                                                                vol.accountStatus === 'suspended' ? 'secondary' : 'default' // 'default' is primary/active-ish
                                                        } className={
                                                            vol.accountStatus === 'active' || !vol.accountStatus ? 'bg-green-500 hover:bg-green-600' : ''
                                                        }>
                                                            {vol.accountStatus || 'active'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-xs">
                                                        <div className="font-mono">{vol.ipAddress || 'Unknown IP'}</div>
                                                        <div className="text-gray-400 truncate max-w-[150px]" title={vol.userAgent}>
                                                            {vol.userAgent || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right space-x-2">
                                                        {vol.accountStatus === 'banned' ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                                onClick={() => handleUpdateStatus(vol.uid, 'active')}
                                                            >
                                                                <CheckCircle className="h-3 w-3 mr-1" /> Unban
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                                                    onClick={() => handleSendWarning(vol.uid, (vol.warningCount || 0) + 1)}
                                                                >
                                                                    <ShieldAlert className="h-3 w-3 mr-1" /> Warn
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                    onClick={() => handleUpdateStatus(vol.uid, vol.accountStatus === 'suspended' ? 'active' : 'suspended')}
                                                                >
                                                                    <Lock className="h-3 w-3 mr-1" /> {vol.accountStatus === 'suspended' ? 'Unsuspend' : 'Suspend'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleUpdateStatus(vol.uid, 'banned')}
                                                                >
                                                                    <Ban className="h-3 w-3 mr-1" /> Ban
                                                                </Button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default AdminDashboard;
