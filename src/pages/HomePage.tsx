import React from 'react';
import { motion } from 'motion/react';
import { Search, ArrowRight, MapPin, Shield, Star, Coffee } from 'lucide-react';
import { HOTSPOT_LOCATIONS } from '../constants';
import VillaCard from '../components/VillaCard';
import { Villa, Service, Testimonial, SiteSettings, AppTheme } from '../types';

interface HomePageProps {
  onNavigate: (page: string, id?: string) => void;
  villas: Villa[];
  services: Service[];
  testimonials: Testimonial[];
  settings: SiteSettings;
}

export default function HomePage({ onNavigate, villas, services, testimonials, settings }: HomePageProps) {
  const featuredVillas = villas.filter(v => v.isFeatured);

  const getThemeBanner = () => {
    switch (settings.activeTheme) {
      case AppTheme.REPUBLIC_DAY:
        return "bg-gradient-to-r from-orange-500 via-white to-green-500";
      case AppTheme.HOLI:
        return "bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400";
      case AppTheme.DIWALI:
        return "bg-stone-900 border-b border-amber-500/30";
      default:
        return "bg-black/40 backdrop-blur-[2px]";
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[85vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={villas[0]?.imageUrls[0] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920"} 
            alt="Luxury Villa"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 ${getThemeBanner()}`}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-6">
              {settings.promoText}
            </span>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Curating <span className="italic text-amber-400">Extraordinary</span> <br className="hidden md:block" /> Private Sanctuaries.
            </h1>
            <p className="text-stone-200 text-sm md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              A handpicked collection of the subcontinent's most breathtaking private retreats, crafted for those who define luxury by privacy and legacy.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-white p-2 md:p-3 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2">
              <div className="flex-grow flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-stone-100 py-2 md:py-0">
                <MapPin size={18} className="text-amber-500 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Where would you like to escape?"
                  className="w-full bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 text-sm"
                />
              </div>
              <button 
                onClick={() => onNavigate('villas')}
                className="w-full md:w-auto bg-stone-900 text-white px-8 py-4 rounded-xl md:rounded-full font-bold text-sm uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center space-x-2"
              >
                <Search size={16} />
                <span>Explore</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hotspot Locations */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <span className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2 block">Exclusive Destinations</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900">Iconic Hotspots</h2>
          </div>
          <button onClick={() => onNavigate('villas')} className="text-stone-500 hover:text-stone-900 font-bold text-xs uppercase tracking-widest flex items-center group">
            View Limited Collection <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {HOTSPOT_LOCATIONS.map((loc, idx) => (
            <motion.div 
              key={loc.name}
              whileHover={{ y: -5 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => onNavigate('villas')}
            >
              <img src={loc.image} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="font-serif font-bold text-lg">{loc.name}</h4>
                <p className="text-[10px] uppercase tracking-widest opacity-70">{loc.count} Exclusive Stays</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Narrative Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200" 
                  alt="Luxury Architecture" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-4 block">Defining Indian Luxury</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-8 leading-tight">
                A Legacy of <br /><span className="italic text-amber-600">Extraordinary</span> Stays.
              </h2>
              <div className="space-y-6 text-stone-600 text-lg leading-relaxed font-light">
                <p>
                  At Peak Stay Destination, we believe luxury is not just a service, but a legacy. Our collection is meticulously curated to offer more than just a place to stay—we offer a sanctuary where time slows down and memories are etched in stone.
                </p>
                <p>
                  From the sun-drenched shores of Vagator to the serene backwaters of Siolim, each property in our <span className="font-bold text-stone-900">Limited Collection</span> represents the pinnacle of architectural brilliance and bespoke hospitality.
                </p>
                <p className="italic font-serif text-stone-800">
                  "We don't just host guests; we curate legacies."
                </p>
              </div>
              <div className="mt-10 flex items-center space-x-8">
                <div>
                  <p className="text-3xl font-serif font-bold text-stone-900">15+</p>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400">Iconic Villas</p>
                </div>
                <div className="w-px h-10 bg-stone-200"></div>
                <div>
                  <p className="text-3xl font-serif font-bold text-stone-900">500+</p>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400">Legacy Stories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Villas */}
      <section className="py-20 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2 block">Limited Collection</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900">Iconic Escapes</h2>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-8 md:pb-0 snap-x no-scrollbar">
            {featuredVillas.map(villa => (
              <div key={villa.id} className="min-w-[85vw] md:min-w-0 snap-center">
                <VillaCard villa={villa} onClick={(id) => onNavigate('villa-detail', id)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2 block">The Experience</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-8 leading-tight">
              Unrivaled Concierge <br /> & Bespoke Services.
            </h2>
            <div className="space-y-8">
              {services.map((service, idx) => (
                <div key={service.id} className="flex items-start space-x-4">
                  <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 shrink-0">
                    <Coffee size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xl text-stone-800 mb-2">{service.title}</h4>
                    <p className="text-stone-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800" 
                alt="Service"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-stone-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2 block">Guest Stories</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold">Voices of the Legacy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map(t => (
              <div key={t.id} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                <div className="flex items-center space-x-1 text-amber-400 mb-6">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-stone-300 italic mb-8 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center space-x-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-amber-400/30" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-sm">{t.name}</h4>
                    <p className="text-[10px] uppercase text-stone-500 tracking-widest">{t.category} Experience</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-8 leading-tight">
          Ready to Begin Your <br /> <span className="italic text-amber-600">Legacy</span> Journey?
        </h2>
        <p className="text-stone-500 mb-12 text-lg">
          Connect with our specialized concierge desk to curate your next extraordinary escape.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => onNavigate('villas')}
            className="w-full sm:w-auto bg-stone-900 text-white px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-stone-800 transition-all"
          >
            Explore Collection
          </button>
          <a 
            href={`https://wa.me/${settings.whatsappNumber.replace('+', '')}`}
            target="_blank"
            className="w-full sm:w-auto border border-stone-200 text-stone-800 px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center justify-center"
          >
            Contact Concierge
          </a>
        </div>
      </section>
    </div>
  );
}
