// डेमो फाइलमधून घेतलेले मॉड्यूल्स व सराव (Admin → सराव → "डेमो सराव लोड करा")
export const SEED_MODULES = [
 {
  "title": "Typing Skill · English & Marathi",
  "desc": "Live typing practice, speed, accuracy, timed tests and workplace paragraphs. Start here before other practicals.",
  "icon": "⌨️",
  "order": 1,
  "exercises": [
   {
    "title": "01 · English Typing — Home Row & Accuracy",
    "tool": "Typing Skill · English",
    "intro": "पहिले अचूकता, नंतर वेग. स्क्रीनवरील मजकूर पाहून खालील बॉक्समध्ये तंतोतंत टाइप करा.",
    "steps": [
     "Keyboard वर डावे व उजवे हात Home Row वर ठेवा: ASDF JKL;",
     "खालील मजकूर न पाहता शक्य तितका अचूक टाइप करा.",
     "Start Test दाबल्यावर 60 सेकंदांची चाचणी सुरू होईल.",
     "Speed (WPM), accuracy आणि चुका तपासा.",
     "पुन्हा सराव करून स्वतःचा मागील निकाल सुधारा."
    ],
    "skills": "Home row · Touch typing · WPM · Accuracy",
    "target": "A good computer operator works carefully, saves files with clear names, and checks every document before submission.",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · English Typing — Numbers & Punctuation",
    "tool": "Typing Skill · English",
    "intro": "Numbers, capitals, punctuation आणि business typing चा सराव.",
    "steps": [
     "Capital letters, numbers, comma, colon, full stop आणि special characters सरावाने टाइप करा.",
     "60 सेकंदांची चाचणी सुरू करा.",
     "योग्य चिन्हे आणि spacing तपासा.",
     "नवीन सरावात चुकांची संख्या कमी करण्याचा प्रयत्न करा."
    ],
    "skills": "Business typing · Numbers · Punctuation",
    "target": "Invoice No. PC-2048 | Date: 03/11/2026 | Total: ₹2,450.00 | Status: Paid. Please verify the details before saving.",
    "order": 2,
    "maxMarks": 10
   },
   {
    "title": "03 · Marathi Typing — Devanagari Paragraph",
    "tool": "Typing Skill · Marathi",
    "intro": "मराठी मजकूर तंतोतंत टाइप करण्याचा सराव. तुमच्या संगणकावर Marathi/Devanagari input method निवडा.",
    "steps": [
     "Windows मधील Marathi keyboard/input method सुरू करा किंवा संस्थेने दिलेला मराठी typing tool वापरा.",
     "खालील मराठी परिच्छेद टाइप करा. अक्षरे, मात्रा, अनुस्वार आणि विरामचिन्हे तपासा.",
     "60 सेकंदांची चाचणी सुरू करा.",
     "वेगापेक्षा अचूकतेला प्राधान्य द्या."
    ],
    "skills": "देवनागरी · मात्रा · मराठी परिच्छेद",
    "target": "संगणक कौशल्यामुळे कार्यालयीन काम जलद आणि अचूक करता येते. प्रत्येक फाइल योग्य नावाने जतन करा आणि काम पूर्ण झाल्यावर तपासणी करा.",
    "order": 3,
    "maxMarks": 10
   },
   {
    "title": "04 · Marathi Office Typing — अर्ज",
    "tool": "Typing Skill · Marathi",
    "intro": "कार्यालयीन मराठी टायपिंगचा सराव. हा काल्पनिक नमुना आहे.",
    "steps": [
     "प्रति, विषय, संबोधन आणि परिच्छेद योग्य क्रमाने टाइप करा.",
     "स्वल्पविराम, पूर्णविराम आणि spacing तपासा.",
     "60 सेकंदांची चाचणी घ्या आणि निकाल नोंदवा."
    ],
    "skills": "कार्यालयीन मराठी · अर्ज · अचूक टायपिंग",
    "target": "प्रति, व्यवस्थापक महोदय, विषय: प्रशिक्षणासाठी अर्ज. महोदय, मला संगणक प्रशिक्षणासाठी प्रवेश घ्यावयाचा आहे. कृपया अर्जाचा विचार करावा. धन्यवाद.",
    "order": 4,
    "maxMarks": 10
   },
   {
    "title": "05 · English Typing Test — 3 Minutes",
    "tool": "Typing Assessment",
    "intro": "स्वतंत्र 3-minute assessment साठी खालील मजकूर तीन वेळा किंवा पुढील ओळीपर्यंत टाइप करा.",
    "steps": [
     "चाचणी सुरू करण्यापूर्वी keyboard आणि language तपासा.",
     "3-minute mode मध्ये सराव करण्यासाठी मजकूर पुन्हा टाइप करा; खालील live timer हा 60-second quick test आहे.",
     "निकाल वहीत नोंदवा: date, WPM, accuracy आणि चुका.",
     "प्रत्येक आठवड्यातील निकाल तुलना करा."
    ],
    "skills": "Timed assessment · Self-improvement · Record keeping",
    "target": "Digital skills help learners prepare reports, manage data, communicate professionally, and solve everyday workplace problems. Accuracy is important because a small typing error can change a date, amount, name, or instruction.",
    "order": 5,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Advanced AI Technology & Practical Workflows",
  "desc": "AI prompting, document and spreadsheet workflows, research verification, image/presentation planning, automation logic, data analysis and responsible AI use. Real AI services require internet/login; this module teaches verified workflows without pretending the offline page itself is an AI model.",
  "icon": "🤖",
  "order": 2,
  "exercises": [
   {
    "title": "01 · Prompt Engineering — Professional Prompt",
    "tool": "Generative AI Workflow",
    "intro": "उद्दिष्ट, संदर्भ, इनपुट, मर्यादा आणि अपेक्षित output स्पष्ट करणारा prompt तयार करा. हा सराव offline आहे; AI सेवा स्वतः चालवली जात नाही.",
    "steps": [
     "एखादे काम निवडा: पत्र, अहवाल, Excel formula किंवा presentation outline.",
     "Role, Task, Context, Rules आणि Output या पाच भागांत prompt लिहा.",
     "“माहिती नसल्यास अंदाज न बांधता प्रश्न विचारा” अशी अट जोडा.",
     "AI सेवा उपलब्ध असल्यास prompt वापरा; मिळालेले उत्तर तपासा व स्वतः संपादित करा.",
     "खाजगी विद्यार्थी माहिती, password, OTP किंवा ग्राहकांची संवेदनशील माहिती टाकू नका."
    ],
    "skills": "Prompt engineering · Constraints · Output design · Privacy",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · AI-assisted Marathi & English Office Documents",
    "tool": "AI + Writer",
    "intro": "AI कडून पहिला मसुदा घेऊन त्याला व्यावसायिक, अचूक आणि मानवी संपादनास योग्य बनवण्याची workflow.",
    "steps": [
     "AI साठी स्पष्ट prompt लिहा: कोणासाठी, कोणत्या भाषेत, कोणत्या उद्देशाने आणि किती शब्दांत.",
     "पहिल्या मसुद्यातील नावे, दिनांक, तथ्ये आणि tone तपासा.",
     "LibreOffice Writer मध्ये heading, margins, spacing, alignment आणि signature व्यवस्थित करा.",
     "मराठी आवृत्तीत शुद्धलेखन व आदरार्थी भाषा तपासा.",
     "ODT म्हणून सेव्ह करा आणि आवश्यक असल्यास PDF export करा."
    ],
    "skills": "AI drafting · Human editing · Marathi/English proofing",
    "target": "",
    "order": 2,
    "maxMarks": 10
   },
   {
    "title": "03 · AI + Calc — Data Cleaning & Formula Planning",
    "tool": "AI + Spreadsheet",
    "intro": "AI कडून formula सुचवून घेण्यापूर्वी data structure आणि अपेक्षित परिणाम स्पष्ट करा.",
    "steps": [
     "फक्त काल्पनिक data वापरून Student, Fee, Paid आणि Balance columns तयार करा.",
     "AI ला स्पष्ट विचारा: Balance = Fee − Paid यासाठी LibreOffice Calc formula आणि error checks द्या.",
     "Formula D2 मध्ये टाका आणि खाली copy करा.",
     "एकूण बाकी रक्कम SUM ने काढा; 2 नोंदी हाताने तपासून formula verify करा.",
     "AI ने दिलेली formula अंधाधुंद वापरू नका; cell range आणि separators तपासा."
    ],
    "skills": "Spreadsheet planning · Formula verification · Data quality",
    "target": "",
    "order": 3,
    "maxMarks": 10
   },
   {
    "title": "04 · AI Research — Source Verification & Fact-checking",
    "tool": "AI Research Literacy",
    "intro": "AI उत्तर हे अंतिम पुरावा नाही. Official sources वापरून claims पडताळण्याचा सराव.",
    "steps": [
     "एक claim निवडा: योजना पात्रता, exam date किंवा computer fact.",
     "AI कडून answer सोबत source name, publication date आणि uncertainty विचारून घ्या.",
     "Official government/authority website स्वतंत्रपणे उघडा; URL, date आणि wording तपासा.",
     "वेगवेगळ्या स्रोतांत मतभेद असल्यास “पडताळणी आवश्यक” असे नोंदवा.",
     "Writer मध्ये Claim / Source / Date checked / Conclusion अशी verification table तयार करा."
    ],
    "skills": "Research · Source evaluation · Fact-checking",
    "target": "",
    "order": 4,
    "maxMarks": 10
   },
   {
    "title": "05 · AI Presentation Planning — 7-slide Project",
    "tool": "AI + Impress",
    "intro": "AI कडून slide outline तयार करून professional presentation स्वतः बनवा. विषय: पाणी बचत आणि स्थानिक कृती.",
    "steps": [
     "AI ला नेमके 7 slides मागा: title, problem, evidence, causes, solutions, action plan, sources.",
     "प्रत्येक slide साठी 3–5 short points आणि visual idea मागा.",
     "Impress मध्ये consistent theme, Slide Master, readable fonts आणि charts वापरा.",
     "स्थानिक आकडेवारी बनवू नका; source नसल्यास slide वर “data needed” लिहा.",
     "Presentation mode तपासा आणि PDF export करा."
    ],
    "skills": "Slide storyboarding · Visual communication · Citation",
    "target": "",
    "order": 5,
    "maxMarks": 10
   },
   {
    "title": "06 · AI Image Generation — Brief, Rights & Quality",
    "tool": "AI Visual Design",
    "intro": "Image tool वापरण्यापूर्वी स्पष्ट creative brief, intended use, accessibility आणि rights checklist तयार करा.",
    "steps": [
     "पोस्टर/प्रेझेंटेशनचा उद्देश, प्रेक्षक, विषय आणि aspect ratio लिहा.",
     "AI image prompt मध्ये composition, visual style, readable space आणि exclusions स्पष्ट करा.",
     "प्रतिमा उपलब्ध image-generation tool मध्ये तयार करा; या offline HTML मध्ये image model अंतर्भूत नाही.",
     "हात, मजकूर, logo, dates आणि factual elements तपासा.",
     "परवानगी नसलेले logo/व्यक्तींचे फोटो वापरू नका; final file आणि prompt नोंदवा."
    ],
    "skills": "Creative brief · Visual review · Responsible use",
    "target": "",
    "order": 6,
    "maxMarks": 10
   },
   {
    "title": "07 · Workflow Automation — Human-approved Process",
    "tool": "AI + Automation Logic",
    "intro": "AI/automation ने कोणते काम सुचवावे आणि कोणत्या टप्प्यावर माणसाची मंजुरी आवश्यक आहे ते workflow मध्ये दाखवा.",
    "steps": [
     "एक साधे काम निवडा: file naming, attendance summary किंवा document checklist.",
     "Input, validation, decision, human approval आणि output या टप्प्यांचा flowchart काढा.",
     "Invalid input साठी error path आणि audit log समाविष्ट करा.",
     "Real student/financial data न वापरता sample data ने workflow तपासा.",
     "काय automate होणार नाही आणि manual approval कुठे आवश्यक आहे ते स्पष्ट लिहा."
    ],
    "skills": "Workflow mapping · Validation · Human-in-the-loop",
    "target": "",
    "order": 7,
    "maxMarks": 10
   },
   {
    "title": "08 · AI Career Portfolio — Evidence-based Showcase",
    "tool": "AI & Employability",
    "intro": "फक्त AI output दाखवण्याऐवजी स्वतःची कौशल्ये, प्रक्रिया, पडताळणी आणि final work दाखवणारे portfolio बनवा.",
    "steps": [
     "तुम्ही स्वतः पूर्ण केलेले तीन कामांचे नमुने निवडा; संवेदनशील माहिती काढून टाका.",
     "प्रत्येक नमुन्यासोबत उद्देश, वापरलेले tool, तुमचे योगदान आणि तपासणीचे पुरावे जोडा.",
     "AI ने मदत केलेली असल्यास कोणत्या टप्प्यावर मदत घेतली ते पारदर्शकपणे नोंदवा.",
     "Writer/Impress मध्ये portfolio तयार करा आणि PDF export करा.",
     "फक्त खरे, तपासता येणारे कौशल्य दाखवा; खोटे प्रमाणपत्र किंवा अनुभव दाखवू नका."
    ],
    "skills": "Portfolio · Transparency · Job readiness",
    "target": "",
    "order": 8,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Computer Fundamentals",
  "desc": "Computer parts, hardware/software, operating system, file types आणि digital basics.",
  "icon": "🖥️",
  "order": 3,
  "exercises": [
   {
    "title": "01 · Computer System & Components",
    "tool": "Fundamentals",
    "intro": "संगणकाचे मुख्य भाग: Input → Process → Output; फाइल्स Storage मध्ये जतन होतात. Hardware म्हणजे स्पर्श करता येणारे भाग; Software म्हणजे प्रोग्राम.",
    "steps": [
     "Input, Processing, Output आणि Storage यांचे अर्थ लिहा.",
     "CPU, RAM, SSD, keyboard, monitor आणि printer यांचे कार्य समजून घ्या.",
     "Hardware व Software यांची प्रत्येकी ५ उदाहरणे नोंदवा.",
     "Writer मध्ये वरील माहितीचा एक पानाचा illustrated note तयार करा."
    ],
    "skills": "Hardware identification · Digital vocabulary · Document formatting",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · Operating System & File Types",
    "tool": "Fundamentals",
    "intro": "Operating System संगणक चालवते. .odt मजकूर, .ods spreadsheet, .odp presentation, .pdf share करण्यासाठी आणि .jpg/.png images साठी वापरतात.",
    "steps": [
     "Windows मध्ये Start, Settings, File Explorer आणि Recycle Bin ओळखा.",
     "File extension दाखवण्याची सेटिंग शोधा.",
     "ODT, ODS, ODP, PDF, JPG आणि ZIP यांतील फरक समजून घ्या.",
     "एक folder तयार करून वेगवेगळ्या प्रकारच्या फाइल्स योग्य नावाने जतन करा."
    ],
    "skills": "OS navigation · File extensions · Digital housekeeping",
    "target": "",
    "order": 2,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "File Explorer & File Management",
  "desc": "Folder structure, rename, copy/move, search, ZIP, USB आणि backup.",
  "icon": "📁",
  "order": 4,
  "exercises": [
   {
    "title": "01 · Professional Folder Structure",
    "tool": "File Explorer",
    "intro": "नोकरी/प्रशिक्षणातील फाइल्स व्यवस्थित ठेवण्यासाठी व्यावसायिक folder रचना.",
    "steps": [
     "Documents मध्ये PERFECT_COMPUTERS_PORTFOLIO नावाचा folder तयार करा.",
     "त्यात Writer, Calc, Impress, PDF_Exports आणि Backup असे subfolders बनवा.",
     "फाइल्सना स्पष्ट नाव द्या; final-final-new अशी नावे टाळा.",
     "Copy आणि Move यांतील फरक प्रत्यक्ष करून पाहा.",
     "फाइल ZIP करा आणि पुन्हा Extract करून तपासा."
    ],
    "skills": "Folder hierarchy · Search · Copy/move · Backup",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · File Operations & Backup",
    "tool": "File Explorer",
    "intro": "Search, sort, properties, recycle bin, removable drive आणि backup सवयी.",
    "steps": [
     "सरावासाठी dummy files वापरा; system files हटवू नका.",
     "Rename, copy, move, delete आणि Recycle Bin restore करा.",
     "फाइलचे size, type आणि location Properties मधून पहा.",
     "महत्त्वाच्या फाइलची प्रत दुसऱ्या drive मध्ये ठेवा."
    ],
    "skills": "File operations · Recovery · Backup discipline",
    "target": "",
    "order": 2,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Writer · Professional Documents",
  "desc": "नोकरी अर्ज, Resume, पत्रे, अहवाल, notices आणि व्यवस्थित PDF documents.",
  "icon": "📝",
  "order": 5,
  "exercises": [
   {
    "title": "01 · Advanced Job Application",
    "tool": "LibreOffice Writer",
    "intro": "व्यावसायिक नोकरी अर्ज: letterhead, reference, subject, body, closing आणि signature.",
    "steps": [
     "Writer उघडा; A4 page, margins सुमारे 2.0–2.5 cm ठेवा.",
     "वरचा heading 16–18 pt bold; body 11–12 pt readable font मध्ये ठेवा.",
     "Date, recipient, subject, paragraphs आणि signature योग्य alignment ने मांडणी करा.",
     "Spelling तपासा; खरे वैयक्तिक तपशील स्वतः भरा.",
     "Job_Application.odt म्हणून सेव्ह करा आणि PDF export करा."
    ],
    "skills": "Business correspondence · Page layout · Paragraph styles · PDF export",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · Professional Resume / CV",
    "tool": "LibreOffice Writer",
    "intro": "ATS-friendly, स्पष्ट headings असलेला एक-दोन पानांचा resume.",
    "steps": [
     "नाव व संपर्क माहिती ठळकपणे वर द्या.",
     "Professional Summary, Skills, Education, Experience/Projects आणि Declaration headings वापरा.",
     "वास्तविक कौशल्ये व अनुभवच लिहा; खोटे प्रमाणपत्र/अनुभव दाखवू नका.",
     "एकसारखे font, spacing आणि bullet alignment ठेवा.",
     "Resume_Name.odt आणि PDF दोन्ही सेव्ह करा."
    ],
    "skills": "Resume writing · Styles · Tables · ATS readability",
    "target": "",
    "order": 2,
    "maxMarks": 10
   },
   {
    "title": "03 · Official Business Letter",
    "tool": "LibreOffice Writer",
    "intro": "कार्यालयीन विनंती/तक्रार पत्रासाठी औपचारिक मांडणी.",
    "steps": [
     "Recipient address आणि subject स्पष्ट लिहा.",
     "मजकूर तीन भागांत ठेवा: कारण, विनंती, अपेक्षित पुढील कृती.",
     "योग्य salutation आणि closing वापरा.",
     "नाव/दिनांक placeholders बदला; वास्तविक बँक तपशील नमुन्यात वापरू नका.",
     "ODT आणि PDF म्हणून सेव्ह करा."
    ],
    "skills": "Formal letter · Clear writing · Confidentiality",
    "target": "",
    "order": 3,
    "maxMarks": 10
   },
   {
    "title": "04 · Meeting Minutes / Office Report",
    "tool": "LibreOffice Writer",
    "intro": "बैठकीचे minutes, निर्णय, जबाबदार व्यक्ती आणि deadlines यांचा व्यावसायिक अहवाल.",
    "steps": [
     "Report title, date, venue आणि participants लिहा.",
     "Agenda व decisions क्रमाने लिहा.",
     "Action items साठी table तयार करा.",
     "Heading styles, footer आणि page number वापरा.",
     "PDF export करून layout तपासा."
    ],
    "skills": "Structured reporting · Tables · Headings · Page numbering",
    "target": "",
    "order": 4,
    "maxMarks": 10
   },
   {
    "title": "05 · Notice / Event Circular",
    "tool": "LibreOffice Writer",
    "intro": "संस्थेची अधिकृत सूचना, ठळक शीर्षक, तारीख, सूचना आणि सही.",
    "steps": [
     "संस्थेचे नाव व NOTICE heading मध्यभागी ठेवा.",
     "शीर्षक, तारीख आणि मुख्य सूचना वेगवेगळ्या hierarchy ने दाखवा.",
     "महत्त्वाच्या सूचना bullet points मध्ये द्या.",
     "Signature block आणि footer जोडा.",
     "PDF तयार करा आणि print preview तपासा."
    ],
    "skills": "Visual hierarchy · Lists · Official communication",
    "target": "",
    "order": 5,
    "maxMarks": 10
   },
   {
    "title": "06 · Table, Page Border & Certificate",
    "tool": "LibreOffice Writer",
    "intro": "टेबल, page border, background, signature blocks आणि certificate layout.",
    "steps": [
     "Page border आणि योग्य page orientation निवडा.",
     "Center alignment, font hierarchy आणि whitespace वापरा.",
     "नाव व workshop title साठी text boxes/table वापरू शकता.",
     "दोन signature blocks समान alignment मध्ये ठेवा.",
     "Certificate_Practice.odt आणि PDF सेव्ह करा."
    ],
    "skills": "Page design · Borders · Alignment · Print layout",
    "target": "",
    "order": 6,
    "maxMarks": 10
   },
   {
    "title": "07 · Business Profile / Brochure",
    "tool": "LibreOffice Writer",
    "intro": "दोन-column layout, callout boxes, services list आणि contact section असलेला brochure.",
    "steps": [
     "Page ला landscape किंवा columns layout द्या.",
     "Hero heading आणि दोन service columns तयार करा.",
     "Icons/shape वापरल्यास consistency ठेवा.",
     "Contact details आणि call-to-action जोडा.",
     "Print preview आणि PDF तपासा."
    ],
    "skills": "Brochure layout · Columns · Shapes · Branding",
    "target": "",
    "order": 7,
    "maxMarks": 10
   },
   {
    "title": "08 · Mail Merge / Labels",
    "tool": "LibreOffice Writer + Calc",
    "intro": "Calc मधील recipient list वापरून वैयक्तिकृत पत्र किंवा label तयार करणे.",
    "steps": [
     "Calc मध्ये FirstName, CourseName, Date headers असलेली sample list तयार करा.",
     "Writer मध्ये पत्र तयार करून Tools → Mail Merge Wizard वापरा.",
     "Spreadsheet data source जोडून fields insert करा.",
     "Preview मध्ये वेगवेगळे recipients तपासा.",
     "Merged documents PDF मध्ये सेव्ह करा."
    ],
    "skills": "Data source · Field insertion · Mail merge",
    "target": "",
    "order": 8,
    "maxMarks": 10
   },
   {
    "title": "09 · Marathi Document Formatting",
    "tool": "LibreOffice Writer",
    "intro": "मराठी मजकूर, Unicode typing, headings, paragraphs आणि PDF output.",
    "steps": [
     "Unicode समर्थित मराठी typing पद्धत वापरा.",
     "शीर्षक, उपशीर्षक आणि body text साठी styles वापरा.",
     "अक्षरांमध्ये अनावश्यक spaces देऊ नका.",
     "PDF export करून मराठी अक्षरे योग्य दिसतात का तपासा."
    ],
    "skills": "Unicode typing · Styles · Marathi layout",
    "target": "",
    "order": 9,
    "maxMarks": 10
   },
   {
    "title": "10 · Final Practical Portfolio",
    "tool": "LibreOffice Writer",
    "intro": "Cover page, index, page numbering, consistent styles आणि document portfolio.",
    "steps": [
     "Cover page आणि contents page तयार करा.",
     "प्रत्येक practical साठी एकसारखी heading styles वापरा.",
     "Page breaks आणि page numbers जोडा.",
     "फाइल्स एकाच portfolio folder मध्ये ठेवा.",
     "Final PDF export करून सर्व pages तपासा."
    ],
    "skills": "Document consistency · Page breaks · Portfolio",
    "target": "",
    "order": 10,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Calc · Spreadsheet & Data Analysis",
  "desc": "Professional worksheets with formulas, formatting, validation, charts and filters.",
  "icon": "📊",
  "order": 6,
  "exercises": [
   {
    "title": "01 · Student Result Sheet",
    "tool": "LibreOffice Calc",
    "intro": "विषयनिहाय गुण, total, percentage, result आणि conditional formatting.",
    "steps": [
     "Headers आणि sample data Calc मध्ये भरा.",
     "Total साठी =SUM(C2:E2), percentage साठी =F2/300*100 वापरा.",
     "Result साठी IF formula वापरा आणि rows मध्ये fill करा.",
     "Percentage ला 2 decimal places द्या; header रंगीत करा.",
     "Filter लावा आणि chart तयार करा; ODS व PDF सेव्ह करा."
    ],
    "skills": "SUM · IF · Percentage · Conditional formatting · Filter",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · Monthly Salary Register",
    "tool": "LibreOffice Calc",
    "intro": "Basic, allowances, deductions आणि net salary यांची गणना.",
    "steps": [
     "Employee, Basic, Allowance आणि Deductions columns तयार करा.",
     "Gross साठी =B2+C2 आणि Net Pay साठी =D2-E2 वापरा.",
     "Currency number format व borders लावा.",
     "Totals साठी SUM वापरा आणि sort/filter तपासा.",
     "Salary_Register.ods म्हणून सेव्ह करा."
    ],
    "skills": "Arithmetic formulas · Currency format · Totals",
    "target": "",
    "order": 2,
    "maxMarks": 10
   },
   {
    "title": "03 · Shop Invoice & GST-style Bill Practice",
    "tool": "LibreOffice Calc",
    "intro": "Quantity × Rate, line total, discount आणि illustrative tax calculation.",
    "steps": [
     "Item, quantity, rate, amount columns बनवा.",
     "Amount = Qty*Rate आणि subtotal = SUM(amount range).",
     "Discount amount आणि tax amount स्वतंत्र formulas ने काढा.",
     "Currency format, print area आणि header/footer सेट करा.",
     "Invoice PDF export करून totals पडताळा."
    ],
    "skills": "Multiplication · Percentages · Invoice layout · Print area",
    "target": "",
    "order": 3,
    "maxMarks": 10
   },
   {
    "title": "04 · Farmer Expense & Income Tracker",
    "tool": "LibreOffice Calc",
    "intro": "शेतखर्च, उत्पादन, विक्री आणि नफा यांचा practical tracker.",
    "steps": [
     "खर्च व उत्पन्नासाठी स्वतंत्र columns ठेवा.",
     "Net column मध्ये =C2-B2 वापरा.",
     "Totals साठी SUM आणि category नुसार SUMIF चा सराव करा.",
     "Expense vs Income bar chart तयार करा.",
     "काल्पनिक डेटा वापरा; ODS सेव्ह करा."
    ],
    "skills": "SUM · SUMIF · Charts · Business records",
    "target": "",
    "order": 4,
    "maxMarks": 10
   },
   {
    "title": "05 · Monthly Household Budget",
    "tool": "LibreOffice Calc",
    "intro": "घरखर्च, बजेट विरुद्ध प्रत्यक्ष खर्च आणि variance analysis.",
    "steps": [
     "Category, Budget आणि Actual columns भरा.",
     "Variance साठी =B2-C2 वापरा.",
     "Conditional formatting ने negative values highlight करा.",
     "Pie chart किंवा column chart बनवा.",
     "Budget_Control.ods म्हणून सेव्ह करा."
    ],
    "skills": "Variance analysis · Conditional formatting · Charts",
    "target": "",
    "order": 5,
    "maxMarks": 10
   },
   {
    "title": "06 · Milk Collection Register",
    "tool": "LibreOffice Calc",
    "intro": "Daily litres, rate, amount आणि supplier-wise monthly totals.",
    "steps": [
     "Date, Supplier ID, Litres, Rate आणि Amount columns तयार करा.",
     "Amount = C2*D2 formula लावा.",
     "Supplier ID साठी Data Validity dropdown वापरून पाहा.",
     "SUMIF ने supplier-wise totals काढा.",
     "Date format आणि currency format द्या."
    ],
    "skills": "Multiplication · SUMIF · Data validation · Date formatting",
    "target": "",
    "order": 6,
    "maxMarks": 10
   },
   {
    "title": "07 · Sorting, Filter & Data Validation",
    "tool": "LibreOffice Calc",
    "intro": "मोठ्या data list मधून records शोधणे, duplicate values ओळखणे आणि controlled entry.",
    "steps": [
     "Header row स्पष्ट ठेवा आणि data मध्ये blank rows टाळा.",
     "Data → Sort वापरून Name ascending करा.",
     "AutoFilter चालू करून Course किंवा Status निवडा.",
     "Data Validity मधून course/status dropdown बनवा.",
     "Original copy ठेवा; Remove Duplicates करण्याआधी backup घ्या."
    ],
    "skills": "Sort · AutoFilter · Data validation · Data quality",
    "target": "",
    "order": 7,
    "maxMarks": 10
   },
   {
    "title": "08 · Charts & Mini Dashboard",
    "tool": "LibreOffice Calc",
    "intro": "KPI cards, charts आणि concise summary dashboard.",
    "steps": [
     "Monthly summary table तयार करा.",
     "SUM, COUNT आणि AVERAGE formulas वापरा.",
     "Insert Chart मधून column chart तयार करा.",
     "Chart title, axis labels आणि legend नीट द्या.",
     "Dashboard sheet वर KPI cells आणि chart मांडणी करा."
    ],
    "skills": "Charts · AVERAGE · COUNT · Dashboard layout",
    "target": "",
    "order": 8,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Impress · Business Presentations",
  "desc": "Professional slide deck, themes, images, charts, transitions and presenter-ready output.",
  "icon": "📽️",
  "order": 7,
  "exercises": [
   {
    "title": "01 · Professional Business Introduction",
    "tool": "LibreOffice Impress",
    "intro": "संस्थेचा परिचय देणारे 6-slide professional presentation.",
    "steps": [
     "Slide 1 cover, slide 2 purpose, slide 3 courses, slide 4 workflow, slide 5 portfolio, slide 6 safety, slide 7 next steps तयार करा.",
     "एक consistent theme, दोन fonts आणि 2–3 मुख्य रंग वापरा.",
     "प्रत्येक slide वर कमी मजकूर व स्पष्ट hierarchy ठेवा.",
     "Images वापरताना स्रोत/परवानगी तपासा.",
     "ODP सेव्ह करा आणि PDF export करून slide show तपासा."
    ],
    "skills": "Slide hierarchy · Theme · Layout · Export",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · Cyber Safety Awareness Deck",
    "tool": "LibreOffice Impress",
    "intro": "प्रौढ विद्यार्थ्यांसाठी phishing, OTP, passwords आणि reporting यांवरील सादरीकरण.",
    "steps": [
     "Threat → Example → Prevention → Reporting या क्रमाने 5–6 slides बनवा.",
     "प्रत्येक slide वर एक मुख्य संदेश ठेवा.",
     "Phishing उदाहरण काल्पनिक ठेवा; प्रत्यक्ष फसवणुकीची link वापरू नका.",
     "Icons आणि contrast वापरून accessible slides बनवा.",
     "ODP आणि PDF सेव्ह करा."
    ],
    "skills": "Awareness communication · Visual design · Safety messaging",
    "target": "",
    "order": 2,
    "maxMarks": 10
   },
   {
    "title": "03 · Data Report with Chart",
    "tool": "LibreOffice Impress + Calc",
    "intro": "Calc मधील chart वापरून व्यवस्थापनासाठी छोटा data story deck.",
    "steps": [
     "Calc मध्ये quarter-wise sample data आणि chart तयार करा.",
     "Chart copy करून Impress मध्ये paste करा.",
     "Chart title, units, period आणि source note द्या.",
     "एका slide वर एक insight आणि एक supporting chart ठेवा.",
     "Presentation rehearsal करून PDF export करा."
    ],
    "skills": "Data storytelling · Chart interpretation · Slide layout",
    "target": "",
    "order": 3,
    "maxMarks": 10
   },
   {
    "title": "04 · AI Tools for Office Productivity",
    "tool": "LibreOffice Impress",
    "intro": "AI चा जबाबदार वापर, verification, privacy आणि practical office use.",
    "steps": [
     "AI चे तीन office use cases निवडा.",
     "Prompt, draft, human edit आणि verification दाखवा.",
     "खोटे तथ्य आणि गोपनीय माहिती टाळण्याचे उदाहरण द्या.",
     "Slides मध्ये source/verification note जोडा.",
     "ODP आणि PDF सेव्ह करा."
    ],
    "skills": "Responsible AI · Critical review · Presentation design",
    "target": "",
    "order": 4,
    "maxMarks": 10
   },
   {
    "title": "05 · Presentation Skills Assessment",
    "tool": "LibreOffice Impress",
    "intro": "Slide consistency, readability, speaking notes आणि final export.",
    "steps": [
     "5-slide presentation तयार करा.",
     "Theme, font size, margins आणि alignment consistency तपासा.",
     "Speaker notes लिहा आणि slide show चालवा.",
     "Spelling, image credits आणि chart labels तपासा.",
     "ODP, PDF आणि source assets योग्य folder मध्ये ठेवा."
    ],
    "skills": "Quality assurance · Speaker notes · Export",
    "target": "",
    "order": 5,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Networking · LAN & Connectivity",
  "desc": "Network basics, LAN/WAN, router, switch, IP, Wi-Fi and troubleshooting.",
  "icon": "🌐",
  "order": 8,
  "exercises": [
   {
    "title": "01 · Network Types & Devices",
    "tool": "Networking",
    "intro": "LAN, WAN, router, switch, access point, server आणि client यांची भूमिका.",
    "steps": [
     "Router आणि switch यांतील फरक समजून घ्या.",
     "Server, client आणि shared printer यांची भूमिका लिहा.",
     "LAN, WAN, Wi-Fi, Ethernet, IP address आणि DNS यांचे अर्थ लिहा.",
     "Windows मध्ये उपलब्ध network status तपासा; परवानगीशिवाय network settings बदलू नका.",
     "Network diagram Writer किंवा Impress मध्ये तयार करा."
    ],
    "skills": "Network terminology · Diagramming · Basic troubleshooting",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · Network Troubleshooting Checklist",
    "tool": "Networking",
    "intro": "No internet, cable/Wi-Fi, IP settings आणि shared resource यांसाठी सुरक्षित प्राथमिक तपासणी.",
    "steps": [
     "Cable नीट जोडलेली आहे का आणि network adapter चालू आहे का पहा.",
     "इतर approved device वर connection आहे का तपासा.",
     "Error message अचूक नोंदवा.",
     "Admin परवानगीनेच IP/DNS किंवा router बदल करा.",
     "Issue, cause, action आणि result अशी troubleshooting log तयार करा."
    ],
    "skills": "Problem diagnosis · Documentation · Safe IT practice",
    "target": "",
    "order": 2,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Internet · Government Portals",
  "desc": "Web browsing, domain verification, downloads and official Indian public-service links.",
  "icon": "🔎",
  "order": 9,
  "exercises": [
   {
    "title": "01 · Official Government Website Directory",
    "tool": "Internet & e-Governance",
    "intro": "सरकारी सेवा वापरताना अधिकृत domain तपासणे, सुरक्षित login आणि योग्य portal निवडणे.",
    "steps": [
     "Link उघडण्यापूर्वी domain spelling तपासा.",
     "Portal वर कोणती सेवा मिळते आणि कोणती कागदपत्रे लागू शकतात याची नोंद करा.",
     "Public computer वर काम संपल्यावर logout करा आणि downloaded files तपासा.",
     "Fake sponsored links, unknown agents आणि OTP मागणारे कॉल यांपासून सावध राहा.",
     "एका निवडलेल्या portal साठी step-by-step user guide तयार करा."
    ],
    "skills": "Web navigation · Domain verification · e-Governance awareness",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · Search, Download & Verify",
    "tool": "Internet Browser",
    "intro": "योग्य शोधशब्द, authoritative source, PDF download आणि source verification.",
    "steps": [
     "Search query मध्ये योग्य keywords आणि year वापरा.",
     "शक्य असल्यास official department site मधील notification शोधा.",
     "PDF चे title, issuing department, date आणि reference तपासा.",
     "फाइल योग्य folder मध्ये अर्थपूर्ण नावाने सेव्ह करा.",
     "महत्त्वाची माहिती दुसऱ्या official source वरून पडताळा."
    ],
    "skills": "Search strategy · Source evaluation · Download management",
    "target": "",
    "order": 2,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Email · Inbox, Send & Attachments",
  "desc": "Inbox reading, composing, reply, forwarding, attachments, folders and email etiquette.",
  "icon": "✉️",
  "order": 10,
  "exercises": [
   {
    "title": "01 · Email Workflow Practical",
    "tool": "Webmail / Email Client",
    "intro": "Inbox वाचणे, compose, recipient, subject, attachment, send आणि sent-mail verification.",
    "steps": [
     "तुमच्या स्वतःच्या किंवा instructor ने दिलेल्या authorized email account मध्ये login करा.",
     "Inbox मधील एक संदेश उघडा; sender, subject, date आणि attachment तपासा.",
     "Compose करा: To मध्ये instructor चा अधिकृत पत्ता, स्पष्ट Subject आणि नम्र body लिहा.",
     "Attach File वापरून सराव PDF जोडा; योग्य फाइल निवडल्याची खात्री करा.",
     "Send करा; Sent folder मध्ये संदेश आणि attachment दिसतो का पडताळा.",
     "Reply आणि Download attachment चा सराव करा; अनोळखी attachment उघडू नका."
    ],
    "skills": "Inbox management · Compose · Attachment · Reply · Verification",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · Email Etiquette & File Attachment",
    "tool": "Email",
    "intro": "Professional subject, CC/BCC, attachment size, reply-all आणि phishing awareness.",
    "steps": [
     "Subject मध्ये purpose स्पष्ट लिहा.",
     "To, CC आणि BCC यांचा फरक समजून घ्या.",
     "Attachment नाव स्पष्ट ठेवा; चुकीची किंवा रिकामी फाइल पाठवू नका.",
     "Reply All फक्त सर्वांना उत्तर आवश्यक असेल तेव्हाच वापरा.",
     "OTP, password, Aadhaar full number किंवा bank PIN ईमेलमध्ये पाठवू नका."
    ],
    "skills": "Business email · CC/BCC · Attachment hygiene · Privacy",
    "target": "",
    "order": 2,
    "maxMarks": 10
   },
   {
    "title": "03 · Three Email Tasks: Reply, Forward & Follow-up",
    "tool": "Email",
    "intro": "तीन स्वतंत्र सराव: inbox वाचणे व reply, योग्य संदर्भासह forward करणे, आणि attachment मिळाल्याची पुष्टी पाठवणे.",
    "steps": [
     "Task 1: inbox मधील काल्पनिक message वाचा; Reply करून उपस्थितीची पुष्टी द्या.",
     "Task 2: schedule email Forward करा; forwarding आधी context लिहा आणि अनावश्यक recipients काढा.",
     "Task 3: instructor ने दिलेली sample PDF attach करून “file received” अशी confirmation email पाठवा.",
     "Sent folder उघडून तीनही संदेश दिसतात का तपासा.",
     "फक्त instructor ने दिलेला training address वापरा; खरे passwords, OTP किंवा वैयक्तिक माहिती पाठवू नका."
    ],
    "skills": "Inbox · Reply · Forward · Attachments · Sent verification",
    "target": "",
    "order": 3,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Cyber Security & Privacy",
  "desc": "Phishing, passwords, OTP, safe browsing, digital fraud reporting and privacy practices.",
  "icon": "🛡️",
  "order": 11,
  "exercises": [
   {
    "title": "01 · Cyber Safety Information & Visual Guide",
    "tool": "Cyber Security",
    "intro": "Common online threats आणि त्यांपासून बचावाचे practical workplace rules.",
    "steps": [
     "Phishing email/SMS मधील urgency, spelling, unknown domain आणि OTP मागणी ओळखा.",
     "प्रत्येक account साठी वेगळा मजबूत password आणि शक्य असल्यास MFA वापरा.",
     "OTP, UPI PIN, CVV किंवा password कोणालाही सांगू नका.",
     "Public computer वर logout करा; browser मध्ये password save करू नका.",
     "Cyber fraud असल्यास bank/payment provider शी त्वरित संपर्क करा; cybercrime.gov.in किंवा 1930 वापरा."
    ],
    "skills": "Threat recognition · Password hygiene · Incident response",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · Spot a Fake Message",
    "tool": "Cyber Security",
    "intro": "काल्पनिक phishing उदाहरण तपासून warning signs नोंदवणे.",
    "steps": [
     "प्रत्येक warning sign ओळखा आणि worksheet मध्ये लिहा.",
     "Link वर click न करता official app/site स्वतंत्रपणे उघडा.",
     "Message चा screenshot/report फक्त institute policy नुसार करा; private data लपवा.",
     "Sender ला password/OTP देऊ नका.",
     "Incident report मध्ये date, sender, action taken लिहा; password कधीही नोंदवू नका."
    ],
    "skills": "Phishing analysis · Safe reporting · Evidence handling",
    "target": "",
    "order": 2,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "Banking · Digital Finance Awareness",
  "desc": "Banking terms and full forms, KYC, NEFT/RTGS/IMPS/UPI, secure transactions and forms awareness.",
  "icon": "🏦",
  "order": 12,
  "exercises": [
   {
    "title": "01 · Banking Full Forms & Payment Methods",
    "tool": "Banking Awareness",
    "intro": "महत्त्वाच्या banking संज्ञा आणि त्यांचा साधा उपयोग. प्रत्यक्ष व्यवहाराऐवजी sample data वापरा.",
    "steps": [
     "Full forms आणि उपयोग table मध्ये वाचा.",
     "UPI, IMPS, NEFT आणि RTGS यांचा सामान्य उपयोग व वेळेबाबत official bank/RBI guidance तपासा.",
     "IFSC आणि account number यांचा उपयोग समजून घ्या; नमुन्यात काल्पनिक values ठेवा.",
     "KYC साठी कोणती कागदपत्रे लागू शकतात ते संबंधित bank च्या official site वरून पडताळा.",
     "Writer मध्ये one-page banking glossary तयार करा."
    ],
    "skills": "Banking vocabulary · Digital finance awareness · Data safety",
    "target": "",
    "order": 1,
    "maxMarks": 10
   },
   {
    "title": "02 · Safe Digital Payment Workflow",
    "tool": "Banking Awareness",
    "intro": "UPI payment आधी payee, amount आणि collect request पडताळण्याची पद्धत.",
    "steps": [
     "प्रशिक्षकाने दिलेल्या mock screen किंवा paper case वर payee व amount तपासा.",
     "Collect request आणि पैसे पाठवण्यातील फरक समजून घ्या.",
     "फक्त पैसे पाठवताना आणि स्वतः व्यवहार समजल्यावरच PIN वापरायचा असतो; पैसे मिळवण्यासाठी PIN देऊ नका.",
     "संशयास्पद व्यवहारात cancel करा आणि bank/payment provider च्या official support शी संपर्क करा.",
     "Receipt मधील transaction reference नोंदवा; पूर्ण account/UPI details सार्वजनिक करू नका."
    ],
    "skills": "Transaction verification · Fraud prevention · Record keeping",
    "target": "",
    "order": 2,
    "maxMarks": 10
   },
   {
    "title": "03 · Banking Forms & Customer Service Awareness",
    "tool": "Banking Awareness",
    "intro": "KYC update, account service request आणि complaint acknowledgement यांची document awareness.",
    "steps": [
     "Bank-specific official form only from the bank/branch website or counter घ्या.",
     "Form मधील fields, declaration, supporting documents आणि acknowledgement समजून घ्या.",
     "हा template फक्त अभ्यासासाठी आहे; official form म्हणून वापरू नका.",
     "तक्रार करताना reference number आणि date जतन करा.",
     "Writer मध्ये form-filling checklist तयार करा."
    ],
    "skills": "Form literacy · KYC awareness · Customer service documentation",
    "target": "",
    "order": 3,
    "maxMarks": 10
   }
  ]
 },
 {
  "title": "AI Tools & Employment Skills",
  "desc": "Responsible AI use, verification, office workflow and portfolio presentation.",
  "icon": "🤖",
  "order": 13,
  "exercises": [
   {
    "title": "01 · Responsible AI for Office Work",
    "tool": "AI & Productivity",
    "intro": "Drafting, summarizing, spreadsheet ideas and verification with privacy protection.",
    "steps": [
     "एका सामान्य विषयावर outline तयार करण्यासाठी prompt लिहा.",
     "AI उत्तरातील तथ्ये विश्वसनीय स्रोतांतून पडताळा.",
     "मजकूर स्वतः संपादित करा आणि योग्य संदर्भ जोडा.",
     "गोपनीय किंवा वैयक्तिक माहिती AI मध्ये टाकू नका.",
     "Before/after comparison सहित छोटा Writer report तयार करा."
    ],
    "skills": "Prompt writing · Fact-checking · Privacy · Editing",
    "target": "",
    "order": 1,
    "maxMarks": 10
   }
  ]
 }
];
