import React, { useEffect, useState } from 'react';
import { resourceManager } from '../firebase/resourceManager';
import { Villa } from '../types';

/**
 * Example Component demonstrating the use of the modular Firebase Resource Manager.
 */
export const FirebaseExample: React.FC = () => {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        // Using the standardized CRUD function from resourceManager
        const data = await resourceManager.villas.getAll();
        setVillas(data as Villa[]);
      } catch (error) {
        console.error('Failed to fetch villas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVillas();
  }, []);

  const handleAddVilla = async () => {
    const newVilla = {
      name: "New Luxury Sanctuary",
      location: "Goa, India",
      pricePerNight: 45000,
      bedrooms: 4,
      // ... other villa fields
    };

    try {
      const docRef = await resourceManager.villas.add(newVilla);
      console.log('Villa added with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding villa:', error);
    }
  };

  if (loading) return <div>Loading sanctuaries...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-serif mb-4">Villa Registry</h1>
      <button 
        onClick={handleAddVilla}
        className="mb-6 bg-stone-900 text-white px-6 py-2 rounded-full text-sm uppercase tracking-widest"
      >
        Add New Villa
      </button>
      
      <div className="grid gap-4">
        {villas.map(villa => (
          <div key={villa.id} className="p-4 border border-stone-200 rounded-2xl flex justify-between items-center">
            <span>{villa.name} - {villa.location}</span>
            <button 
              onClick={() => resourceManager.villas.delete(villa.id)}
              className="text-red-500 text-xs uppercase font-bold"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
