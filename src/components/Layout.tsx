import React, { useState } from 'react';
import { Menu, X, Phone, Mail, Instagram, Facebook, User as UserIcon, LogOut, LayoutDashboard, Home, MapPin, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, SiteSettings } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string, id?: string) => void;
  user: FirebaseUser | null;
  userRole: UserRole;
  onLogout: () => void;
  settings: SiteSettings;
}

export default function Layout({ children, onNavigate, user, userRole, onLogout, settings }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'villas', label: 'Villas' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'testimonials', label: 'Testimonials' },
  ];

  const handleNavClick = (page: string, id?: string) => {
    onNavigate(page, id);
    setIsMenuOpen(false);
  };

  const isAdmin = userRole === UserRole.ADMIN;
  const whatsappNumber = settings.whatsappNumber.replace('+', '');

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => handleNavClick('home')}
            >
              <span className="text-xl font-serif font-bold tracking-tight text-stone-800">
                Peak<span className="text-amber-600">Stay</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="text-sm font-medium text-stone-600 hover:text-amber-600 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              {user ? (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleNavClick(isAdmin ? 'admin' : 'home')}
                    className="flex items-center space-x-1 text-sm font-medium text-stone-600 hover:text-amber-600"
                  >
                    <UserIcon size={16} />
                    <span>{user.displayName || 'User'}</span>
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => handleNavClick('admin')}
                      className="p-2 text-stone-600 hover:text-amber-600"
                      title="Admin Dashboard"
                    >
                      <LayoutDashboard size={18} />
                    </button>
                  )}
                  <button onClick={onLogout} className="text-stone-400 hover:text-red-500">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stone-600 hover:text-stone-900 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-stone-200 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-stone-600 hover:text-amber-600 hover:bg-stone-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-stone-100">
                  {user ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavClick(isAdmin ? 'admin' : 'home')}
                        className="block w-full text-left px-3 py-3 text-base font-medium text-stone-600"
                      >
                        {isAdmin ? 'Admin Dashboard' : 'Profile'}
                      </button>
                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-3 py-3 text-base font-medium text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavClick('login')}
                      className="block w-full text-center bg-stone-900 text-white px-3 py-3 rounded-xl text-base font-medium"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-serif font-bold tracking-tight text-white mb-4 block">
              PeakStay <span className="text-amber-500 text-xs uppercase tracking-[0.3em] ml-2">Limited Collection</span>
            </span>
            <p className="max-w-md text-stone-500 leading-relaxed text-sm">
              Defining Indian Luxury and Legacy Stay. We curate breathtaking private retreats that serve as sanctuaries for the extraordinary. Experience the subcontinent's most exclusive collection.
            </p>
            <div className="flex space-x-4 mt-6">
              <Facebook size={20} className="hover:text-white cursor-pointer transition-colors" />
              <Instagram size={20} className="hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4 uppercase tracking-wider text-xs">Concierge Desk</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone size={14} />
                <span>{settings.whatsappNumber}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={14} />
                <span>contact@peakstay.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {navLinks.map(link => (
                <li key={link.id}>
                  <button onClick={() => handleNavClick(link.id)} className="hover:text-white transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-stone-800 text-center text-xs text-stone-600">
          © {new Date().getFullYear()} PeakStay. Luxury Redefined. Crafted for Legacy.
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-between items-center z-50">
        <button onClick={() => handleNavClick('home')} className="flex flex-col items-center text-stone-400 hover:text-amber-600">
          <Home size={20} />
          <span className="text-[10px] mt-1 uppercase font-bold tracking-tighter">Home</span>
        </button>
        <button onClick={() => handleNavClick('villas')} className="flex flex-col items-center text-stone-400 hover:text-amber-600">
          <MapPin size={20} />
          <span className="text-[10px] mt-1 uppercase font-bold tracking-tighter">Villas</span>
        </button>
        <a href={`https://wa.me/${whatsappNumber}`} className="flex flex-col items-center text-green-600">
          <MessageCircle size={20} />
          <span className="text-[10px] mt-1 uppercase font-bold tracking-tighter">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
