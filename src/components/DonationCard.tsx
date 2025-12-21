import React, { useState } from 'react';
import { Donation, DonationStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Clock,
  User,
  Phone,
  Utensils,
  Package,
  Edit,
  Trash2,
  CheckCircle,
  Navigation,
  XCircle,
  Star,
  ArrowLeft,
  ArrowRight,
  Truck,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SocialShare from '@/components/SocialShare';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import ReviewModal from './ReviewModal';
import ChatWindow from '@/components/ChatWindow';

interface DonationCardProps {
  donation: Donation;
  userRole: 'donor' | 'ngo';
  onEdit?: (donation: Donation) => void;
  onDelete?: (donationId: string) => void;
  onAccept?: (donation: Donation) => void;
  onUpdateStatus?: (donationId: string, status: DonationStatus) => void;
}

const statusConfig: Record<DonationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'status-pending' },
  accepted: { label: 'Accepted', className: 'status-accepted' },
  completed: { label: 'Completed', className: 'status-completed' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' }
};

const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  userRole,
  onEdit,
  onDelete,
  onAccept,
  onUpdateStatus
}) => {
  const { currentUser } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getGoogleMapsLink = () => {
    if (donation.location.lat !== 0 || donation.location.lng !== 0) {
      return `https://www.google.com/maps/dir/?api=1&destination=${donation.location.lat},${donation.location.lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(donation.location.address)}`;
  };

  const { label, className } = statusConfig[donation.status] || { label: donation.status, className: 'bg-gray-100 text-gray-800' };

  return (
    <div className={`group glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-border/50 ${donation.status === 'completed' ? 'opacity-90' : ''}`}>

      {/* Image Banner Section */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {donation.imageUrls && donation.imageUrls.length > 0 ? (
          <>
            <img
              src={donation.imageUrls[currentImageIndex]}
              alt={`${donation.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Carousel Controls */}
            {donation.imageUrls.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === 0 ? donation.imageUrls.length - 1 : prev - 1);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === donation.imageUrls.length - 1 ? 0 : prev + 1);
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {/* Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {donation.imageUrls.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentImageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <Utensils className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}

        {/* Floating Status Badge - Top Left */}
        <div className="absolute top-3 left-3 z-10 transition-transform duration-300 hover:scale-105">
          <Badge variant="secondary" className={`${className} shadow-lg backdrop-blur-md bg-white/90 dark:bg-black/80 border-0 px-3 py-1 font-semibold`}>
            {label}
          </Badge>
        </div>

        {/* Share Button - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <SocialShare
            title={donation.title}
            text={`Check out this donation: ${donation.title} at ${donation.location.address}`}
            url={`${window.location.origin}/?donation=${donation.id}`}
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg bg-white/90 dark:bg-black/80 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 border-0 h-8 w-8"
          />
        </div>
      </div>

      <div className="p-5">
        {/* Header Content */}
        <div className="mb-4">
          <h3 className="text-xl font-display font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
            {donation.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {donation.description}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5 p-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <Utensils className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Type</span>
              <span className="text-sm font-medium truncate">{donation.foodType}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Quantity</span>
              <span className="text-sm font-medium truncate">{donation.quantity}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Expires</span>
              <span className="text-sm font-medium truncate">
                {(() => {
                  try {
                    const date = new Date(donation.expiryTime);
                    if (isNaN(date.getTime())) return donation.expiryTime;
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  } catch (e) {
                    return donation.expiryTime;
                  }
                })()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Donor</span>
              <span className="text-sm font-medium truncate">{donation.donorName}</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 text-sm text-foreground bg-muted/50 p-3 rounded-lg mb-4 hover:bg-muted transition-colors">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2 leading-snug">{donation.location.address}</span>
        </div>

        {/* Contact (Visible if available) */}
        {donation.donorPhone && (
          <div className="flex items-center gap-2 mb-4 px-1">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <a href={`tel:${donation.donorPhone}`} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              {donation.donorPhone}
            </a>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-5 px-1 border-b border-border/40 pb-4">
          <span>Posted {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}</span>
        </div>


        {/* Accepted By Section */}
        {donation.status !== 'pending' && donation.acceptedByName && userRole === 'donor' && (
          <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Accepted By</h4>
                <p className="text-sm font-bold text-foreground">{donation.acceptedByName}</p>
                {donation.acceptedByPhone && (
                  <a href={`tel:${donation.acceptedByPhone}`} className="text-xs text-muted-foreground hover:text-blue-600 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" /> {donation.acceptedByPhone}
                  </a>
                )}
              </div>
              {/* Review Button */}
              {donation.status === 'accepted' && currentUser && (
                <ReviewModal
                  reviewerId={currentUser.uid}
                  reviewerName={currentUser.displayName || 'User'}
                  targetUserId={donation.acceptedBy || ''}
                  donationId={donation.id}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-600">
                      <Star className="h-3.5 w-3.5 mr-1.5" />
                      Rate
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className={`grid gap-2 ${donation.deliveryStatus || userRole === 'ngo' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>

            {userRole === 'donor' && donation.status === 'pending' && (
              <>
                <Button variant="outline" onClick={() => onEdit?.(donation)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" onClick={() => onDelete?.(donation.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </>
            )}

            {userRole === 'ngo' && donation.status === 'pending' && (
              <Button variant="default" className="w-full sm:col-span-2 bg-green-600 hover:bg-green-700" onClick={() => onAccept?.(donation)}>
                <CheckCircle className="h-4 w-4 mr-2" /> Accept Donation
              </Button>
            )}

            {userRole === 'ngo' && donation.status === 'accepted' && (
              <div className="space-y-3 w-full">
                {/* Delivery Request Block */}
                {!donation.deliveryStatus && (
                  <Button variant="default" className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200 dark:shadow-none" onClick={() => onUpdateStatus?.(donation.id, 'available_for_pickup' as any)}>
                    <Truck className="h-4 w-4 mr-2" /> Request Volunteer Pickup
                  </Button>
                )}

                {donation.deliveryStatus === 'available_for_pickup' && (
                  <div className="flex items-center justify-center p-2.5 bg-orange-50 dark:bg-orange-900/10 text-orange-600 border border-orange-200 dark:border-orange-800/30 rounded-lg animate-pulse">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Ordering Volunteer...</span>
                  </div>
                )}

                {/* Volunteer Assigned Info */}
                {(['assigned', 'picked_up', 'delivered'].includes(donation.deliveryStatus || '')) && donation.volunteerId && (
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-bold">Volunteer Assigned</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium text-foreground">{donation.volunteerName || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Contact</p>
                        {donation.volunteerPhone ? (
                          <a href={`tel:${donation.volunteerPhone}`} className="font-medium text-blue-600 hover:underline">{donation.volunteerPhone}</a>
                        ) : <span className="text-muted-foreground">-</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full">
                      <Navigation className="h-4 w-4 mr-2" /> Navigate
                    </Button>
                  </a>
                  <ChatWindow
                    otherUserId={donation.donorId}
                    otherUserName={donation.donorName}
                    donationId={donation.id}
                    trigger={
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" /> Chat (Donor)
                      </Button>
                    }
                  />
                </div>

                {donation.volunteerId && (
                  <ChatWindow
                    otherUserId={donation.volunteerId}
                    otherUserName={donation.volunteerName}
                    donationId={donation.id}
                    trigger={
                      <Button variant="outline" className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50">
                        <MessageSquare className="h-4 w-4 mr-2" /> Chat with Volunteer
                      </Button>
                    }
                  />
                )}

                {/* Completion / Report Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  {donation.deliveryStatus === 'delivered' ? (
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none animate-pulse"
                      onClick={() => {
                        if (confirm('Confirm receipt?')) onUpdateStatus?.(donation.id, 'completed');
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Confirm Receipt
                    </Button>
                  ) : (
                    <Button variant="ghost" className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => onUpdateStatus?.(donation.id, 'completed')}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Complete
                    </Button>
                  )}

                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => onUpdateStatus?.(donation.id, 'cancelled')}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>

                {/* Report Volunteer */}
                {(['assigned', 'picked_up'].includes(donation.deliveryStatus || '')) && donation.volunteerId && (
                  <button
                    className="w-full py-2 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100"
                    onClick={async () => {
                      const reason = prompt("Describe the issue with this volunteer:");
                      if (reason) {
                        try {
                          await addDoc(collection(db, 'complaints'), {
                            volunteerId: donation.volunteerId,
                            volunteerName: donation.volunteerName,
                            ngoId: currentUser?.uid,
                            donationId: donation.id,
                            reason,
                            createdAt: new Date(),
                            status: 'pending'
                          });
                          alert("Report submitted.");
                        } catch (e) { console.error(e); }
                      }
                    }}
                  >
                    <AlertTriangle className="h-3 w-3" /> Report Volunteer Issue
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Donor Chat with NGO - Redesigned */}
          {userRole === 'donor' && donation.acceptedBy && donation.status !== 'completed' && donation.status !== 'cancelled' && (
            <ChatWindow
              otherUserId={donation.acceptedBy}
              otherUserName={donation.acceptedByName}
              donationId={donation.id}
              trigger={
                <Button variant="secondary" className="w-full shadow-sm">
                  <MessageSquare className="h-4 w-4 mr-2" /> Chat with {donation.acceptedByName}
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationCard;
