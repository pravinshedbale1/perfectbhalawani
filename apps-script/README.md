# Google Drive Upload (Apps Script)

विद्यार्थ्यांनी अपलोड केलेल्या फाइल्स **pravinshedbale10@gmail.com** च्या Drive मध्ये जातात:
`My Drive / Perfect Computers Submissions / <बॅच> / <Student ID - नाव> / <सराव>__<दिनांक>__<फाइल>`

- **परवानगी फक्त `drive.file`** — script फक्त स्वतः तयार केलेले फोल्डर/फाइल्स पाहू शकते; Drive मधील इतर काहीही नाही.
- फक्त नोंदणीकृत व **सक्रिय** विद्यार्थीच अपलोड करू शकतो (Firebase token + Firestore `students/{uid}` तपासणी).
- कमाल 10 MB. फाइल "लिंक असलेल्यांना पाहता येईल" अशी शेअर होते.

## सध्याचे deployment
- Script: https://script.google.com/u/1/home/projects/1keMt8_alcR46G-cZ1HbrYsIdbT3Y5DH_CC03HI67oZ7ltX5clGWOED0k/edit
- Web app URL (`src/config.js` → `DRIVE_SCRIPT_URL`):
  `https://script.google.com/macros/s/AKfycbzVfiSAxFdy7zlm5WY0p4GSPMuvzOaw8hm31daazGpcfYzGy8fmKZMg67O5eEUUaTJQ/exec`

## कोड बदलल्यावर (clasp)
```bash
npm i -g @google/clasp
clasp login                      # pravinshedbale10@gmail.com
cd apps-script
clasp push -f
clasp update-deployment AKfycbzVfiSAxFdy7zlm5WY0p4GSPMuvzOaw8hm31daazGpcfYzGy8fmKZMg67O5eEUUaTJQ --description "..."
```
`update-deployment` मुळे URL तीच राहते. `appsscript.json` मध्ये नवीन परवानगी (scope) जोडल्यास,
editor मध्ये `authorize` function एकदा Run करून पुन्हा Allow करावे लागेल.

## तपासणी
Web app URL ब्राउझरमध्ये उघडा → `{"ok":true,"service":"perfect-computers-drive",...}`
