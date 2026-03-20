import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { firebaseConfig } from './firebaseConfig';

/**
 * Singleton class to manage Firebase connections.
 * Ensures only one instance of each service is initialized.
 */
class FirebaseConnection {
  private static instance: FirebaseConnection;
  private app: FirebaseApp;
  private db: Firestore;
  private auth: Auth;
  private storage: FirebaseStorage;
  private analytics: Analytics | null = null;

  private constructor() {
    // Initialize Firebase App
    this.app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Services
    // Note: We use the custom database ID from config if provided
    this.db = getFirestore(this.app, (firebaseConfig as any).firestoreDatabaseId);
    this.auth = getAuth(this.app);
    this.storage = getStorage(this.app);

    // Analytics is only supported in browser environments and requires a measurementId
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      isSupported().then(yes => {
        if (yes) this.analytics = getAnalytics(this.app);
      });
    }
  }

  public static getInstance(): FirebaseConnection {
    if (!FirebaseConnection.instance) {
      FirebaseConnection.instance = new FirebaseConnection();
    }
    return FirebaseConnection.instance;
  }

  public getDb(): Firestore {
    return this.db;
  }

  public getAuth(): Auth {
    return this.auth;
  }

  public getStorage(): FirebaseStorage {
    return this.storage;
  }

  public getAnalytics(): Analytics | null {
    return this.analytics;
  }
}

// Export initialized instances
const connection = FirebaseConnection.getInstance();
export const db = connection.getDb();
export const auth = connection.getAuth();
export const storage = connection.getStorage();
export const analytics = connection.getAnalytics();
export default connection;
