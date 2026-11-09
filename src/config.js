// ============================================================
//  संस्थेची माहिती व Firebase / Drive सेटिंग्ज
// ============================================================

// Firebase Console → Project settings (⚙️) → General → "Your apps" → Web app → SDK setup → Config
// येथील मूल्ये खाली पेस्ट करा. (ही माहिती सार्वजनिक असते; सुरक्षा firestore.rules मधून होते.)
export const FIREBASE_CONFIG = {
  apiKey: 'PASTE_API_KEY',
  authDomain: 'perfect-bhalawani.firebaseapp.com',
  projectId: 'perfect-bhalawani',
  storageBucket: 'perfect-bhalawani.firebasestorage.app',
  messagingSenderId: 'PASTE_SENDER_ID',
  appId: 'PASTE_APP_ID',
};

// Google Apps Script Web App URL (apps-script/README.md पहा)
export const DRIVE_SCRIPT_URL = 'PASTE_APPS_SCRIPT_WEB_APP_URL';

// लॉगिन व्यवस्था (Google login नाही):
//  • Admin: Admin ID (उदा. "admin") + पासवर्ड  → अंतर्गत ईमेल admin@perfectbhalawani.in
//  • विद्यार्थी: Student ID (उदा. PC1001) + पासवर्ड → अंतर्गत ईमेल pc1001@students.perfectbhalawani.in
export const ADMIN_EMAIL_DOMAIN = 'perfectbhalawani.in';
export const STUDENT_EMAIL_DOMAIN = 'students.perfectbhalawani.in';
export const STUDENT_ID_PREFIX = 'PC';
export const STUDENT_ID_START = 1000; // पहिला विद्यार्थी = PC1001
// नोंदणीवेळी व रीसेटवेळी वापरला जाणारा डीफॉल्ट पासवर्ड (किमान 6 अक्षरे)
export const DEFAULT_STUDENT_PASSWORD = 'Perfect@123';

export const CENTER = {
  nameMr: 'परफेक्ट कॉम्प्युटर्स',
  nameEn: "PERFECT COMPUTER'S",
  place: 'भाळवणी',
  placeEn: 'BHALAWANI',
  tagline: 'संगणक प्रशिक्षण केंद्र',
  owner: 'श्री. रघुनाथ पवार',
  director: 'सौ. धनश्री पवार',
  phones: ['9665978585', '8956490770'],
  address: 'मारुती मंदिराजवळ, कसबा, भाळवणी',
  email: '',
  receiptPrefix: 'PC',
};

export const COURSES = [
  { name: 'CCC', mr: 'संगणक मूलभूत अभ्यासक्रम (CCC)', icon: '💻', desc: 'संगणकाची ओळख, फाइल व्यवस्थापन, इंटरनेट, ईमेल व डिजिटल व्यवहार.' },
  { name: 'Tally', mr: 'टॅली (Tally Prime + GST)', icon: '📊', desc: 'लेखा व्यवस्थापन, व्हाउचर एंट्री, GST व व्यावसायिक अहवाल.' },
  { name: 'Excel', mr: 'Advanced Excel', icon: '📈', desc: 'सूत्रे, चार्ट, Pivot Table, डेटा विश्लेषण व कार्यालयीन अहवाल.' },
  { name: 'Typing', mr: 'मराठी व इंग्रजी टायपिंग', icon: '⌨️', desc: 'वेग व अचूकता — शासकीय टायपिंग परीक्षेची तयारी.' },
  { name: 'AI', mr: 'AI व आधुनिक तंत्रज्ञान', icon: '🤖', desc: 'AI साधनांचा जबाबदार वापर, Prompt लेखन व कार्यालयीन कामकाज.' },
  { name: 'Office', mr: 'ऑफिस ऑटोमेशन', icon: '📝', desc: 'Writer/Word, Calc/Excel, Impress/PowerPoint मध्ये व्यावसायिक कागदपत्रे.' },
];
