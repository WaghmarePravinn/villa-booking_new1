import React, { useState, useEffect } from 'react';
import { MapPin, Star, Users, Bed, Bath, ArrowLeft, Share2, Heart, Check, Calendar, Phone, ShieldCheck, Coffee, Wind, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Villa, SiteSettings, LeadStatus } from '../types';
import { db, handleFirestoreError, FirestoreOperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface VillaDetailPageProps {
  villaId: string | null;
  onNavigate: (page: string, id?: string) => void;
  villas: Villa[];
  settings: SiteSettings;
}

export default function VillaDetailPage({ villaId, onNavigate, villas, settings }: VillaDetailPageProps) {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    checkIn: '',
    checkOut: ''
  });

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);

    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        villaId: villa.id,
        villaName: villa.name,
        status: LeadStatus.NEW,
        createdAt: serverTimestamp(),
      });
      setBookingSuccess(true);
      
      const message = `Hi! I am interested in ${villa.name}. Can you share details for ${formData.checkIn} to ${formData.checkOut}?`;
      const whatsappUrl = `https://wa.me/919157928471?text=${encodeURIComponent(message)}`;
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 2000);

    } catch (error) {
      handleFirestoreError(error, FirestoreOperationType.CREATE, 'leads');
    } finally {
      setIsBooking(false);
    }
  };

  const handleWhatsAppInquiry = () => {
    const message = `Hi Peak Stay! I'm interested in booking ${villa.name} in ${villa.location}. Could you please share more details?`;
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
            src={villa.imageUrls[activeImage]} 
            alt={villa.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        {/* Gallery Thumbnails - Desktop */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex space-x-3 bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/10">
          {villa.imageUrls.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-amber-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>

        {/* Gallery Dots - Mobile */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 md:hidden">
          {villa.imageUrls.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all ${activeImage === idx ? 'bg-white w-4' : 'bg-white/40'}`}
            />
          ))}
        </div>
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
                {villa.amenities.map(amenity => (
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
              <div className="flex flex-wrap gap-3">
                {villa.includedServices.map(service => (
                  <span key={service} className="px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-widest">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Refund Policy */}
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start space-x-4">
              <ShieldCheck className="text-amber-600 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-stone-900 mb-1 uppercase tracking-wider text-xs">Cancellation Policy</h4>
                <p className="text-stone-600 text-sm">{villa.refundPolicy}</p>
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

              <div className="space-y-4 mb-8">
                {bookingSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      <Check size={24} />
                    </div>
                    <h4 className="font-serif font-bold text-green-900 mb-2">Inquiry Sent!</h4>
                    <p className="text-green-700 text-sm mb-4">Our concierge will contact you shortly. Redirecting to WhatsApp...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-stone-800"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-stone-800"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Check In</label>
                        <input 
                          required
                          type="date" 
                          value={formData.checkIn}
                          onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-medium text-stone-800"
                        />
                      </div>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Check Out</label>
                        <input 
                          required
                          type="date" 
                          value={formData.checkOut}
                          onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-medium text-stone-800"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isBooking}
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-stone-800 transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
                    >
                      {isBooking ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
                      <span>{isBooking ? 'Processing...' : 'Request Booking'}</span>
                    </button>
                  </form>
                )}
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
