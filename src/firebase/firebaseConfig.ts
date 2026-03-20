import firebaseAppletConfig from '../../firebase-applet-config.json';

/**
 * Firebase Configuration
 * Strictly uses firebase-applet-config.json as the source of truth.
 */
export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  projectId: firebaseAppletConfig.projectId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
  appId: firebaseAppletConfig.appId,
  measurementId: firebaseAppletConfig.measurementId,
  firestoreDatabaseId: (firebaseAppletConfig as any).firestoreDatabaseId
};

console.log('Firebase Config Initialized for Project:', firebaseConfig.projectId);
