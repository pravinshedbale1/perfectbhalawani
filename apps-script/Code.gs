/**
 * परफेक्ट कॉम्प्युटर्स — Google Drive Upload
 *
 * हे script संस्थेच्या Google खात्यावर (ज्या खात्याकडे Firebase project आहे) चालते.
 * विद्यार्थ्यांनी अपलोड केलेल्या फाइल्स तुमच्या Drive मध्ये
 *   "Perfect Computers Submissions / <बॅच> / <विद्यार्थी>" फोल्डरमध्ये जतन होतात.
 *
 * सेटअप: apps-script/README.md पहा.
 *
 * Script Properties (Project Settings → Script properties):
 *   FIREBASE_API_KEY   = Firebase web API key (src/config.js मधील apiKey)
 *   FIREBASE_PROJECT   = perfect-bhalawani
 * *   ROOT_FOLDER_NAME   = Perfect Computers Submissions        (optional)
 */

var MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function doGet() {
  return json_({ ok: true, service: 'perfect-computers-drive', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var user = verifyIdToken_(body.idToken);

    switch (body.action) {
      case 'upload':
        return json_(upload_(user, body));
      case 'ping':
        return json_({ ok: true, uid: user.localId });
      default:
        return json_({ ok: false, error: 'अज्ञात action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

// ---------- Upload ----------
function upload_(user, body) {
  if (!body.base64) throw new Error('फाइल मिळाली नाही');
  var bytes = Utilities.base64Decode(body.base64);
  if (bytes.length > MAX_BYTES) throw new Error('फाइल 10 MB पेक्षा मोठी आहे');

  var root = getOrCreateFolder_(DriveApp.getRootFolder(), prop_('ROOT_FOLDER_NAME') || 'Perfect Computers Submissions');
  var batchFolder = getOrCreateFolder_(root, clean_(body.batchName || 'बॅच नाही'));
  var studentFolder = getOrCreateFolder_(batchFolder, clean_((body.studentName || 'विद्यार्थी') + ' - ' + user.localId.slice(0, 6)));

  var stamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy_HH-mm');
  var name = clean_((body.exerciseTitle || 'सराव')) + '__' + stamp + '__' + clean_(body.fileName || 'file');
  var blob = Utilities.newBlob(bytes, body.mimeType || 'application/octet-stream', name);
  var file = studentFolder.createFile(blob);
  file.setDescription('Student UID: ' + user.localId + '\nExercise: ' + (body.exerciseId || ''));
  // लिंक असलेल्या व्यक्तीला फक्त पाहता येईल (Admin व तो विद्यार्थी अ‍ॅपमधून उघडू शकतात)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    ok: true,
    fileId: file.getId(),
    fileName: body.fileName,
    url: file.getUrl(),
    size: bytes.length
  };
}

function getOrCreateFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function clean_(s) {
  return String(s).replace(/[\\/:*?"<>|#%]/g, '_').slice(0, 80);
}

// ---------- Auth ----------
function verifyIdToken_(idToken) {
  if (!idToken) throw new Error('लॉगिन आवश्यक आहे');
  var res = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + prop_('FIREBASE_API_KEY'),
    { method: 'post', contentType: 'application/json', payload: JSON.stringify({ idToken: idToken }), muteHttpExceptions: true }
  );
  var data = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200 || !data.users || !data.users.length) {
    throw new Error('लॉगिन सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.');
  }
  return data.users[0];
}

// ---------- Helpers ----------
function prop_(k) {
  return PropertiesService.getScriptProperties().getProperty(k);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Editor मधून एकदा Run करा — Drive व बाहेरील परवानग्या मंजूर करण्यासाठी. */
function authorize() {
  DriveApp.getRootFolder();
  UrlFetchApp.fetch('https://www.google.com');
  Logger.log('OK');
}
