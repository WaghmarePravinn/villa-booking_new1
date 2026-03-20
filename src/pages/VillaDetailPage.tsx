import React, { useState, useEffect } from 'react';
import { MapPin, Star, Users, Bed, Bath, ArrowLeft, Share2, Heart, Check, Phone, ShieldCheck, Utensils, PawPrint, Home, Coffee, Car, UserCheck, Sparkles, Info, ChevronLeft, ChevronRight, Trash2, ArrowLeftRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Villa, SiteSettings, Offer, User, UserRole } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, FirestoreOperationType } from '../firebase';

interface VillaDetailPageProps {
  villaId: string | null;
  onNavigate: (page: string, id?: string) => void;
  villas: Villa[];
  settings: SiteSettings;
  offers: Offer[];
  user?: User | null;
}

export default function VillaDetailPage({ villaId, onNavigate, villas, settings, offers, user }: VillaDetailPageProps) {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!villa?.imageUrls) return;
      if (e.key === 'ArrowLeft') {
        setActiveImage((prev) => (prev - 1 + villa.imageUrls.length) % villa.imageUrls.length);
      } else if (e.key === 'ArrowRight') {
        setActiveImage((prev) => (prev + 1) % villa.imageUrls.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [villa]);

  const updateImages = async (newImages: string[]) => {
    if (!villa) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'villas', villa.id), {
        imageUrls: newImages
      });
    } catch (error) {
      handleFirestoreError(error, FirestoreOperationType.UPDATE, `villas/${villa.id}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteImage = async (idx: number) => {
    if (!villa || !window.confirm('Delete this image?')) return;
    const newImages = [...villa.imageUrls];
    newImages.splice(idx, 1);
    if (activeImage >= newImages.length) {
      setActiveImage(Math.max(0, newImages.length - 1));
    }
    await updateImages(newImages);
  };

  const moveImage = async (from: number, to: number) => {
    if (!villa) return;
    const newImages = [...villa.imageUrls];
    [newImages[from], newImages[to]] = [newImages[to], newImages[from]];
    setActiveImage(to);
    await updateImages(newImages);
  };

  const addImage = async () => {
    if (!villa) return;
    const url = prompt('Enter Image URL:');
    if (url) {
      await updateImages([...villa.imageUrls, url]);
      setActiveImage(villa.imageUrls.length);
    }
  };

  useEffect(() => {
    if (villaId) {
      const found = villas.find(v => v.id === villaId);
      if (found) setVilla(found);
    }
  }, [villaId, villas]);

  if (!villa) return (
    <div className="h-screen flex items-center justify-center bg-stone-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-stone-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-stone-200 rounded"></div>
      </div>
    </div>
  );

  const handleWhatsAppInquiry = () => {
    const activeOffer = offers.find(o => o.id === settings.activeOfferId) || offers.find(o => o.isActive);
    const offerText = activeOffer ? ` I saw the ${activeOffer.title} offer.` : '';
    const message = `Hello Peak Stay Destination! I'm interested in booking ${villa.name} (₹${villa.pricePerNight.toLocaleString()}).${offerText} Is this available for my upcoming trip?`;
    window.open(`https://wa.me/${settings.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-32 md:pb-20">
      {/* Mobile Header Overlay */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center p-4 md:hidden">
        <button 
          onClick={() => onNavigate('villas')}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-stone-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex space-x-2">
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-stone-800">
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-stone-800"
          >
            <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} className={isLiked ? 'text-red-500' : ''} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden bg-stone-200">
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={villa.imageUrls?.[activeImage]} 
            alt={villa.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        {/* Gallery Thumbnails - Desktop */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex items-center space-x-3 bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/10">
          {villa.imageUrls?.map((img, idx) => (
            <div key={idx} className="relative group/thumb">
              <button 
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-amber-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
              
              {isAdmin && (
                <div className="absolute -top-2 -right-2 flex flex-col gap-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteImage(idx)}
                    className="bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600"
                  >
                    <Trash2 size={10} />
                  </button>
                  <div className="flex gap-0.5">
                    {idx > 0 && (
                      <button 
                        onClick={() => moveImage(idx, idx - 1)}
                        className="bg-stone-900 text-white p-1 rounded-full shadow-lg hover:bg-stone-800"
                      >
                        <ChevronLeft size={10} />
                      </button>
                    )}
                    {idx < villa.imageUrls.length - 1 && (
                      <button 
                        onClick={() => moveImage(idx, idx + 1)}
                        className="bg-stone-900 text-white p-1 rounded-full shadow-lg hover:bg-stone-800"
                      >
                        <ChevronRight size={10} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isAdmin && (
            <button 
              onClick={addImage}
              className="w-20 h-14 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-white hover:border-white/60 transition-all"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {/* Gallery Dots - Mobile */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 md:hidden">
          {villa.imageUrls?.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all ${activeImage === idx ? 'bg-white w-4' : 'bg-white/40'}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        {villa.imageUrls && villa.imageUrls.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <button 
              onClick={() => setActiveImage((prev) => (prev - 1 + villa.imageUrls.length) % villa.imageUrls.length)}
              className="pointer-events-auto bg-black/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/40 transition-all border border-white/10 shadow-xl"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setActiveImage((prev) => (prev + 1) % villa.imageUrls.length)}
              className="pointer-events-auto bg-black/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/40 transition-all border border-white/10 shadow-xl"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </section>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-widest mb-4">
                <MapPin size={14} />
                <span>{villa.location}</span>
                <span className="text-stone-300 mx-2">•</span>
                <div className="flex items-center text-amber-500">
                  <Star size={14} fill="currentColor" className="mr-1" />
                  <span>{villa.rating} ({villa.ratingCount} Reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-6 leading-tight">
                {villa.name}
              </h1>
              <div className="flex flex-wrap gap-4 md:gap-8 py-6 border-y border-stone-200">
                <div className="flex items-center space-x-2">
                  <Users size={20} className="text-stone-400" />
                  <span className="text-sm font-medium text-stone-600 uppercase tracking-wider">{villa.capacity} Guests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bed size={20} className="text-stone-400" />
                  <span className="text-sm font-medium text-stone-600 uppercase tracking-wider">{villa.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath size={20} className="text-stone-400" />
                  <span className="text-sm font-medium text-stone-600 uppercase tracking-wider">{villa.bathrooms} Bathrooms</span>
                </div>
                {villa.numRooms && (
                  <div className="flex items-center space-x-2">
                    <Home size={20} className="text-stone-400" />
                    <span className="text-sm font-medium text-stone-600 uppercase tracking-wider">{villa.numRooms} Total Rooms</span>
                  </div>
                )}
              </div>
            </div>

            <div className="prose prose-stone max-w-none mb-12">
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">About this sanctuary</h3>
              <p className="text-stone-600 leading-relaxed text-lg font-light italic mb-6">
                "{villa.description}"
              </p>
              <p className="text-stone-600 leading-relaxed">
                {villa.longDescription}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-12">
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Elite Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {villa.amenities?.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                      <Check size={16} />
                    </div>
                    <span className="text-sm font-medium text-stone-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Included Services */}
            <div className="mb-12">
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Included Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {villa.includedServices?.map(service => {
                  const getIcon = (s: string) => {
                    const lower = s.toLowerCase();
                    if (lower.includes('housekeeping')) return <Sparkles size={18} />;
                    if (lower.includes('caretaker') || lower.includes('concierge')) return <UserCheck size={18} />;
                    if (lower.includes('transfer') || lower.includes('chauffeur')) return <Car size={18} />;
                    if (lower.includes('chef') || lower.includes('meals')) return <Utensils size={18} />;
                    if (lower.includes('breakfast') || lower.includes('coffee')) return <Coffee size={18} />;
                    return <Check size={18} />;
                  };

                  return (
                    <div key={service} className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                      <div className="bg-stone-900 text-white p-2 rounded-xl">
                        {getIcon(service)}
                      </div>
                      <span className="text-sm font-bold text-stone-800 uppercase tracking-wider">{service}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logistics & Policies */}
            <div className="mb-12">
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Logistics & Policies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={`p-6 rounded-3xl border flex items-center space-x-4 ${villa.mealsAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                  <div className={`${villa.mealsAvailable ? 'text-emerald-600' : 'text-stone-400'}`}>
                    <Utensils size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Dining</h4>
                    <p className="text-stone-600 text-sm">{villa.mealsAvailable ? 'Gourmet meals available on request' : 'Self-catering only'}</p>
                  </div>
                </div>
                <div className={`p-6 rounded-3xl border flex items-center space-x-4 ${villa.petFriendly ? 'bg-blue-50 border-blue-100' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                  <div className={`${villa.petFriendly ? 'text-blue-600' : 'text-stone-400'}`}>
                    <PawPrint size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Pets</h4>
                    <p className="text-stone-600 text-sm">{villa.petFriendly ? 'Pet friendly environment' : 'No pets allowed'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start space-x-4">
                <ShieldCheck className="text-amber-600 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-stone-900 mb-1 uppercase tracking-wider text-xs">Cancellation Policy</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">{villa.refundPolicy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-2xl">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest block mb-1">Reservation From</span>
                  <span className="text-3xl font-bold text-stone-900">₹{villa.pricePerNight.toLocaleString()}</span>
                  <span className="text-stone-400 text-sm font-light"> / night</span>
                </div>
                <div className="flex items-center text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                  <Star size={14} fill="currentColor" className="mr-1" />
                  <span className="text-xs font-bold">{villa.rating}</span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                  <h4 className="font-serif font-bold text-stone-900 mb-2">Direct Booking</h4>
                  <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                    Skip the forms. Connect directly with our concierge on WhatsApp for instant availability and legacy pricing.
                  </p>
                  <button 
                    onClick={handleWhatsAppInquiry}
                    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-stone-800 transition-all flex items-center justify-center space-x-3"
                  >
                    <Phone size={18} />
                    <span>Inquire on WhatsApp</span>
                  </button>
                </div>
              </div>
              
              <p className="text-center text-[10px] text-stone-400 mt-6 uppercase tracking-widest font-medium">
                Direct connection to specialized concierge
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-50 flex items-center justify-between gap-4">
        <div>
          <span className="text-lg font-bold text-stone-900">₹{villa.pricePerNight.toLocaleString()}</span>
          <span className="text-stone-400 text-[10px] block uppercase font-bold tracking-tighter">Per Night</span>
        </div>
        <button 
          onClick={handleWhatsAppInquiry}
          className="flex-grow bg-stone-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
        >
          <Phone size={16} />
          <span>Book Now</span>
        </button>
      </div>
    </div>
  );
}
