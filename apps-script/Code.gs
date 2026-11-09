/**
 * परफेक्ट कॉम्प्युटर्स — Google Drive Upload
 *
 * विद्यार्थ्यांनी अपलोड केलेल्या फाइल्स या script च्या मालकाच्या Google Drive मध्ये
 *   "Perfect Computers Submissions / <बॅच> / <Student ID - नाव>" फोल्डरमध्ये जतन होतात.
 *
 * सुरक्षा:
 *   1. Firebase लॉगिन token तपासला जातो (accounts:lookup).
 *   2. त्याच token ने Firestore मधील students/{uid} वाचला जातो — फक्त नोंदणीकृत,
 *      सक्रिय विद्यार्थीच अपलोड करू शकतो. नाव व बॅच Firestore मधूनच घेतले जातात.
 *
 * Firebase web API key सार्वजनिक असते (src/config.js मध्येही आहे), त्यामुळे इथे ठेवणे सुरक्षित आहे.
 */

var FIREBASE_API_KEY = 'AIzaSyBNUgLVzlrKBQ8eecJGWxtkTcUN4JX6e1w';
var FIREBASE_PROJECT = 'perfect-bhalawani';
var ROOT_FOLDER_NAME = 'Perfect Computers Submissions';
var MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function doGet() {
  return json_({ ok: true, service: 'perfect-computers-drive', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var user = verifyIdToken_(body.idToken);
    var student = getStudent_(user.localId, body.idToken);

    switch (body.action) {
      case 'upload':
        return json_(upload_(user, student, body));
      case 'ping':
        return json_({ ok: true, uid: user.localId, student: student.loginId });
      default:
        return json_({ ok: false, error: 'अज्ञात action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

// ---------- Upload ----------
// Drive प्रवेश फक्त "drive.file" परवानगीने: हे script फक्त स्वतः तयार केलेले
// फोल्डर/फाइल्स पाहू व बदलू शकते — तुमच्या Drive मधील इतर काहीही नाही.
var DRIVE = 'https://www.googleapis.com/drive/v3';
var FOLDER_MIME = 'application/vnd.google-apps.folder';

function upload_(user, student, body) {
  if (!body.base64) throw new Error('फाइल मिळाली नाही');
  var bytes = Utilities.base64Decode(body.base64);
  if (bytes.length > MAX_BYTES) throw new Error('फाइल 10 MB पेक्षा मोठी आहे');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // एकाच वेळी दोन अपलोडमुळे दुहेरी फोल्डर होऊ नयेत
  var studentFolderId;
  try {
    var rootId = folder_('root', '', ROOT_FOLDER_NAME);
    var batchId = folder_('b:' + (student.batchName || '-'), rootId, clean_(student.batchName || 'बॅच नाही'));
    studentFolderId = folder_('s:' + user.localId, batchId, clean_((student.loginId || user.localId.slice(0, 6)) + ' - ' + (student.name || 'विद्यार्थी')));
  } finally {
    lock.releaseLock();
  }

  var stamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy_HH-mm');
  var name = clean_(body.exerciseTitle || 'सराव') + '__' + stamp + '__' + clean_(body.fileName || 'file');
  var file = createFile_(studentFolderId, name, body.mimeType || 'application/octet-stream', bytes,
    'Student: ' + (student.loginId || '') + ' ' + (student.name || '') + '\nUID: ' + user.localId + '\nExercise: ' + (body.exerciseId || ''));
  // लिंक असलेल्या व्यक्तीला फक्त पाहता येईल (Admin व तो विद्यार्थी अ‍ॅपमधून उघडू शकतात)
  api_('post', DRIVE + '/files/' + file.id + '/permissions', { role: 'reader', type: 'anyone' });

  return { ok: true, fileId: file.id, fileName: body.fileName, url: file.webViewLink, size: bytes.length };
}

// फोल्डर ID Script Properties मध्ये लक्षात ठेवा; हटवला गेला असल्यास पुन्हा तयार करा
function folder_(key, parentId, name) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('folder:' + key);
  if (id) {
    var f = api_('get', DRIVE + '/files/' + id + '?fields=id,trashed', null, true);
    if (f && !f.trashed) return id;
  }
  var meta = { name: name, mimeType: FOLDER_MIME };
  if (parentId) meta.parents = [parentId];
  id = api_('post', DRIVE + '/files?fields=id', meta).id;
  props.setProperty('folder:' + key, id);
  return id;
}

function createFile_(parentId, name, mime, bytes, description) {
  var boundary = 'pcb' + Utilities.getUuid();
  var meta = JSON.stringify({ name: name, parents: [parentId], description: description });
  var head = Utilities.newBlob('--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta +
    '\r\n--' + boundary + '\r\nContent-Type: ' + mime + '\r\n\r\n').getBytes();
  var tail = Utilities.newBlob('\r\n--' + boundary + '--').getBytes();
  var res = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'post',
    contentType: 'multipart/related; boundary=' + boundary,
    payload: head.concat(bytes, tail),
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) throw new Error('Drive अपलोड त्रुटी: ' + res.getContentText().slice(0, 200));
  return JSON.parse(res.getContentText());
}

function api_(method, url, body, allowFail) {
  var opt = { method: method, headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true };
  if (body) { opt.contentType = 'application/json'; opt.payload = JSON.stringify(body); }
  var res = UrlFetchApp.fetch(url, opt);
  if (res.getResponseCode() >= 300) {
    if (allowFail) return null;
    throw new Error('Drive त्रुटी: ' + res.getContentText().slice(0, 200));
  }
  return JSON.parse(res.getContentText() || '{}');
}

function clean_(s) {
  return String(s).replace(/[\\/:*?"<>|#%]/g, '_').slice(0, 80);
}

// ---------- Auth ----------
function verifyIdToken_(idToken) {
  if (!idToken) throw new Error('लॉगिन आवश्यक आहे');
  var res = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_API_KEY, {
    method: 'post', contentType: 'application/json', payload: JSON.stringify({ idToken: idToken }), muteHttpExceptions: true,
  });
  var data = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200 || !data.users || !data.users.length) {
    throw new Error('लॉगिन सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.');
  }
  return data.users[0];
}

// विद्यार्थ्याच्या स्वतःच्या token ने त्याचा Firestore record वाचा (rules: फक्त स्वतःचा record)
function getStudent_(uid, idToken) {
  var url = 'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT + '/databases/(default)/documents/students/' + uid;
  var res = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + idToken }, muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('फक्त नोंदणीकृत विद्यार्थीच फाइल सादर करू शकतात.');
  var f = JSON.parse(res.getContentText()).fields || {};
  var str = function (k) { return f[k] && f[k].stringValue ? f[k].stringValue : ''; };
  if (f.active && f.active.booleanValue === false) throw new Error('तुमचे खाते निष्क्रिय आहे.');
  return { name: str('name'), loginId: str('loginId'), batchName: str('batchName') };
}

// ---------- Helpers ----------
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Editor मधून एकदा Run करा — परवानग्या मंजूर करून मुख्य फोल्डर तयार करण्यासाठी. */
function authorize() {
  var id = folder_('root', '', ROOT_FOLDER_NAME);
  Logger.log('OK — folder: https://drive.google.com/drive/folders/' + id);
}
