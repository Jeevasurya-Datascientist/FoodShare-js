import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createDonation, uploadImage } from '@/services/donationService';
import { DonationFormData, Location } from '@/types';
import Navbar from '@/components/Navbar';
import LocationPicker from '@/components/LocationPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, AlertCircle, Utensils, Package, Clock, MapPin, Image as ImageIcon, Camera, X, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { analyzeFoodImage } from '@/services/aiService';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Kept generic for now

const foodTypes = [
  'Cooked Food',
  'Raw Vegetables',
  'Fruits',
  'Bakery Items',
  'Dairy Products',
  'Packaged Food',
  'Beverages',
  'Mixed/Other'
];

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  // Add more as needed
];

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const AddDonation: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<DonationFormData>({
    title: '',
    description: '',
    foodType: '',
    quantity: '',
    expiryTime: '',
    location: { lat: 0, lng: 0, address: '' },
    imageUrls: [],
    contactPhone: userData?.phone || '',
    countryCode: '+91'
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof DonationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (location: Location) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + imageFiles.length > 7) {
        toast({
          title: "Limit Exceeded",
          description: "You can only upload up to 7 images.",
          variant: "destructive"
        });
        return;
      }
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    if (imageFiles.length <= 1) setAiAnalysis(null); // Clear analysis if all images removed
  };

  const handleAnalyzeFood = async () => {
    if (imageFiles.length === 0) {
      toast({
        title: "No Image",
        description: "Please upload an image first to analyze.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      // Convert first file to base64
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const result = await analyzeFoodImage(base64String);
          setAiAnalysis(result);
          toast({
            title: "Analysis Complete",
            description: `Food Safety Score: ${result.freshnessScore}/100`,
          });

          // Auto-fill tags if reliable
          if (result.tags && result.tags.length > 0) {
            // Optional: could append to description
          }
        } catch (err: any) {
          toast({
            title: "Analysis Failed",
            description: err.message,
            variant: "destructive"
          });
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.foodType || !formData.quantity || !formData.expiryTime || !formData.contactPhone) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.location.address) {
      setError('Please select or enter a pickup location');
      return;
    }

    if (!currentUser || !userData) {
      setError('You must be logged in to create a donation');
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        try {
          const url = await uploadImage(file, currentUser.uid);
          uploadedUrls.push(url);
        } catch (uploadErr) {
          console.error("Failed to upload image:", uploadErr);
          // Verify if we should abort or continue with partial images. 
          // Continuing for now but warning user could be better.
        }
      }

      await createDonation(
        currentUser.uid,
        userData.displayName,
        userData.phone,
        {
          ...formData,
          imageUrls: uploadedUrls
        }
      );

      toast({
        title: 'Donation created!',
        description: 'Your donation is now visible to nearby NGOs.',
      });

      navigate('/donor/dashboard');
    } catch (err) {
      console.error('Create donation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create donation';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            to="/donor/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Add New Donation
          </h1>
          <p className="text-muted-foreground">
            Share your surplus food with NGOs in your area
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-up">
          {/* Basic Info */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Utensils className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Food Details</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Fresh lunch from restaurant"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={loading}
                  className="focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the food items, any special handling instructions, etc."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="focus-visible:ring-primary"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foodType">Food Type *</Label>
                  <Select
                    value={formData.foodType}
                    onValueChange={(value) => handleInputChange('foodType', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="focus:ring-primary">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    placeholder="e.g., 20 servings"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    disabled={loading}
                    className="focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timing & Contact */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Timing & Contact</h2>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryTime">Best Before / Pickup By *</Label>
                  <Input
                    id="expiryTime"
                    type="datetime-local"
                    value={formData.expiryTime}
                    onChange={(e) => handleInputChange('expiryTime', e.target.value)}
                    disabled={loading}
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Number *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.countryCode}
                      onValueChange={(val) => handleInputChange('countryCode', val)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-[100px] focus:ring-primary">
                        <SelectValue placeholder="+91" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} ({c.country})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      disabled={loading}
                      className="flex-1 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-info" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Food Images <span className="text-xs text-muted-foreground font-normal">(Max 7)</span></h2>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              disabled={loading}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Upload Button */}
              {imageFiles.length < 7 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
                >
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </button>
              )}

              {/* Previews */}
              {imageFiles.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-border">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* AI Analysis Section */}
            {imageFiles.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-sm">AI Safety Check</h3>
                    <p className="text-xs text-muted-foreground">Verify food freshness and safety</p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAnalyzeFood}
                    disabled={analyzing}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Analyze with AI
                  </Button>
                </div>

                {aiAnalysis && (
                  <div className={`p-4 rounded-lg border ${aiAnalysis.isEdible ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'} animate-fade-in`}>
                    <div className="flex items-start gap-3">
                      {aiAnalysis.isEdible ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${aiAnalysis.isEdible ? 'text-green-700' : 'text-red-700'}`}>
                            {aiAnalysis.isEdible ? 'Likely Safe to Share' : 'Safety Concerns Detected'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white border font-mono">
                            Score: {aiAnalysis.freshnessScore}/100
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 mb-2">{aiAnalysis.safetyNotes}</p>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.tags?.map((tag: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-1 rounded bg-white/50 border text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Pickup Location *</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              You can manually type the address if the map doesn't load.
            </p>

            <LocationPicker
              value={formData.location}
              onChange={handleLocationChange}
              apiKey={GOOGLE_MAPS_API_KEY}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate('/donor/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating Donation...
                </>
              ) : (
                'Create Donation'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddDonation;
