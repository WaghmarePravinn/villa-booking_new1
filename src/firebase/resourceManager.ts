import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './dbConnection';

/**
 * Standardized Resource Manager for Firestore CRUD operations.
 */
export const resourceManager = {
  /**
   * Villa Management
   */
  villas: {
    async add(data: any) {
      return await addDoc(collection(db, 'villas'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    },
    async update(id: string, data: any) {
      const villaRef = doc(db, 'villas', id);
      return await updateDoc(villaRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    },
    async delete(id: string) {
      return await deleteDoc(doc(db, 'villas', id));
    },
    async getAll() {
      const snapshot = await getDocs(collection(db, 'villas'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async uploadImage(file: File, villaId: string) {
      const storageRef = ref(storage, `villas/${villaId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    }
  },

  /**
   * Reviews Management
   */
  reviews: {
    async submit(data: any) {
      return await addDoc(collection(db, 'reviews'), {
        ...data,
        status: 'pending', // Default status
        createdAt: serverTimestamp()
      });
    },
    async approve(id: string) {
      return await updateDoc(doc(db, 'reviews', id), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });
    },
    async reject(id: string) {
      return await updateDoc(doc(db, 'reviews', id), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });
    }
  },

  /**
   * Offers Management
   */
  offers: {
    async edit(id: string, data: any) {
      return await updateDoc(doc(db, 'offers', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    },
    async enable(id: string) {
      return await updateDoc(doc(db, 'offers', id), {
        isActive: true
      });
    },
    async disable(id: string) {
      return await updateDoc(doc(db, 'offers', id), {
        isActive: false
      });
    }
  }
};
