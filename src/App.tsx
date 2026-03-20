import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { auth, db, logout, loginWithGoogle, handleFirestoreError, FirestoreOperationType } from './firebase';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VillaListingPage from './pages/VillaListingPage';
import VillaDetailPage from './pages/VillaDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import AIConcierge from './components/AIConcierge';
import { User, UserRole, SiteSettings, AppTheme, Villa, Service, Testimonial, Offer } from './types';
import { INITIAL_VILLAS, SERVICES, TESTIMONIALS } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// Default Site Settings
const DEFAULT_SETTINGS: SiteSettings = {
  activeTheme: AppTheme.DEFAULT,
  promoText: "Legacy Stays. Extraordinary Sanctuaries.",
  whatsappNumber: "+919157928471",
  contactEmail: "peakstaydestination@gmail.com",
  contactPhone: "+919157928471",
  offerPopup: {
    enabled: false,
    title: "Special Summer Offer",
    description: "Get 20% off on all bookings this summer!",
    buttonText: "Book Now",
    buttonLink: "/villas"
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVillaId, setSelectedVillaId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Firestore or is the default admin
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        let role = UserRole.USER;
        
        if (firebaseUser.email === "pravinwaghmare9356@gmail.com") {
          role = UserRole.ADMIN;
        } else if (userDoc.exists()) {
          role = userDoc.data().role as UserRole;
        }

        // Ensure user document exists for rules to work reliably
        if (!userDoc.exists() || userDoc.data().email !== firebaseUser.email) {
          await setDoc(userRef, {
            username: firebaseUser.displayName || 'Guest',
            email: firebaseUser.email || '',
            role: role,
            updatedAt: new Date()
          }, { merge: true });
        }

        setUser({
          id: firebaseUser.uid,
          username: firebaseUser.displayName || 'Guest',
          email: firebaseUser.email || '',
          role: role
        });
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!isAuthReady) return;

    // Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        setSettings(data);
        if (data.offerPopup?.enabled) {
          // Show popup once per session
          const hasSeen = sessionStorage.getItem('hasSeenPopup');
          if (!hasSeen) {
            setShowPopup(true);
            sessionStorage.setItem('hasSeenPopup', 'true');
          }
        }
      } else {
        // Initialize settings if they don't exist
        setDoc(doc(db, 'settings', 'site'), DEFAULT_SETTINGS);
      }
    }, (error) => handleFirestoreError(error, FirestoreOperationType.GET, 'settings/site'));

    // Villas
    const unsubVillas = onSnapshot(collection(db, 'villas'), (snapshot) => {
      const villaList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Villa));
      setVillas(villaList.length > 0 ? villaList : INITIAL_VILLAS);
    }, (error) => handleFirestoreError(error, FirestoreOperationType.LIST, 'villas'));

    // Services
    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      const serviceList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(serviceList.length > 0 ? serviceList : SERVICES);
    }, (error) => handleFirestoreError(error, FirestoreOperationType.LIST, 'services'));

    // Testimonials
    const unsubTestimonials = onSnapshot(query(collection(db, 'testimonials'), orderBy('timestamp', 'desc')), (snapshot) => {
      const testimonialList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      setTestimonials(testimonialList.length > 0 ? testimonialList : TESTIMONIALS);
    }, (error) => handleFirestoreError(error, FirestoreOperationType.LIST, 'testimonials'));

    // Offers
    const unsubOffers = onSnapshot(query(collection(db, 'offers')), (snapshot) => {
      const offerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
      setOffers(offerList.filter(o => o.isActive));
    }, (error) => handleFirestoreError(error, FirestoreOperationType.LIST, 'offers'));

    return () => {
      unsubSettings();
      unsubVillas();
      unsubServices();
      unsubTestimonials();
      unsubOffers();
    };
  }, [isAuthReady]);

  // Theme Logic
  const getThemeStyles = () => {
    switch (settings.activeTheme) {
      case AppTheme.REPUBLIC_DAY:
        return { primary: 'bg-orange-600', accent: 'text-green-600', banner: 'bg-gradient-to-r from-orange-500 via-white to-green-500' };
      case AppTheme.HOLI:
        return { primary: 'bg-pink-500', accent: 'text-purple-500', banner: 'bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400' };
      case AppTheme.DIWALI:
        return { primary: 'bg-amber-600', accent: 'text-yellow-500', banner: 'bg-stone-900' };
      default:
        return { primary: 'bg-stone-900', accent: 'text-amber-600', banner: 'bg-stone-900' };
    }
  };

  const theme = getThemeStyles();

  // Navigation logic
  const navigate = (page: string, id?: string) => {
    setCurrentPage(page);
    if (id) setSelectedVillaId(id);
    window.scrollTo(0, 0);
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('home');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const renderPage = () => {
    if (!isAuthReady) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} villas={villas} services={services} testimonials={testimonials} settings={settings} offers={offers} user={user} />;
      case 'villas':
        return <VillaListingPage onNavigate={navigate} villas={villas} user={user} />;
      case 'villa-detail':
        return <VillaDetailPage villaId={selectedVillaId} onNavigate={navigate} villas={villas} settings={settings} offers={offers} user={user} />;
      case 'login':
        return (
          <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-2xl text-center">
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Welcome Back</h2>
              <p className="text-stone-500 text-sm mb-8">Access your exclusive legacy dashboard.</p>
              <button 
                onClick={handleLogin}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center space-x-3"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>
        );
      case 'admin':
        return user?.role === UserRole.ADMIN ? <AdminDashboard user={user} onNavigate={navigate} /> : <HomePage onNavigate={navigate} villas={villas} services={services} testimonials={testimonials} settings={settings} offers={offers} user={user} />;
      default:
        return <HomePage onNavigate={navigate} villas={villas} services={services} testimonials={testimonials} settings={settings} offers={offers} user={user} />;
    }
  };

  return (
    <Layout onNavigate={navigate} user={user} userRole={user?.role || UserRole.GUEST} onLogout={handleLogout} settings={settings}>
      {renderPage()}

      <AIConcierge 
        villas={villas} 
        user={user} 
        settings={settings} 
        offers={offers}
        onNavigate={navigate} 
      />

      {/* Offer Popup */}
      <AnimatePresence>
        {showPopup && settings.offerPopup?.enabled && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-w-lg w-full"
            >
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full text-stone-800 hover:bg-white"
              >
                <X size={20} />
              </button>
              {settings.offerPopup.imageUrl && (
                <img src={settings.offerPopup.imageUrl} alt="Offer" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
              )}
              <div className="p-8 text-center">
                <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">{settings.offerPopup.title}</h3>
                <p className="text-stone-500 mb-8 leading-relaxed">{settings.offerPopup.description}</p>
                <button 
                  onClick={() => {
                    setShowPopup(false);
                    navigate('villas');
                  }}
                  className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest"
                >
                  {settings.offerPopup.buttonText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
