import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, uploadUserAvatar, getUserStats } from '@/services/userService';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Camera, User, Phone, MapPin, Building2, Save, X, Edit2, Award, Heart, Users } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const Profile: React.FC = () => {
    const { currentUser, userData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalDonations: 0, peopleFed: 0, karmaPoints: 0 });

    // Form State
    const [displayName, setDisplayName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [address, setAddress] = useState(''); // Added address state

    useEffect(() => {
        if (userData) {
            setDisplayName(userData.displayName || '');
            setPhone(userData.phone || '');
            setBio(userData.bio || '');
            setOrganizationName(userData.organizationName || '');
            setPhotoURL(userData.photoURL || '');
            setAddress(userData.address || ''); // Load address

            // Load Stats
            if (currentUser) {
                getUserStats(currentUser.uid).then(setStats);
            }
        }
    }, [userData, currentUser]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentUser) {
            const file = e.target.files[0];
            try {
                setLoading(true);
                const url = await uploadUserAvatar(file, currentUser.uid);
                setPhotoURL(url);
                await updateUserProfile(currentUser.uid, { photoURL: url });
                toast({ title: "Profile picture updated!" });
            } catch (error) {
                console.error("Avatar upload failed:", error);
                toast({ title: "Failed to upload image", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;

        // Validation for NGO
        if (userData.role === 'ngo' && !address.trim()) {
            toast({ title: "Address is required for NGOs", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await updateUserProfile(currentUser.uid, {
                displayName,
                phone,
                bio,
                organizationName,
                address // Save address
            });
            setIsEditing(false);
            toast({ title: "Profile updated successfully!" });
        } catch (error) {
            console.error("Profile update failed:", error);
            toast({ title: "Failed to update profile", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!currentUser?.email) return;
        try {
            await sendPasswordResetEmail(auth, currentUser.email);
            toast({ title: "Password reset email sent", description: "Check your inbox to reset your password." });
        } catch (error) {
            toast({ title: "Error sending reset email", variant: "destructive" });
        }
    };

    if (!userData) return null;

    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-display font-bold text-foreground mb-8">My Profile</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Actions */}
                    <div className="space-y-6">
                        {/* Avatar Card */}
                        <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center">
                            <div className="relative mb-4 group">
                                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/10">
                                    {photoURL ? (
                                        <img src={photoURL} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-muted flex items-center justify-center">
                                            <User className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-8 w-8 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                            <p className="text-muted-foreground text-sm mb-4 capitalize">{userData.role}</p>

                            <div className="w-full pt-4 border-t border-border">
                                <Button variant="outline" className="w-full mb-2" onClick={handlePasswordReset}>
                                    Change Password
                                </Button>
                            </div>
                        </div>

                        {/* Impact Stats */}
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center">
                                <Award className="h-5 w-5 text-primary mr-2" />
                                Lifetime Impact
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Heart className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium">Donations</span>
                                    </div>
                                    <span className="font-bold text-lg">{stats.totalDonations}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-success" />
                                        </div>
                                        <span className="text-sm font-medium">People Fed</span>
                                    </div>
                                    <span className="font-bold text-lg">{stats.peopleFed}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Profile Details */}
                    <div className="md:col-span-2">
                        <div className="glass-card rounded-xl p-6 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Personal Information</h3>
                                {!isEditing ? (
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={loading}>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                        <Button variant="default" size="sm" onClick={handleSave} disabled={loading}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="displayName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="displayName"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {userData.role === 'ngo' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="orgName">Organization Name <span className="text-destructive">*</span></Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="orgName"
                                                value={organizationName}
                                                onChange={(e) => setOrganizationName(e.target.value)}
                                                disabled={!isEditing}
                                                className="pl-9"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address {userData.role === 'ngo' && <span className="text-destructive">*</span>}</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            disabled={!isEditing}
                                            className="pl-9"
                                            placeholder="Full Address (for navigation)"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Required for delivery navigation.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input value={userData.email} disabled className="bg-muted/50" />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio / About</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us a bit about yourself..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        disabled={!isEditing}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
