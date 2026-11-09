import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config';

export const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);

// विद्यार्थी खाते तयार करताना Admin लॉगआउट होऊ नये म्हणून दुसरे (secondary) app
let secondary;
export function secondaryAuth() {
  if (!secondary) secondary = getAuth(initializeApp(FIREBASE_CONFIG, 'secondary'));
  return secondary;
}

export const isConfigured = !String(FIREBASE_CONFIG.apiKey).startsWith('PASTE');
