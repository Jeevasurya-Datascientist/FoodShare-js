import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Donation } from '@/types';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import iconMarker2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconMarker2x,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
});

interface DonationMapProps {
    donations: Donation[];
}

const DonationMap: React.FC<DonationMapProps> = ({ donations }) => {
    const navigate = useNavigate();
    const [activeDonations, setActiveDonations] = useState<Donation[]>([]);

    useEffect(() => {
        // Filter donations that have valid coordinates and are pending
        const valid = donations.filter(
            d => d.status === 'pending' && d.location.lat !== 0 && d.location.lng !== 0
        );
        setActiveDonations(valid);
    }, [donations]);

    // Default center (e.g., Chennai/India or generic)
    const defaultCenter: [number, number] = [11.377573948275739, 77.47531993015663];
    const center = activeDonations.length > 0
        ? [activeDonations[0].location.lat, activeDonations[0].location.lng] as [number, number]
        : defaultCenter;

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-border/50 relative z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {activeDonations.map((donation) => (
                    <Marker
                        key={donation.id}
                        position={[donation.location.lat, donation.location.lng]}
                    >
                        <Popup className="premium-popup">
                            <div className="p-1 min-w-[200px]">
                                <h3 className="font-bold text-base mb-1">{donation.title}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{donation.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate max-w-[150px]">{donation.location.address}</span>
                                </div>
                                {donation.imageUrls && donation.imageUrls.length > 0 && (
                                    <img src={donation.imageUrls[0]} alt={donation.title} className="w-full h-24 object-cover rounded-md mb-3" />
                                )}
                                <Button
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={() => navigate(donation.donorId ? '/donor/dashboard' : '/ngo/dashboard')} // Ideally navigate to donation detail
                                >
                                    View Details
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay Legend */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-md z-[400] text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500 block"></span>
                    <span className="font-semibold text-gray-800">Available Donation</span>
                </div>
                <div className="text-gray-500 mt-1">
                    {activeDonations.length} donations near you
                </div>
            </div>
        </div>
    );
};

export default DonationMap;
