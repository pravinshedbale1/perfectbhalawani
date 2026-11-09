# Google Drive Upload सेटअप (Apps Script) — एकदाच, ~5 मिनिटे

विद्यार्थ्यांनी अपलोड केलेल्या फाइल्स थेट तुमच्या Google Drive मध्ये जातात:
`My Drive / Perfect Computers Submissions / <बॅच> / <विद्यार्थी> / ...`

> ⚠️ ज्या Google खात्याकडे Firebase project **perfect-bhalawani** आहे, त्याच खात्याने हे करा
> (Console URL मध्ये `/u/1/` आहे — म्हणजे ब्राउझरमधील दुसरे खाते).

1. https://script.google.com → **New project** → नाव: `Perfect Computers Drive`
2. डावीकडे ⚙️ **Project Settings** → ✅ "Show appsscript.json manifest file in editor"
3. **Editor** मध्ये:
   - `Code.gs` मधील सर्व मजकूर काढून या फोल्डरमधील `Code.gs` पेस्ट करा.
   - `appsscript.json` मध्ये या फोल्डरमधील `appsscript.json` पेस्ट करा.
4. ⚙️ **Project Settings → Script Properties → Add**:
   | Property | Value |
   |---|---|
   | `FIREBASE_API_KEY` | `src/config.js` मधील `apiKey` |
   | `FIREBASE_PROJECT` | `perfect-bhalawani` |
   5. Editor मध्ये function `authorize` निवडा → **Run** → परवानग्या **Allow** करा
   ("Google hasn't verified this app" आल्यास → Advanced → Go to … (unsafe) → Allow — हे तुमचेच script आहे).
6. **Deploy → New deployment** → प्रकार ⚙️ **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** → मिळालेली **Web app URL** (`https://script.google.com/macros/s/…/exec`) कॉपी करा.
7. ती URL `src/config.js` मधील `DRIVE_SCRIPT_URL` मध्ये पेस्ट करा, commit + push करा.

### तपासणी
ब्राउझरमध्ये Web app URL उघडा → `{"ok":true,...}` दिसले पाहिजे.

### Script मध्ये बदल केल्यास
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy** (URL तीच राहते).

### सुविधा
- `upload` — विद्यार्थी फाइल अपलोड (Firebase लॉगिन token तपासून, कमाल 10 MB)
