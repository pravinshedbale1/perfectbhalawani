# परफेक्ट कॉम्प्युटर्स, भाळवणी — विद्यार्थी व्यवस्थापन पोर्टल

**perfectbhalawani.in** · React (Vite) + Firebase (Auth, Firestore) + Google Drive (Apps Script) · GitHub Pages

## सुविधा
**Admin:** बॅच तयार करणे · विद्यार्थी नोंदणी (बॅचनिहाय) · फी जमा व पावती (A4 वर 2 पावत्या) · मॉड्यूल/सराव व्यवस्थापन · सराव तपासणी व गुण · बॅचनिहाय लीडरबोर्ड · सूचना फलक · पासवर्ड रीसेट
**विद्यार्थी:** मोबाईल नंबरने लॉगिन · सराव व पायऱ्या · फाइल अपलोड (Drive) · गुण व अभिप्राय · लीडरबोर्ड · फी तपशील · पासवर्ड बदल

## फोल्डर रचना
```
apps-script/        Google Drive upload script (apps-script/README.md)
public/             CNAME (perfectbhalawani.in), logo.svg
src/config.js       ⚙️ Firebase config, Drive URL, संस्थेची माहिती, अभ्यासक्रम
src/firebase.js     Firebase init
src/lib/            auth, api (फी/पावती/अपलोड/लीडरबोर्ड), रक्कम-अक्षरी, format
src/components/     Header/Footer, Dashboard layout, Receipt, StudentForm
src/pages/          Home, Login, Setup, admin/*, student/*
src/seed/modules.js डेमो फाइलमधील 13 मॉड्यूल / 53 सराव
firestore.rules     🔒 Firestore सुरक्षा नियम
.github/workflows/  GitHub Pages auto-deploy
```

## सेटअप (एकदाच)

### 1. Firebase
1. Console → **Build → Authentication → Get started → Email/Password → Enable**.
2. **Authentication → Settings → Authorized domains → Add**: `perfectbhalawani.in` आणि `www.perfectbhalawani.in`.
3. **Build → Firestore Database → Create database** → Location: `asia-south1 (Mumbai)` → Production mode.
4. **Firestore → Rules** → `firestore.rules` मधील मजकूर पेस्ट → **Publish**.
5. **Project settings ⚙️ → General → Your apps → `</>` Web app** जोडा → config मधील मूल्ये `src/config.js` मध्ये भरा.

### 2. Google Drive upload
`apps-script/README.md` पहा.

### 3. Local चालवणे
```bash
npm install
npm run dev     # http://localhost:5173
```

### 4. पहिला Admin
साइट उघडून **`/setup`** वर जा → नाव, ईमेल, पासवर्ड → Admin तयार (हे पान फक्त एकदाच चालते).
नंतर Admin → **मॉड्यूल व सराव → "डेमो सराव लोड करा"**.

### 5. GitHub Pages
1. Repo → **Settings → Pages → Source: GitHub Actions**.
2. `main` वर push केल्यावर साइट आपोआप deploy होते.
3. **Settings → Pages → Custom domain**: `perfectbhalawani.in` → DNS तपासल्यानंतर ✅ **Enforce HTTPS**.

### 6. GoDaddy DNS (perfectbhalawani.in → DNS → Manage)
जुने `A` (Parked) record काढा आणि हे जोडा:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | `<github-username>.github.io` |

DNS सुरू व्हायला 10 मिनिटे ते काही तास लागू शकतात.

## दैनंदिन वापर
- **नवीन विद्यार्थी:** Admin → विद्यार्थी → + नवीन. मोबाईल नंबर = लॉगिन ID, डीफॉल्ट पासवर्ड `pc` + मोबाईलचे शेवटचे 4 अंक.
- **फी:** Admin → फी व पावती → विद्यार्थी शोधा → रक्कम → जमा → 🖨️ पावती (विद्यार्थी + कार्यालय प्रत एका A4 वर).
  अनेक पावत्या एकत्र: यादीत ✅ निवडा → "निवडलेल्या पावत्या प्रिंट" (एका A4 वर 2).
  प्रिंट करताना: Paper **A4**, Margins **None**, Scale **100%**, "Background graphics" ✅.
- **तपासणी:** Admin → मूल्यांकन → तपासा → फाइल उघडा → गुण + अभिप्राय → जतन (पुढील सराव आपोआप उघडतो).
