// Writer (Word / LibreOffice Writer सारखा) — TinyMCE 6 (MIT), सर्व फाइल्स bundle मध्ये (API key / CDN नाही)
import 'tinymce/tinymce';
import 'tinymce/models/dom/model';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/table';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/help';
import 'tinymce/plugins/help/js/i18n/keynav/en';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import skinCss from 'tinymce/skins/ui/oxide/skin.min.css?raw';
import contentUiCss from 'tinymce/skins/ui/oxide/content.min.css?raw';
import contentCss from 'tinymce/skins/content/default/content.min.css?raw';
import { Editor } from '@tinymce/tinymce-react';
import { useEffect, useRef } from 'react';
import { SAMPLE_CSS } from '../../seed/sampleCss';

let skinAdded = false;
const addSkin = () => {
  if (skinAdded) return;
  const s = document.createElement('style');
  s.textContent = skinCss;
  document.head.appendChild(s);
  skinAdded = true;
};

// A4 पानासारखे दिसणे
const PAGE_CSS = `
html { background: #e7e9ee; }
body { background: #fff; max-width: 794px; min-height: 1000px; margin: 18px auto !important; padding: 64px 72px !important; box-shadow: 0 2px 10px rgba(0,0,0,.18); font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.5; color: #111; box-sizing: border-box; }
table { border-collapse: collapse; } td, th { border: 1px solid #999; padding: 4px 6px; }
img { max-width: 100%; height: auto; }
.mce-pagebreak { border-top: 2px dashed #94a3b8; }`;

const FONTS = 'Times New Roman=times new roman,times,serif; Liberation Serif=liberation serif,times new roman,serif; Arial=arial,helvetica,sans-serif; Calibri=calibri,carlito,sans-serif; Cambria=cambria,caladea,serif; Georgia=georgia,serif; Verdana=verdana,sans-serif; Tahoma=tahoma,sans-serif; Courier New=courier new,courier,monospace; Algerian=algerian,serif; Noto Sans Devanagari (मराठी)=noto sans devanagari,mangal,sans-serif; Mangal=mangal,sans-serif';

// चित्र: फाइल निवडल्यास लहान करून (≤1000px JPEG) data URL म्हणून — Firestore मर्यादेत राहण्यासाठी
function pickImage(cb) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const f = input.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1000 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', 0.8), { alt: f.name });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  };
  input.click();
}

/**
 * value: सुरुवातीचा HTML (बदलल्यास editor मध्ये नवीन मजकूर)
 * onChange(html), onFirstInput(), blockPaste (विद्यार्थी), readOnly, height
 */
export default function WriterEditor({ value = '', onChange, onFirstInput, blockPaste, readOnly, height = 600 }) {
  addSkin();
  const first = useRef(false);
  const cb = useRef({ onChange, onFirstInput });
  cb.current = { onChange, onFirstInput };
  useEffect(() => { first.current = false; }, [value]);

  return (
    <Editor
      initialValue={value}
      disabled={readOnly}
      onEditorChange={(html) => {
        if (!first.current) { first.current = true; cb.current.onFirstInput?.(); }
        cb.current.onChange?.(html);
      }}
      init={{
        height,
        skin: false,
        content_css: false,
        content_style: [contentCss, contentUiCss, PAGE_CSS, SAMPLE_CSS].join('\n'),
        promotion: false,
        branding: false,
        menubar: readOnly ? false : 'file edit view insert format tools table help',
        toolbar: readOnly ? false : 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough subscript superscript | forecolor backcolor | alignleft aligncenter alignright alignjustify | lineheight | bullist numlist outdent indent | table image link charmap pagebreak hr | removeformat | searchreplace preview fullscreen',
        toolbar_mode: 'wrap',
        plugins: 'advlist autolink lists link image charmap preview searchreplace visualblocks visualchars code fullscreen insertdatetime table wordcount pagebreak nonbreaking help emoticons',
        font_family_formats: FONTS,
        font_size_formats: '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt 48pt 72pt',
        line_height_formats: '1 1.15 1.5 2 2.5 3',
        block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Preformatted=pre',
        table_default_styles: { 'border-collapse': 'collapse', width: '100%' },
        table_default_attributes: { border: '1' },
        image_advtab: true,
        file_picker_types: 'image',
        file_picker_callback: (callback) => pickImage(callback),
        automatic_uploads: false,
        paste_data_images: !blockPaste,
        browser_spellcheck: true,
        contextmenu: 'link image table',
        statusbar: true,
        elementpath: false,
        resize: true,
        setup: (ed) => {
          if (blockPaste) {
            ed.on('paste drop', (e) => { e.preventDefault(); ed.notificationManager.open({ text: 'Copy-paste बंद आहे — स्वतः टाइप करा.', type: 'warning', timeout: 2000 }); });
          }
        },
      }}
    />
  );
}
