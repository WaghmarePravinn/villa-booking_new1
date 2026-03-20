import React, { useState } from 'react';
import { MapPin, Star, Users, Bed, Bath, ChevronLeft, ChevronRight, Trash2, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Villa, User, UserRole } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, FirestoreOperationType } from '../firebase';

interface VillaCardProps {
  villa: Villa;
  onClick: (id: string) => void;
  user?: User | null;
}

export default function VillaCard({ villa, onClick, user }: VillaCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const updateImages = async (newImages: string[]) => {
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

  const deleteImage = async (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (!window.confirm('Delete this image?')) return;
    
    const newImages = [...villa.imageUrls];
    newImages.splice(idx, 1);
    
    if (currentImage >= newImages.length) {
      setCurrentImage(Math.max(0, newImages.length - 1));
    }
    
    await updateImages(newImages);
  };

  const moveImage = async (e: React.MouseEvent, from: number, to: number) => {
    e.stopPropagation();
    const newImages = [...villa.imageUrls];
    [newImages[from], newImages[to]] = [newImages[to], newImages[from]];
    setCurrentImage(to);
    await updateImages(newImages);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (villa.imageUrls && villa.imageUrls.length > 0) {
      setCurrentImage((prev) => (prev + 1) % villa.imageUrls.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (villa.imageUrls && villa.imageUrls.length > 0) {
      setCurrentImage((prev) => (prev - 1 + villa.imageUrls.length) % villa.imageUrls.length);
    }
  };

  return (
    <div 
      onClick={() => onClick(villa.id)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={villa.imageUrls?.[currentImage] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920"} 
            alt={villa.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* Carousel Controls */}
        {villa.imageUrls && villa.imageUrls.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={prevImage}
              className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-stone-800 hover:bg-white transition-colors shadow-lg"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextImage}
              className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-stone-800 hover:bg-white transition-colors shadow-lg"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && villa.imageUrls && villa.imageUrls.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button 
              onClick={(e) => deleteImage(e, currentImage)}
              disabled={isUpdating}
              className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              title="Delete current image"
            >
              <Trash2 size={14} />
            </button>
            <div className="flex gap-1">
              {currentImage > 0 && (
                <button 
                  onClick={(e) => moveImage(e, currentImage, currentImage - 1)}
                  disabled={isUpdating}
                  className="bg-stone-900/80 text-white p-2 rounded-full shadow-lg hover:bg-stone-900 transition-colors disabled:opacity-50"
                  title="Move left"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              {currentImage < villa.imageUrls.length - 1 && (
                <button 
                  onClick={(e) => moveImage(e, currentImage, currentImage + 1)}
                  disabled={isUpdating}
                  className="bg-stone-900/80 text-white p-2 rounded-full shadow-lg hover:bg-stone-900 transition-colors disabled:opacity-50"
                  title="Move right"
                >
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dots */}
        {villa.imageUrls && villa.imageUrls.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
            {villa.imageUrls.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${currentImage === idx ? 'bg-white w-3' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-stone-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            {villa.location.split(',')[0]}
          </span>
        </div>
        {villa.isFeatured && (
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
              Exclusive
            </span>
            <span className="bg-stone-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter">
              Limited Collection
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif font-bold text-stone-800 leading-tight group-hover:text-amber-600 transition-colors">
            {villa.name}
          </h3>
          <div className="flex items-center space-x-1 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold">{villa.rating}</span>
          </div>
        </div>

        <div className="flex items-center text-stone-500 text-xs mb-4">
          <MapPin size={12} className="mr-1" />
          <span>{villa.location}</span>
        </div>

        <p className="text-stone-600 text-sm line-clamp-2 mb-6 flex-grow italic">
          "{villa.description}"
        </p>

        <div className="grid grid-cols-3 gap-2 py-4 border-t border-stone-100 mb-4">
          <div className="flex flex-col items-center">
            <Users size={14} className="text-stone-400 mb-1" />
            <span className="text-[10px] font-medium text-stone-500 uppercase">{villa.capacity} Guests</span>
          </div>
          <div className="flex flex-col items-center border-x border-stone-100">
            <Bed size={14} className="text-stone-400 mb-1" />
            <span className="text-[10px] font-medium text-stone-500 uppercase">{villa.bedrooms} BHK</span>
          </div>
          <div className="flex flex-col items-center">
            <Bath size={14} className="text-stone-400 mb-1" />
            <span className="text-[10px] font-medium text-stone-500 uppercase">{villa.bathrooms} Baths</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-2">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest block">Per Night</span>
            <span className="text-xl font-bold text-stone-900">₹{villa.pricePerNight.toLocaleString()}</span>
          </div>
          <button className="bg-stone-100 text-stone-800 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider group-hover:bg-amber-600 group-hover:text-white transition-all">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
