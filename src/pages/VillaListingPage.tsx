import React, { useState, useMemo } from 'react';
import { Search, Filter, X, MapPin, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HOTSPOT_LOCATIONS } from '../constants';
import VillaCard from '../components/VillaCard';
import { Villa, VillaFilters, User } from '../types';

interface VillaListingPageProps {
  onNavigate: (page: string, id?: string) => void;
  villas: Villa[];
  user: User | null;
}

export default function VillaListingPage({ onNavigate, villas, user }: VillaListingPageProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filters, setFilters] = useState<VillaFilters>({
    location: '',
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: 0,
    checkIn: '',
    checkOut: '',
  });

  const suggestions = useMemo(() => {
    if (!filters.location.trim()) return [];
    const query = filters.location.toLowerCase();
    const locs = Array.from(new Set(villas.map(v => v.location)));
    return locs.filter(l => l.toLowerCase().includes(query)).slice(0, 5);
  }, [filters.location, villas]);

  const filteredVillas = useMemo(() => {
    return villas.filter(villa => {
      const matchesLocation = !filters.location || villa.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesPrice = villa.pricePerNight >= filters.minPrice && villa.pricePerNight <= filters.maxPrice;
      const matchesBedrooms = !filters.bedrooms || villa.bedrooms >= filters.bedrooms;
      return matchesLocation && matchesPrice && matchesBedrooms;
    });
  }, [filters, villas]);

  const locations = ['All Locations', ...new Set(villas?.map(v => v.location.split(',')[1]?.trim() || v.location) || [])];

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <section className="bg-stone-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Limited Collection</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">The Legacy Stays</h1>
            <p className="text-stone-400 max-w-2xl mx-auto text-sm md:text-lg font-light leading-relaxed">
              Explore our handpicked selection of <span className="text-white font-medium italic">extraordinary</span> private sanctuaries across the Indian subcontinent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar - Desktop */}
      <div className="sticky top-16 z-40 bg-white border-b border-stone-200 shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center space-x-4 flex-grow">
            <div className="relative flex-grow max-w-[240px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text" 
                placeholder="Search location..."
                value={filters.location}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20"
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              
              <AnimatePresence>
                {isSearchFocused && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-stone-100 overflow-hidden z-50"
                  >
                    <div className="px-4 py-2 bg-stone-50 border-b border-stone-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Suggestions</span>
                    </div>
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFilters({ ...filters, location: s })}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left border-b border-stone-50 last:border-none"
                      >
                        <MapPin size={14} className="text-amber-500" />
                        <span className="text-xs font-medium text-stone-800">{s}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center space-x-3">
              <select 
                className="bg-stone-50 border-none rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-amber-500/20"
                onChange={(e) => setFilters({ ...filters, location: e.target.value === 'All Locations' ? '' : e.target.value })}
              >
                {locations?.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>

              <div className="flex items-center bg-stone-50 rounded-xl px-3 py-1 space-x-2 border border-transparent focus-within:ring-2 focus-within:ring-amber-500/20">
                <span className="text-[10px] font-bold text-stone-400 uppercase">In</span>
                <input 
                  type="date" 
                  className="bg-transparent border-none text-xs focus:ring-0 p-1"
                  onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
                />
              </div>

              <div className="flex items-center bg-stone-50 rounded-xl px-3 py-1 space-x-2 border border-transparent focus-within:ring-2 focus-within:ring-amber-500/20">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Out</span>
                <input 
                  type="date" 
                  className="bg-transparent border-none text-xs focus:ring-0 p-1"
                  onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
                />
              </div>

              <select 
                className="bg-stone-50 border-none rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-amber-500/20"
                onChange={(e) => setFilters({ ...filters, bedrooms: parseInt(e.target.value) })}
              >
                <option value="0">Any BHK</option>
                <option value="2">2+ BHK</option>
                <option value="3">3+ BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
            <span>{filteredVillas.length} Results Found</span>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden sticky top-16 z-40 bg-white border-b border-stone-200 px-4 py-3 flex justify-between items-center">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center space-x-2 bg-stone-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-stone-800"
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
          {filteredVillas.length} Results
        </span>
      </div>

      {/* Villa Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredVillas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVillas?.map((villa, idx) => (
              <motion.div
                key={villa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <VillaCard villa={villa} onClick={(id) => onNavigate('villa-detail', id)} user={user} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-stone-300" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">No Sanctuaries Found</h3>
            <p className="text-stone-500 max-w-xs mx-auto text-sm">
              We couldn't find any villas matching your current filters. Try adjusting your search.
            </p>
            <button 
              onClick={() => setFilters({ location: '', minPrice: 0, maxPrice: 1000000, bedrooms: 0, checkIn: '', checkOut: '' })}
              className="mt-8 text-amber-600 font-bold text-xs uppercase tracking-widest"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[2.5rem] z-[70] p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-stone-900">Refine Search</h3>
                <button onClick={() => setIsFilterOpen(false)} className="bg-stone-100 p-2 rounded-full text-stone-500">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Check In</label>
                    <input 
                      type="date" 
                      className="w-full bg-stone-100 border-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-amber-500/20"
                      onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Check Out</label>
                    <input 
                      type="date" 
                      className="w-full bg-stone-100 border-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-amber-500/20"
                      onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4 block">Location</label>
                  <div className="grid grid-cols-2 gap-2">
                    {locations?.map(loc => (
                      <button
                        key={loc}
                        onClick={() => setFilters({ ...filters, location: loc === 'All Locations' ? '' : loc })}
                        className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                          (loc === 'All Locations' && !filters.location) || (filters.location && loc.includes(filters.location))
                            ? 'bg-stone-900 text-white shadow-lg'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4 block">Bedrooms (BHK)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setFilters({ ...filters, bedrooms: num })}
                        className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                          filters.bedrooms === num
                            ? 'bg-stone-900 text-white shadow-lg'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {num === 0 ? 'Any' : `${num}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4 block">Price Range (Per Night)</label>
                  <div className="space-y-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100000" 
                      step="5000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                      className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-xs font-bold text-stone-800">
                      <span>₹0</span>
                      <span>Up to ₹{filters.maxPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl"
                >
                  Show {filteredVillas.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
