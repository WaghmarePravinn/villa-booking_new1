import React from 'react';
import { MapPin, Star, Users, Bed, Bath } from 'lucide-react';
import { Villa } from '../types';

interface VillaCardProps {
  villa: Villa;
  onClick: (id: string) => void;
}

export default function VillaCard({ villa, onClick }: VillaCardProps) {
  return (
    <div 
      onClick={() => onClick(villa.id)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={villa.imageUrls[0]} 
          alt={villa.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
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
