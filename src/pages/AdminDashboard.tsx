import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, FirestoreOperationType, resourceManager } from '../firebase';
import { User, Villa, Service, Testimonial, SiteSettings, AppTheme, Lead, LeadStatus, Offer } from '../types';
import { Plus, Edit2, Trash2, Save, X, Settings, Home, Star, MessageSquare, Users, TrendingUp, Phone, Image as ImageIcon, Check, Loader2, Sparkles, Wand2, Zap, PlusCircle, Layout, ArrowRight, Mail, FileSpreadsheet, RefreshCw, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/18sZ__tc8sv_pjx4dGjvh8FAhCHQ1aek0zwvCxHOlYeQ/edit?usp=sharing');

  // Modal states
  const [isVillaModalOpen, setIsVillaModalOpen] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Partial<Villa> | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);

  // AI Villa Management states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingVilla, setIsGeneratingVilla] = useState(false);
  const [narrativeHint, setNarrativeHint] = useState('');
  const [isBuildingNarrative, setIsBuildingNarrative] = useState(false);

  useEffect(() => {
    const unsubLeads = onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc')), (snap) => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
    }, (error) => handleFirestoreError(error, FirestoreOperationType.LIST, 'leads'));
    const unsubVillas = onSnapshot(collection(db, 'villas'), (snap) => {
      setVillas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Villa)));
    }, (error) => handleFirestoreError(error, FirestoreOperationType.LIST, 'villas'));
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    }, (error) => handleFirestoreError(error, FirestoreOperationType.LIST, 'services'));
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snap) => {
      setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial)));
    }, (error) => handleFirestoreError(error, FirestoreOperationType.LIST, 'testimonials'));
    const unsubOffers = onSnapshot(collection(db, 'offers'), (snap) => {
      setOffers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Offer)));
    }, (error) => handleFirestoreError(error, FirestoreOperationType.LIST, 'offers'));
    const unsubSettings = onSnapshot(doc(db, 'settings', 'site'), (snap) => {
      if (snap.exists()) setSettings(snap.data() as SiteSettings);
      setLoading(false);
    }, (error) => handleFirestoreError(error, FirestoreOperationType.GET, 'settings/site'));

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

  const handleSyncFromSheet = async () => {
    if (!sheetUrl.trim()) {
      alert('Please enter a valid Google Sheet URL');
      return;
    }

    setIsSyncing(true);
    try {
      // Extract ID from URL
      const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        alert('Invalid Google Sheet URL format');
        return;
      }
      const sheetId = sheetIdMatch[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch spreadsheet. Ensure it is shared with "Anyone with the link" as Viewer.');
      }

      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      
      // Basic parsing logic - assuming key-value pairs or specific headers
      // For now, let's look for keywords in the first two columns
      const newSettings = { ...settings } as SiteSettings;
      
      rows.forEach(row => {
        if (row.length >= 2) {
          const key = row[0].toLowerCase();
          const value = row[1];
          
          if (key.includes('email')) newSettings.contactEmail = value;
          if (key.includes('phone')) newSettings.contactPhone = value;
          if (key.includes('whatsapp')) newSettings.whatsappNumber = value;
        }
      });

      setSettings(newSettings);
      alert('Contact details synced from spreadsheet! Review and save changes.');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Error syncing from spreadsheet: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        // Clear editing states if the deleted item was being edited
        if (collectionName === 'villas' && editingVilla?.id === id) setEditingVilla(null);
        if (collectionName === 'services' && editingService?.id === id) setEditingService(null);
        if (collectionName === 'testimonials' && editingTestimonial?.id === id) setEditingTestimonial(null);
        if (collectionName === 'offers' && editingOffer?.id === id) setEditingOffer(null);
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
        alert('Villa updated successfully!');
      } else {
        await addDoc(collection(db, 'villas'), {
          ...editingVilla,
          rating: 4.8,
          ratingCount: 0,
          createdAt: serverTimestamp()
        });
        alert('Villa registered successfully!');
      }
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

  const handleAiVillaGenerate = async () => {
    if (!aiPrompt.trim() || isGeneratingVilla) return;
    setIsGeneratingVilla(true);
    try {
      const response = await fetch('/api/ai/generate-villa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, type: 'full' })
      });
      const data = await response.json();
      if (data) {
        setEditingVilla({
          ...editingVilla,
          name: data.name || '',
          location: data.location || '',
          pricePerNight: data.pricePerNight || 0,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          capacity: data.capacity || 0,
          description: data.description || '',
          longDescription: data.longDescription || '',
          imageUrls: editingVilla?.imageUrls || [],
          videoUrls: [],
          amenities: [],
          includedServices: [],
          isFeatured: false,
          rating: 4.8,
          ratingCount: 0,
          numRooms: data.bedrooms || 0,
          mealsAvailable: true,
          petFriendly: false,
          refundPolicy: 'Flexible'
        });
      }
    } catch (error) {
      console.error("AI Villa Generation Error:", error);
    } finally {
      setIsGeneratingVilla(false);
    }
  };

  const handleAiNarrativeGenerate = async () => {
    if (!narrativeHint.trim() || isBuildingNarrative) return;
    setIsBuildingNarrative(true);
    try {
      const response = await fetch('/api/ai/generate-villa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: narrativeHint, type: 'narrative' })
      });
      const data = await response.json();
      if (data) {
        setEditingVilla({
          ...editingVilla,
          description: data.description || editingVilla?.description || '',
          longDescription: data.longDescription || editingVilla?.longDescription || ''
        });
      }
    } catch (error) {
      console.error("AI Narrative Generation Error:", error);
    } finally {
      setIsBuildingNarrative(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingVilla) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        resourceManager.villas.uploadImage(file as File, editingVilla.id || 'new')
      );
      const urls = await Promise.all(uploadPromises);
      
      const newUrls = [...(editingVilla.imageUrls || []), ...urls];
      setEditingVilla({
        ...editingVilla,
        imageUrls: newUrls
      });

      // Immediate save if villa exists
      if (editingVilla.id) {
        await updateDoc(doc(db, 'villas', editingVilla.id), {
          imageUrls: newUrls,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images. Please check your storage rules.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateGallery = async (newUrls: string[]) => {
    if (!editingVilla) return;
    
    setEditingVilla({ ...editingVilla, imageUrls: newUrls });
    
    // Immediate save if villa exists
    if (editingVilla.id) {
      setIsSavingGallery(true);
      try {
        await updateDoc(doc(db, 'villas', editingVilla.id), {
          imageUrls: newUrls,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, FirestoreOperationType.UPDATE, `villas/${editingVilla.id}`);
      } finally {
        setIsSavingGallery(false);
      }
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
                  if (activeTab === 'villas') { setEditingVilla({ imageUrls: [], amenities: [], includedServices: [], videoUrls: [] }); }
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
                  {leads?.map(lead => (
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
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                      type="text" 
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Contact Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                      type="email" 
                      value={settings.contactEmail || ''}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                      type="text" 
                      value={settings.contactPhone || ''}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-serif font-bold">External Data Sync</h4>
                    <p className="text-xs text-stone-400">Connect a Google Sheet to sync contact details automatically.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet size={20} className="text-green-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Google Sheets</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-grow">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Spreadsheet URL</label>
                    <input 
                      type="text" 
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full bg-stone-50 border-stone-200 rounded-xl py-3 px-4 text-sm focus:ring-green-500"
                    />
                  </div>
                  <button 
                    onClick={handleSyncFromSheet}
                    disabled={isSyncing}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    <span>Sync Details</span>
                  </button>
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
            <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)]">
              {/* Registry Sidebar */}
              <div className="w-full lg:w-80 border-r border-stone-100 bg-stone-50/50 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-serif font-bold text-stone-900">Registry</h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={async () => {
                        if (window.confirm('This will delete all current villas and reset to default data. Continue?')) {
                          try {
                            const { INITIAL_VILLAS } = await import('../constants');
                            // Delete all current villas
                            if (villas) {
                              for (const v of villas) {
                                await deleteDoc(doc(db, 'villas', v.id));
                              }
                            }
                            // Add initial villas
                            for (const v of INITIAL_VILLAS) {
                              const { id, ...data } = v;
                              await addDoc(collection(db, 'villas'), {
                                ...data,
                                createdAt: serverTimestamp()
                              });
                            }
                            alert('Villas reset to defaults successfully!');
                          } catch (error) {
                            console.error('Reset failed', error);
                          }
                        }
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:underline"
                    >
                      Reset
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{villas.length} Stays</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {villas?.map(villa => (
                    <div key={villa.id} className="group relative">
                      <button
                        onClick={() => setEditingVilla(villa)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 pr-12 ${
                          editingVilla?.id === villa.id 
                            ? 'bg-white border-amber-200 shadow-md ring-1 ring-amber-100' 
                            : 'bg-white border-stone-100 hover:border-amber-200'
                        }`}
                      >
                        <img src={villa.imageUrls?.[0]} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-stone-800 truncate">{villa.name}</p>
                          <p className="text-[10px] text-stone-400 truncate">{villa.location}</p>
                        </div>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete('villas', villa.id); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => setEditingVilla({})}
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <PlusCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Register Property</span>
                  </button>
                </div>
              </div>

              {/* Main Property Form */}
              <div className="flex-grow overflow-y-auto p-8 lg:p-12 bg-white">
                {editingVilla ? (
                  <div className="max-w-4xl mx-auto">
                    {/* AI Prompt Bar */}
                    <div className="mb-12 relative">
                      <div className="bg-stone-900 rounded-full p-2 flex items-center shadow-2xl">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 ml-1">
                          <Zap size={20} />
                        </div>
                        <input 
                          type="text" 
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="AI Prompt: 'A 3BHK luxury estate in Karjat with an infinity pool...'"
                          className="flex-grow bg-transparent border-none focus:ring-0 text-white text-sm px-4 placeholder-stone-500"
                        />
                        <button 
                          onClick={handleAiVillaGenerate}
                          disabled={isGeneratingVilla}
                          className="bg-stone-700 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                          {isGeneratingVilla ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                          <span>Craft</span>
                        </button>
                      </div>
                    </div>

                    <div className="mb-10">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-2 block">Property Editor</span>
                      <h2 className="text-4xl font-serif font-bold text-stone-900">{editingVilla.id ? 'Edit Property' : 'New Property'}</h2>
                    </div>

                    <form onSubmit={handleSaveVilla} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Property Identity</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="Property Name"
                            value={editingVilla.name || ''} 
                            onChange={(e) => setEditingVilla({...editingVilla, name: e.target.value})} 
                            className="w-full bg-stone-50 border-stone-200 rounded-2xl py-4 px-6 text-sm focus:ring-amber-500" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Geography</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="Location (e.g. Goa, India)"
                            value={editingVilla.location || ''} 
                            onChange={(e) => setEditingVilla({...editingVilla, location: e.target.value})} 
                            className="w-full bg-stone-50 border-stone-200 rounded-2xl py-4 px-6 text-sm focus:ring-amber-500" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Rate / Night</label>
                          <div className="flex items-center">
                            <span className="text-stone-400 mr-2 text-sm">₹</span>
                            <input 
                              required 
                              type="number" 
                              value={editingVilla.pricePerNight || ''} 
                              onChange={(e) => setEditingVilla({...editingVilla, pricePerNight: Number(e.target.value)})} 
                              className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0" 
                            />
                          </div>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">BHK</label>
                          <div className="flex items-center">
                            <Home size={14} className="text-stone-400 mr-2" />
                            <input 
                              required 
                              type="number" 
                              value={editingVilla.bedrooms || ''} 
                              onChange={(e) => setEditingVilla({...editingVilla, bedrooms: Number(e.target.value)})} 
                              className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0" 
                            />
                          </div>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Baths</label>
                          <div className="flex items-center">
                            <Layout size={14} className="text-stone-400 mr-2" />
                            <input 
                              required 
                              type="number" 
                              value={editingVilla.bathrooms || ''} 
                              onChange={(e) => setEditingVilla({...editingVilla, bathrooms: Number(e.target.value)})} 
                              className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0" 
                            />
                          </div>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Capacity</label>
                          <div className="flex items-center">
                            <Users size={14} className="text-stone-400 mr-2" />
                            <input 
                              required 
                              type="number" 
                              value={editingVilla.capacity || ''} 
                              onChange={(e) => setEditingVilla({...editingVilla, capacity: Number(e.target.value)})} 
                              className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0" 
                            />
                          </div>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Total Rooms</label>
                          <div className="flex items-center">
                            <Layout size={14} className="text-stone-400 mr-2" />
                            <input 
                              required 
                              type="number" 
                              value={editingVilla.numRooms || ''} 
                              onChange={(e) => setEditingVilla({...editingVilla, numRooms: Number(e.target.value)})} 
                              className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* AI Narrative Studio */}
                      <div className="bg-blue-50/30 border border-blue-100 rounded-[2rem] p-8">
                        <div className="flex items-center space-x-2 mb-6">
                          <Sparkles size={16} className="text-blue-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">AI Narrative Studio</span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                          <div className="flex-grow w-full">
                            <input 
                              type="text" 
                              value={narrativeHint}
                              onChange={(e) => setNarrativeHint(e.target.value)}
                              placeholder="Creative hint: 'Focus on infinity pool and sunset views'..."
                              className="w-full bg-white border-stone-200 rounded-xl py-4 px-6 text-sm focus:ring-blue-500"
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={handleAiNarrativeGenerate}
                            disabled={isBuildingNarrative}
                            className="bg-stone-400 text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
                          >
                            {isBuildingNarrative ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                            <span>Build Narrative</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Engaging One-Liner (Short)</label>
                          <textarea 
                            required 
                            value={editingVilla.description || ''} 
                            onChange={(e) => setEditingVilla({...editingVilla, description: e.target.value})} 
                            placeholder="Engaging one-liner..."
                            className="w-full bg-stone-50 border-stone-200 rounded-2xl py-4 px-6 text-sm h-24 focus:ring-amber-500" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Immersive Property Story (Long)</label>
                          <textarea 
                            required 
                            value={editingVilla.longDescription || ''} 
                            onChange={(e) => setEditingVilla({...editingVilla, longDescription: e.target.value})} 
                            placeholder="Immersive property story..."
                            className="w-full bg-stone-50 border-stone-200 rounded-2xl py-4 px-6 text-sm h-48 focus:ring-amber-500" 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Amenities (Comma separated)</label>
                            <textarea 
                              value={editingVilla.amenities?.join(', ') || ''} 
                              onChange={(e) => setEditingVilla({...editingVilla, amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})} 
                              placeholder="Pool, Wi-Fi, AC, Kitchen..."
                              className="w-full bg-stone-50 border-stone-200 rounded-2xl py-4 px-6 text-sm h-32 focus:ring-amber-500" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Included Services (Comma separated)</label>
                            <textarea 
                              value={editingVilla.includedServices?.join(', ') || ''} 
                              onChange={(e) => setEditingVilla({...editingVilla, includedServices: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})} 
                              placeholder="Housekeeping, Caretaker, Breakfast..."
                              className="w-full bg-stone-50 border-stone-200 rounded-2xl py-4 px-6 text-sm h-32 focus:ring-amber-500" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Video URLs (Comma separated)</label>
                          <textarea 
                            value={editingVilla.videoUrls?.join(', ') || ''} 
                            onChange={(e) => setEditingVilla({...editingVilla, videoUrls: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})} 
                            placeholder="YouTube or Vimeo links..."
                            className="w-full bg-stone-50 border-stone-200 rounded-2xl py-4 px-6 text-sm h-24 focus:ring-amber-500" 
                          />
                        </div>

                        {/* Logistics & Policies */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">Property Logistics</label>
                            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                              <span className="text-sm font-medium text-stone-700">Meals Available</span>
                              <button 
                                type="button"
                                onClick={() => setEditingVilla({...editingVilla, mealsAvailable: !editingVilla.mealsAvailable})}
                                className={`w-12 h-6 rounded-full transition-colors relative ${editingVilla.mealsAvailable ? 'bg-amber-500' : 'bg-stone-300'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingVilla.mealsAvailable ? 'left-7' : 'left-1'}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                              <span className="text-sm font-medium text-stone-700">Pet Friendly</span>
                              <button 
                                type="button"
                                onClick={() => setEditingVilla({...editingVilla, petFriendly: !editingVilla.petFriendly})}
                                className={`w-12 h-6 rounded-full transition-colors relative ${editingVilla.petFriendly ? 'bg-amber-500' : 'bg-stone-300'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingVilla.petFriendly ? 'left-7' : 'left-1'}`} />
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Cancellation & Refund Policy</label>
                            <textarea 
                              value={editingVilla.refundPolicy || ''} 
                              onChange={(e) => setEditingVilla({...editingVilla, refundPolicy: e.target.value})} 
                              placeholder="Standard policy: 100% refund if cancelled 7 days prior..."
                              className="w-full bg-stone-50 border-stone-200 rounded-2xl py-4 px-6 text-sm h-32 focus:ring-amber-500" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Visual Gallery */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Visual Gallery</label>
                            {isSavingGallery && <Loader2 size={12} className="animate-spin text-amber-500" />}
                          </div>
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                            {editingVilla.imageUrls?.length || 0} Assets
                          </span>
                        </div>

                        {/* Bulk Add URLs */}
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Bulk Add Image URLs (One per line or comma separated)</label>
                          <textarea 
                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                            className="w-full bg-white border-stone-200 rounded-xl py-3 px-4 text-xs h-24 focus:ring-amber-500 mb-3"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                const target = e.target as HTMLTextAreaElement;
                                const urls = target.value.split(/[\n,]+/).map(s => s.trim()).filter(s => s !== '');
                                if (urls.length > 0) {
                                  handleUpdateGallery([...(editingVilla.imageUrls || []), ...urls]);
                                  target.value = '';
                                }
                              }
                            }}
                          />
                          <p className="text-[8px] text-stone-400 uppercase tracking-widest">Press Ctrl + Enter to bulk add</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {editingVilla.imageUrls?.map((url, idx) => (
                            <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-stone-100 relative group">
                              <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              
                              {/* Overlay Controls */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <div className="flex items-center space-x-2">
                                  {idx > 0 && (
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newUrls = [...(editingVilla.imageUrls || [])];
                                        [newUrls[idx], newUrls[idx - 1]] = [newUrls[idx - 1], newUrls[idx]];
                                        handleUpdateGallery(newUrls);
                                      }}
                                      className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg text-white transition-colors"
                                      title="Move Left"
                                    >
                                      <ChevronLeft size={16} />
                                    </button>
                                  )}
                                  {idx < (editingVilla.imageUrls?.length || 0) - 1 && (
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newUrls = [...(editingVilla.imageUrls || [])];
                                        [newUrls[idx], newUrls[idx + 1]] = [newUrls[idx + 1], newUrls[idx]];
                                        handleUpdateGallery(newUrls);
                                      }}
                                      className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg text-white transition-colors"
                                      title="Move Right"
                                    >
                                      <ChevronRight size={16} />
                                    </button>
                                  )}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newUrls = [...(editingVilla.imageUrls || [])];
                                    newUrls.splice(idx, 1);
                                    handleUpdateGallery(newUrls);
                                  }}
                                  className="bg-red-500/80 hover:bg-red-500 p-2 rounded-xl text-white transition-colors"
                                  title="Delete Image"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {/* Upload Button */}
                          <label className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer relative overflow-hidden">
                            {isUploading ? (
                              <div className="flex flex-col items-center">
                                <Loader2 size={24} className="animate-spin text-blue-500" />
                                <span className="text-[8px] font-bold uppercase tracking-widest mt-2">Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <Upload size={24} />
                                <span className="text-[8px] font-bold uppercase tracking-widest mt-2">Upload Images</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              className="hidden" 
                              disabled={isUploading}
                            />
                          </label>

                          <button 
                            type="button"
                            onClick={() => {
                              const url = prompt('Enter Image URL:');
                              if (url) handleUpdateGallery([...(editingVilla.imageUrls || []), url]);
                            }}
                            className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:border-amber-300 hover:text-amber-600 transition-all"
                          >
                            <Plus size={24} />
                            <span className="text-[8px] font-bold uppercase tracking-widest mt-2">Add URL</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-10 border-t border-stone-100">
                        <button 
                          type="submit" 
                          className="w-full bg-stone-900 text-white py-6 rounded-full font-bold text-sm uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-2xl flex items-center justify-center space-x-3"
                        >
                          <Layout size={18} />
                          <span>Publish Property</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 mb-6">
                      <Home size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Property Management</h3>
                    <p className="text-stone-400 text-sm max-w-sm">Select a property from the registry or register a new one to begin editing.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Services List */}
          {activeTab === 'services' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services?.map(service => (
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
              {testimonials?.map(t => (
                <div key={t.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <img src={t.avatar} className="w-8 h-8 rounded-full" />
                    <h4 className="font-bold text-stone-800 text-sm">{t.name}</h4>
                  </div>
                  <p className="text-xs text-stone-500 italic mb-4">"{t.content}"</p>
                  <div className="flex justify-between items-center">
                    <div className="flex text-amber-400">
                      {[...Array(t.rating || 0)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
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
              {offers?.map(offer => (
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

      {/* Villa Modal - DEPRECATED in favor of inline editor */}
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
