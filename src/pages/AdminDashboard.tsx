import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, FirestoreOperationType } from '../firebase';
import { User, Villa, Service, Testimonial, SiteSettings, AppTheme, Lead, LeadStatus, Offer } from '../types';
import { Plus, Edit2, Trash2, Save, X, Settings, Home, Star, MessageSquare, Users, TrendingUp, Phone, Image as ImageIcon, Check, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ user, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'leads' | 'villas' | 'services' | 'testimonials' | 'settings' | 'offers'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiCommand, setAiCommand] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Modal states
  const [isVillaModalOpen, setIsVillaModalOpen] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Partial<Villa> | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);

  useEffect(() => {
    const unsubLeads = onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc')), (snap) => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
    });
    const unsubVillas = onSnapshot(collection(db, 'villas'), (snap) => {
      setVillas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Villa)));
    });
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    });
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snap) => {
      setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial)));
    });
    const unsubOffers = onSnapshot(collection(db, 'offers'), (snap) => {
      setOffers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Offer)));
    });
    const unsubSettings = onSnapshot(doc(db, 'settings', 'site'), (snap) => {
      if (snap.exists()) setSettings(snap.data() as SiteSettings);
      setLoading(false);
    });

    return () => {
      unsubLeads();
      unsubVillas();
      unsubServices();
      unsubTestimonials();
      unsubOffers();
      unsubSettings();
    };
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await updateDoc(doc(db, 'settings', 'site'), { ...settings });
      alert('Settings updated successfully!');
    } catch (error) {
      handleFirestoreError(error, FirestoreOperationType.UPDATE, 'settings/site');
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (error) {
        handleFirestoreError(error, FirestoreOperationType.DELETE, `${collectionName}/${id}`);
      }
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: LeadStatus) => {
    try {
      await updateDoc(doc(db, 'leads', id), { status });
    } catch (error) {
      handleFirestoreError(error, FirestoreOperationType.UPDATE, `leads/${id}`);
    }
  };

  const handleSaveVilla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVilla) return;
    try {
      if (editingVilla.id) {
        const { id, ...data } = editingVilla;
        await updateDoc(doc(db, 'villas', id), data);
      } else {
        await addDoc(collection(db, 'villas'), {
          ...editingVilla,
          rating: 4.8,
          ratingCount: 0,
          createdAt: serverTimestamp()
        });
      }
      setIsVillaModalOpen(false);
      setEditingVilla(null);
    } catch (error) {
      handleFirestoreError(error, editingVilla.id ? FirestoreOperationType.UPDATE : FirestoreOperationType.CREATE, 'villas');
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      if (editingService.id) {
        const { id, ...data } = editingService;
        await updateDoc(doc(db, 'services', id), data);
      } else {
        await addDoc(collection(db, 'services'), {
          ...editingService,
          createdAt: serverTimestamp()
        });
      }
      setIsServiceModalOpen(false);
      setEditingService(null);
    } catch (error) {
      handleFirestoreError(error, editingService.id ? FirestoreOperationType.UPDATE : FirestoreOperationType.CREATE, 'services');
    }
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    try {
      if (editingTestimonial.id) {
        const { id, ...data } = editingTestimonial;
        await updateDoc(doc(db, 'testimonials', id), data);
      } else {
        await addDoc(collection(db, 'testimonials'), {
          ...editingTestimonial,
          createdAt: serverTimestamp()
        });
      }
      setIsTestimonialModalOpen(false);
      setEditingTestimonial(null);
    } catch (error) {
      handleFirestoreError(error, editingTestimonial.id ? FirestoreOperationType.UPDATE : FirestoreOperationType.CREATE, 'testimonials');
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    try {
      if (editingOffer.id) {
        const { id, ...data } = editingOffer;
        await updateDoc(doc(db, 'offers', id), data);
      } else {
        await addDoc(collection(db, 'offers'), {
          ...editingOffer,
          createdAt: serverTimestamp()
        });
      }
      setIsOfferModalOpen(false);
      setEditingOffer(null);
    } catch (error) {
      handleFirestoreError(error, editingOffer.id ? FirestoreOperationType.UPDATE : FirestoreOperationType.CREATE, 'offers');
    }
  };

  const handleAiCommand = async () => {
    if (!aiCommand.trim() || isAiProcessing) return;
    setIsAiProcessing(true);
    try {
      // This is a simplified version of the AI Concierge logic for the admin dashboard
      // In a real app, we'd probably share a hook or service
      alert("Please use the Peak Concierge (Sparkles icon at bottom right) for AI commands. It is optimized for system updates.");
      setAiCommand('');
    } finally {
      setIsAiProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-stone-50">
      <Loader2 className="animate-spin text-amber-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-400 p-6 flex flex-col">
        <div className="mb-10">
          <span className="text-xl font-serif font-bold text-white">Admin Console</span>
          <p className="text-[10px] uppercase tracking-widest mt-1">Peak Stay Destination</p>
        </div>

        <nav className="space-y-2 flex-grow">
          {[
            { id: 'leads', label: 'Leads', icon: TrendingUp },
            { id: 'villas', label: 'Villas', icon: Home },
            { id: 'services', label: 'Services', icon: Users },
            { id: 'testimonials', label: 'Reviews', icon: Star },
            { id: 'offers', label: 'Offers', icon: Sparkles },
            { id: 'settings', label: 'Site Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-amber-600 text-white shadow-lg' : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
              {user.username[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate">{user.username}</p>
              <p className="text-[10px] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-stone-900 capitalize">{activeTab}</h2>
          <div className="flex space-x-4">
            {activeTab !== 'settings' && activeTab !== 'leads' && (
              <button 
                onClick={() => {
                  if (activeTab === 'villas') { setEditingVilla({}); setIsVillaModalOpen(true); }
                  if (activeTab === 'services') { setEditingService({}); setIsServiceModalOpen(true); }
                  if (activeTab === 'testimonials') { setEditingTestimonial({}); setIsTestimonialModalOpen(true); }
                  if (activeTab === 'offers') { setEditingOffer({ isActive: true }); setIsOfferModalOpen(true); }
                }}
                className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-amber-600 transition-all"
              >
                <Plus size={16} />
                <span>Add New</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Content */}
        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
          {activeTab === 'leads' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Villa</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs text-stone-500">
                        {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'Pending...'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-stone-800">{lead.customerName}</p>
                        <p className="text-[10px] text-stone-400">{lead.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">{lead.villaName}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-none focus:ring-0 ${
                            lead.status === 'new' ? 'bg-blue-50 text-blue-600' :
                            lead.status === 'booked' ? 'bg-green-50 text-green-600' :
                            lead.status === 'contacted' ? 'bg-amber-50 text-amber-600' :
                            'bg-stone-100 text-stone-400'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="booked">Booked</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={`https://wa.me/${lead.customerPhone?.replace('+', '')}`} 
                          target="_blank" 
                          className="text-green-600 hover:text-green-700"
                        >
                          <Phone size={16} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'settings' && settings && (
            <div className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Active Festival Theme</label>
                  <select 
                    value={settings.activeTheme}
                    onChange={(e) => setSettings({ ...settings, activeTheme: e.target.value as AppTheme })}
                    className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm focus:ring-amber-500"
                  >
                    {Object.values(AppTheme).map(theme => <option key={theme} value={theme}>{theme}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="border-t border-stone-100 pt-8">
                <h4 className="text-lg font-serif font-bold mb-6">Offer Popup Branding</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center space-x-4">
                    <input 
                      type="checkbox" 
                      checked={settings.offerPopup.enabled}
                      onChange={(e) => setSettings({ ...settings, offerPopup: { ...settings.offerPopup, enabled: e.target.checked } })}
                      className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-stone-700">Enable Offer Popup</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Popup Title</label>
                    <input 
                      type="text" 
                      value={settings.offerPopup.title}
                      onChange={(e) => setSettings({ ...settings, offerPopup: { ...settings.offerPopup, title: e.target.value } })}
                      className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Popup Description</label>
                    <textarea 
                      value={settings.offerPopup.description}
                      onChange={(e) => setSettings({ ...settings, offerPopup: { ...settings.offerPopup, description: e.target.value } })}
                      className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm h-24"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSaveSettings}
                  className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center space-x-2 hover:bg-amber-600 transition-all"
                >
                  <Save size={18} />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'villas' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {villas.map(villa => (
                <div key={villa.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col">
                  <img src={villa.imageUrls[0]} className="w-full h-32 object-cover rounded-xl mb-4" referrerPolicy="no-referrer" />
                  <h4 className="font-bold text-stone-800 mb-1">{villa.name}</h4>
                  <p className="text-xs text-stone-400 mb-4">{villa.location}</p>
                    <div className="flex justify-between items-center mt-auto">
                    <span className="text-sm font-bold text-amber-600">₹{villa.pricePerNight}</span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => { setEditingVilla(villa); setIsVillaModalOpen(true); }}
                        className="p-2 text-stone-400 hover:text-stone-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete('villas', villa.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Services List */}
          {activeTab === 'services' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <h4 className="font-bold text-stone-800 mb-1">{service.title}</h4>
                  <p className="text-xs text-stone-500 mb-4">{service.description}</p>
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => { setEditingService(service); setIsServiceModalOpen(true); }}
                      className="p-2 text-stone-400 hover:text-stone-900"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete('services', service.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Testimonials List */}
          {activeTab === 'testimonials' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <img src={t.avatar} className="w-8 h-8 rounded-full" />
                    <h4 className="font-bold text-stone-800 text-sm">{t.name}</h4>
                  </div>
                  <p className="text-xs text-stone-500 italic mb-4">"{t.content}"</p>
                  <div className="flex justify-between items-center">
                    <div className="flex text-amber-400">
                      {[...Array(t.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => { setEditingTestimonial(t); setIsTestimonialModalOpen(true); }}
                        className="p-2 text-stone-400 hover:text-stone-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete('testimonials', t.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Offers List */}
          {activeTab === 'offers' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map(offer => (
                <div key={offer.id} className={`p-6 rounded-2xl border transition-all ${offer.isActive ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-stone-800">{offer.title}</h4>
                    <span className="text-xs font-bold bg-amber-600 text-white px-2 py-1 rounded-full">{offer.discountPercentage}% OFF</span>
                  </div>
                  <p className="text-xs text-stone-500 mb-6">{offer.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${offer.isActive ? 'text-green-600' : 'text-stone-400'}`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => { setEditingOffer(offer); setIsOfferModalOpen(true); }}
                        className="p-2 text-stone-400 hover:text-stone-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete('offers', offer.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Villa Modal */}
      <AnimatePresence>
        {isVillaModalOpen && editingVilla && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsVillaModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-stone-900">{editingVilla.id ? 'Edit Villa' : 'Add New Villa'}</h3>
                <button onClick={() => setIsVillaModalOpen(false)} className="text-stone-400 hover:text-stone-900"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveVilla} className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Villa Name</label>
                    <input required type="text" value={editingVilla.name || ''} onChange={(e) => setEditingVilla({...editingVilla, name: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Location</label>
                    <input required type="text" value={editingVilla.location || ''} onChange={(e) => setEditingVilla({...editingVilla, location: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Price per Night</label>
                    <input required type="number" value={editingVilla.pricePerNight || ''} onChange={(e) => setEditingVilla({...editingVilla, pricePerNight: Number(e.target.value)})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Capacity (Guests)</label>
                    <input required type="number" value={editingVilla.capacity || ''} onChange={(e) => setEditingVilla({...editingVilla, capacity: Number(e.target.value)})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Description</label>
                  <textarea required value={editingVilla.description || ''} onChange={(e) => setEditingVilla({...editingVilla, description: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm h-24" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Image URL</label>
                  <input required type="text" value={editingVilla.imageUrls?.[0] || ''} onChange={(e) => setEditingVilla({...editingVilla, imageUrls: [e.target.value]})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked={editingVilla.isFeatured || false} onChange={(e) => setEditingVilla({...editingVilla, isFeatured: e.target.checked})} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                  <span className="text-sm font-medium text-stone-700">Featured Villa</span>
                </div>
                <div className="pt-6 border-t border-stone-100 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsVillaModalOpen(false)} className="px-6 py-3 text-sm font-bold text-stone-400 uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="bg-stone-900 text-white px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-amber-600 transition-all">Save Villa</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Modal */}
      <AnimatePresence>
        {isServiceModalOpen && editingService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-stone-900">{editingService.id ? 'Edit Service' : 'Add New Service'}</h3>
                <button onClick={() => setIsServiceModalOpen(false)} className="text-stone-400 hover:text-stone-900"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveService} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Service Title</label>
                  <input required type="text" value={editingService.title || ''} onChange={(e) => setEditingService({...editingService, title: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Description</label>
                  <textarea required value={editingService.description || ''} onChange={(e) => setEditingService({...editingService, description: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm h-24" />
                </div>
                <div className="pt-6 border-t border-stone-100 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-6 py-3 text-sm font-bold text-stone-400 uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="bg-stone-900 text-white px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-amber-600 transition-all">Save Service</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Testimonial Modal */}
      <AnimatePresence>
        {isTestimonialModalOpen && editingTestimonial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTestimonialModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-stone-900">{editingTestimonial.id ? 'Edit Review' : 'Add New Review'}</h3>
                <button onClick={() => setIsTestimonialModalOpen(false)} className="text-stone-400 hover:text-stone-900"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveTestimonial} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Guest Name</label>
                    <input required type="text" value={editingTestimonial.name || ''} onChange={(e) => setEditingTestimonial({...editingTestimonial, name: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Rating (1-5)</label>
                    <input required type="number" min="1" max="5" value={editingTestimonial.rating || ''} onChange={(e) => setEditingTestimonial({...editingTestimonial, rating: Number(e.target.value)})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Review Content</label>
                  <textarea required value={editingTestimonial.content || ''} onChange={(e) => setEditingTestimonial({...editingTestimonial, content: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm h-24" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Avatar URL</label>
                  <input required type="text" value={editingTestimonial.avatar || ''} onChange={(e) => setEditingTestimonial({...editingTestimonial, avatar: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                </div>
                <div className="pt-6 border-t border-stone-100 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsTestimonialModalOpen(false)} className="px-6 py-3 text-sm font-bold text-stone-400 uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="bg-stone-900 text-white px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-amber-600 transition-all">Save Review</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Offer Modal */}
      <AnimatePresence>
        {isOfferModalOpen && editingOffer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-stone-900">{editingOffer.id ? 'Edit Offer' : 'Add New Offer'}</h3>
                <button onClick={() => setIsOfferModalOpen(false)} className="text-stone-400 hover:text-stone-900"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveOffer} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Offer Title</label>
                    <input required type="text" value={editingOffer.title || ''} onChange={(e) => setEditingOffer({...editingOffer, title: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Discount %</label>
                    <input required type="number" value={editingOffer.discountPercentage || ''} onChange={(e) => setEditingOffer({...editingOffer, discountPercentage: Number(e.target.value)})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Promo Code</label>
                    <input type="text" value={editingOffer.promoCode || ''} onChange={(e) => setEditingOffer({...editingOffer, promoCode: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Description</label>
                  <textarea required value={editingOffer.description || ''} onChange={(e) => setEditingOffer({...editingOffer, description: e.target.value})} className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm h-24" />
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked={editingOffer.isActive || false} onChange={(e) => setEditingOffer({...editingOffer, isActive: e.target.checked})} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                  <span className="text-sm font-medium text-stone-700">Active Offer</span>
                </div>
                <div className="pt-6 border-t border-stone-100 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsOfferModalOpen(false)} className="px-6 py-3 text-sm font-bold text-stone-400 uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="bg-stone-900 text-white px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-amber-600 transition-all">Save Offer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
