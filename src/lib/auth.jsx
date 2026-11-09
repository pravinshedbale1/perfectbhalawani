import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isConfigured } from '../firebase';
import { STUDENT_EMAIL_DOMAIN, ADMIN_EMAIL_DOMAIN } from '../config';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export const studentEmail = (loginId) => `${String(loginId).trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@${STUDENT_EMAIL_DOMAIN}`;
export const adminEmail = (id) => (String(id).includes('@') ? String(id).trim() : `${String(id).trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, role: null, profile: null });

  const loadRole = async (user) => {
    if (!user) return setState({ loading: false, user: null, role: null, profile: null });
    try {
      const a = await getDoc(doc(db, 'admins', user.uid));
      if (a.exists()) return setState({ loading: false, user, role: 'admin', profile: { id: a.id, ...a.data() } });
      const s = await getDoc(doc(db, 'students', user.uid));
      if (s.exists()) return setState({ loading: false, user, role: 'student', profile: { id: s.id, ...s.data() } });
    } catch (e) {
      console.error(e);
    }
    setState({ loading: false, user, role: null, profile: null });
  };

  useEffect(() => {
    if (!isConfigured) return setState({ loading: false, user: null, role: null, profile: null });
    return onAuthStateChanged(auth, loadRole);
  }, []);

  const value = {
    ...state,
    refresh: () => loadRole(auth.currentUser),
    loginAdmin: (id, pw) => signInWithEmailAndPassword(auth, adminEmail(id), pw),
    loginStudent: (loginId, pw) => signInWithEmailAndPassword(auth, studentEmail(loginId), pw),
    logout: () => signOut(auth),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function authErrorMr(e) {
  const c = e?.code || '';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found'))
    return 'ID किंवा पासवर्ड चुकीचा आहे.';
  if (c.includes('too-many-requests')) return 'खूप प्रयत्न झाले. थोड्या वेळाने पुन्हा प्रयत्न करा.';
  if (c.includes('email-already-in-use')) return 'हा ID आधीच नोंदणीकृत आहे.';
  if (c.includes('weak-password')) return 'पासवर्ड किमान 6 अक्षरांचा हवा.';
  if (c.includes('network')) return 'इंटरनेट कनेक्शन तपासा.';
  if (c.includes('permission-denied')) return 'परवानगी नाही (Firestore rules तपासा).';
  return e?.message || 'काहीतरी चूक झाली.';
}
