// Typing Lab — पोर्टलवरच करायचे सराव (फाइल अपलोड नाही): Keyboard Lessons, Speed Typing,
// Letter, Statement (Excel), Email, MCQ. Admin → अभ्यासक्रम → "प्रमाणित नमुने व सराव जोडा" ने लोड होतात.

const drill = (lines) => lines.join('\n');
const rep = (s, n) => Array(n).fill(s).join(' ');

const LESSONS = [
  ['Home Row — डावा व उजवा हात', 'ASDF ;LKJ', drill([rep('asdf ;lkj', 6), rep('aaa sss ddd fff', 3), rep(';;; lll kkk jjj', 3), rep('fdsa jkl;', 6)])],
  ['Home Row — G आणि H', 'ASDFG ;LKJH', drill([rep('fgf jhj', 6), rep('asdfg ;lkjh', 5), rep('gag has had lad', 3), rep('dash flag glad half', 3)])],
  ['Top Row — Q W E R T Y U I O P', 'QWERT POIUY', drill([rep('qwert poiuy', 5), rep('frf juj ded kik', 4), rep('sws lol aqa ;p;', 4), rep('we were your quiet tower', 2)])],
  ['Bottom Row — Z X C V B N M', 'ZXCVB NM,.', drill([rep('zxcvb nm,.', 5), rep('fvf jmj dcd k,k', 4), rep('sxs l.l aza fbf jnj', 3), rep('van man cab box zinc', 3)])],
  ['तीनही ओळी — मिश्र सराव', 'ALL LETTERS', drill([rep('aqaz swsx dedc frfv', 3), rep(';p;/ lol. kik, juj m', 3), rep('the quick brown fox', 3), rep('jumps over lazy dogs', 3)])],
  ['Index Finger Stretch', 'FGTRV HJYUBNM', drill([rep('ftf frf fgf fvf fbf', 3), rep('jyj juj jhj jmj jnj', 3), rep('try very gun hut bring', 3)])],
  ['सामान्य इंग्रजी शब्द', 'COMMON WORDS', drill(['the and for are but not you all any can had her was one our out day get', 'has him his how man new now old see two way who boy did its let put say', 'she too use work file save open data form bank fee time year name class', 'good keep help home make call book list type test mark word page line'])],
  ['छोटी वाक्ये', 'SENTENCES', drill(['we type with all ten fingers.', 'keep your eyes on the screen.', 'save the file before you close it.', 'practice daily to improve speed.', 'accuracy is more important than speed.'])],
  ['Capital Letters — Shift', 'SHIFT + LETTER', drill(['Asha Bhalwani Pandharpur Solapur Maharashtra India', 'Ravi Pune Mumbai Nashik Satara Kolhapur Sangli', 'Monday Tuesday Wednesday Thursday Friday Saturday', 'January March June August October December'])],
  ['विरामचिन्हे — Punctuation', ', . ; : ? ! " \'', drill(['Yes, I will come. Will you?', 'Note: Bring your ID card; it is required.', 'Wow! The result is out.', 'He said, "Save your work often."', "It's Ravi's computer, isn't it?"])],
  ['Number Row — 1 ते 0', '1234567890', drill([rep('123 456 789 0', 4), rep('1a1 2s2 3d3 4f4 5f5', 2), rep('6j6 7j7 8k8 9l9 0;0', 2), '10 20 30 40 50 60 70 80 90 100'])],
  ['संख्या — मिश्र', '09876 54321', drill(['09876 54321 13579 24680', '112233 445566 778899 00', '2024 2025 2026 2027 2028', 'Room 12, Roll No. 45, Bus No. 7, Pin 413304'])],
  ['Numeric Pad सराव', '147 258 369 0', drill([rep('147 258 369 0', 4), rep('159 357 951 753', 4), '741 852 963 456 654 123 321 789 987'])],
  ['तारीख व रक्कम', '03/04/2026 Rs.', drill(['03/04/2026 15/08/2026 26/01/2027', 'Rs. 1,250.00 Rs. 15,000 Rs. 99.50', 'Invoice No. 2026-17 dated 12/06/2026', 'Total: Rs. 4,580.00 (Paid on 01/07/2026)'])],
  ['परिच्छेद सराव — Final', 'ALL KEYS', drill(['A computer helps us to work faster and with fewer mistakes.', 'In our village, many people now pay bills and fill forms online.', 'Good typing skill saves time in every office job.', 'Practice for 15 minutes every day, and your speed will grow.'])],
];

const SPEED = [
  ['Speed Test 01 — Computers in Village Life', 'en', `Computers have reached almost every village in Maharashtra. Farmers check market rates on the internet before selling their crops. Students fill scholarship forms online and download their hall tickets without travelling to the city. The gram panchayat keeps records of birth, death and property tax on a computer, which makes the work quick and transparent.
A person who can type fast and use common software is always in demand. Banks, cooperative societies, schools and shops need operators who can enter data correctly. Therefore every young person should learn basic computer skills and practise typing regularly. With patience and daily practice, anyone can become confident and find good work near home.`],
  ['Speed Test 02 — Value of Punctuality', 'en', `Punctuality means doing the right work at the right time. A punctual student reaches the class before the lecture begins and completes the homework on the given date. Such a habit builds trust, and teachers and employers like to depend on punctual people.
When we are late, we waste not only our own time but also the time of others. A bus that leaves late makes hundreds of passengers wait. An office that opens late keeps citizens standing in a queue. Small delays add up and create big losses.
The best way to become punctual is to plan the day in advance. Keep a simple list of tasks, start early and avoid unnecessary distractions. Slowly, punctuality will become a part of your nature.`],
  ['Speed Test 03 — Digital Payments', 'en', `Digital payments have changed the way people buy and sell goods. With a mobile phone and a bank account, a customer can pay a shopkeeper in a few seconds by scanning a QR code. There is no need to carry cash or wait for change.
However, every user must follow some safety rules. Never share your PIN or OTP with anyone, even if the caller says that he is a bank officer. Check the name of the person before you send money. Do not click on unknown links received in messages. If money is taken from your account by fraud, inform your bank and the cyber crime helpline immediately.
Used carefully, digital payments are fast, safe and useful for everyone.`],
  ['Speed Test 04 — Saving Water in Farms', 'en', `Water is the most precious resource for a farmer. In many parts of our district, the rainfall is uncertain, and wells become dry in summer. Therefore farmers must use every drop of water wisely.
Drip irrigation is one of the best methods to save water. It supplies water directly to the roots of plants, so very little is wasted. Mulching the soil with dry leaves keeps it moist for a longer time. Farm ponds collect rain water that can be used later.
When the whole village works together to build check dams and plant trees, the ground water level rises. Saving water today means a safe and green future for our children.`],
  ['Speed Test 05 — The Joy of Reading', 'en', `Reading books is a habit that gives joy for the whole life. A good book takes us to new places, introduces us to interesting people and teaches us many things that we cannot learn from daily life.
Students who read regularly improve their vocabulary and their writing skill. They understand questions quickly and express their ideas clearly. Reading also improves concentration, which is very useful in typing and in every kind of office work.
Every village library and school library has many useful books. Spend at least half an hour every day with a book of your choice. Start with simple stories, and then slowly move to biographies, science and history.`],
  ['Speed Test 06 — Our Teachers', 'en', `Teachers play a very important role in our lives. They do not only teach subjects; they also teach discipline, honesty and respect for others. A good teacher understands each student and helps him or her to grow with confidence.
In a computer class, the teacher shows the correct finger position, explains every menu and patiently answers every question. When we make mistakes, the teacher corrects us without making us feel small.
We should respect our teachers, follow their advice and work sincerely. The best gift we can give to a teacher is our success and good character.`],
  ['वेग चाचणी 07 — संगणक साक्षरतेचे महत्त्व', 'mr', `आजच्या काळात संगणक साक्षरता ही प्रत्येकासाठी आवश्यक झाली आहे. बँक, शाळा, ग्रामपंचायत, दवाखाना अशा सर्व ठिकाणी कामकाज संगणकावर होते. ऑनलाइन अर्ज भरणे, बिल भरणे, निकाल पाहणे अशी कामे आता घरबसल्या करता येतात.
संगणक शिकलेल्या तरुणांना गावातच रोजगाराच्या संधी मिळतात. टायपिंगचा वेग व अचूकता चांगली असल्यास कार्यालयीन कामात मोठा फायदा होतो. म्हणून दररोज थोडा वेळ नियमित सराव करावा. सराव केल्याने आत्मविश्वास वाढतो आणि कोणतेही काम सोपे वाटू लागते.`],
  ['वेग चाचणी 08 — पाणी वाचवा', 'mr', `पाणी हे जीवन आहे. पाण्याशिवाय माणूस, प्राणी आणि वनस्पती जगू शकत नाहीत. आपल्या भागात पाऊस कमी पडतो, त्यामुळे उन्हाळ्यात पाण्याची टंचाई जाणवते. म्हणून प्रत्येकाने पाण्याचा जपून वापर केला पाहिजे.
शेतीसाठी ठिबक सिंचनाचा वापर केल्यास पाण्याची मोठी बचत होते. घरात नळ गळत असल्यास तो लगेच दुरुस्त करावा. पावसाचे पाणी साठवण्यासाठी शेततळी व बंधारे बांधावेत. झाडे लावल्याने जमिनीत पाणी मुरते. आज पाणी वाचवले तर उद्याची पिढी सुखी राहील.`],
];

const L = (s) => s.replace(/\n\s*/g, '');
const LETTERS = [
  ['Leave Application to Principal', L(`
    <div style="font-family:'Times New Roman',serif;font-size:15px;line-height:1.6">
    <p>To,<br>The Principal,<br>Shri Shivaji Vidyalaya,<br>Bhalwani, Tal. Pandharpur.</p>
    <p style="text-align:right"><b>Date : 10 July 2026</b></p>
    <p style="text-align:center"><b><u>Subject : Application for leave of three days</u></b></p>
    <p>Respected Sir,</p>
    <p style="text-align:justify">I am a student of Std. X, Division A. I request you to grant me leave from 12 July 2026 to 14 July 2026 as I have to attend the marriage of my elder sister at Sangli.</p>
    <p style="text-align:justify">I will complete the missed lessons and homework after joining the school. Kindly grant me leave for the above days.</p>
    <p>Thanking you,</p>
    <p style="text-align:right">Yours obediently,<br><b>Sneha Patil</b><br>Roll No. 21, Std. X-A</p></div>`)],
  ['Job Application — Computer Operator', L(`
    <div style="font-family:'Times New Roman',serif;font-size:15px;line-height:1.6">
    <p style="text-align:center"><b>Rahul Shinde</b><br>At Post Bhalwani, Tal. Pandharpur, Dist. Solapur - 413 304<br>Mobile : 98XXXXXX10</p>
    <p><b>Date : 5 August 2026</b></p>
    <p>To,<br>The Manager,<br>Shri Vitthal Co-operative Bank Ltd.,<br>Pandharpur - 413 304.</p>
    <p style="text-align:center"><b><u>Subject : Application for the post of Computer Operator</u></b></p>
    <p>Respected Sir / Madam,</p>
    <p style="text-align:justify">With reference to your advertisement in the daily newspaper dated 2 August 2026, I wish to apply for the post of Computer Operator in your bank.</p>
    <p style="text-align:justify">I have passed HSC with 72 percent marks and completed the computer course from Perfect Computer Education Centre, Bhalwani. My typing speed is 35 words per minute in English and 25 words per minute in Marathi. I can work on Word, Excel, email and internet.</p>
    <p style="text-align:justify">I assure you that I will work with honesty and sincerity. Kindly give me an opportunity to serve your bank.</p>
    <p>Yours faithfully,</p>
    <p style="text-align:right"><b>(Rahul Shinde)</b></p>
    <p><i>Enclosures : Copies of marksheets and certificate.</i></p></div>`)],
  ['Complaint Letter — Street Lights', L(`
    <div style="font-family:'Times New Roman',serif;font-size:15px;line-height:1.6">
    <p>To,<br>The Sarpanch,<br>Gram Panchayat Office,<br>Bhalwani.</p>
    <p style="text-align:right"><b>Date : 18 September 2026</b></p>
    <p style="text-align:center"><b><u>Subject : Complaint regarding street lights in Ward No. 3</u></b></p>
    <p>Respected Sir,</p>
    <p style="text-align:justify">We, the residents of Ward No. 3 near the Maruti Temple, wish to bring to your notice that the street lights in our lane have not been working for the last two weeks.</p>
    <p style="text-align:justify">Due to darkness, women, children and senior citizens find it difficult to walk at night, and there is a fear of snakes and theft. We request you to repair the street lights at the earliest.</p>
    <p>Thanking you,</p>
    <p style="text-align:right">Yours faithfully,<br><b>Residents of Ward No. 3</b></p></div>`)],
  ['Request for Bonafide Certificate', L(`
    <div style="font-family:'Times New Roman',serif;font-size:15px;line-height:1.6">
    <p>To,<br>The Principal,<br>Arts, Science and Commerce College,<br>Pandharpur.</p>
    <p style="text-align:right"><b>Date : 2 June 2026</b></p>
    <p style="text-align:center"><b><u>Subject : Request for Bonafide Certificate</u></b></p>
    <p>Respected Madam,</p>
    <p style="text-align:justify">I am studying in F.Y.B.Com. in your college. I need a bonafide certificate for applying for the government scholarship.</p>
    <p style="text-align:justify">I request you to kindly issue the certificate at the earliest. I have attached a copy of my identity card and fee receipt.</p>
    <p>Thanking you,</p>
    <p style="text-align:right">Yours obediently,<br><b>Pooja Jadhav</b><br>F.Y.B.Com., Roll No. 54</p></div>`)],
  ['रजेचा अर्ज (मराठी पत्र)', L(`
    <div style="font-family:'Noto Sans Devanagari',sans-serif;font-size:15px;line-height:1.8">
    <p style="text-align:right"><b>दिनांक : १० ऑगस्ट २०२६</b></p>
    <p>प्रति,<br>मा. व्यवस्थापक,<br>परफेक्ट कॉम्प्युटर एज्युकेशन सेंटर,<br>भाळवणी.</p>
    <p style="text-align:center"><b><u>विषय : दोन दिवसांच्या रजेबाबत अर्ज</u></b></p>
    <p>महोदय,</p>
    <p style="text-align:justify">मी आपल्या संस्थेत संगणक प्रशिक्षण घेत आहे. माझ्या घरी धार्मिक कार्यक्रम असल्याने मला दिनांक १२ ऑगस्ट व १३ ऑगस्ट २०२६ रोजी वर्गात उपस्थित राहता येणार नाही.</p>
    <p style="text-align:justify">तरी कृपया मला दोन दिवसांची रजा मंजूर करावी, ही नम्र विनंती.</p>
    <p style="text-align:right">आपला विश्वासू,<br><b>अमोल पवार</b><br>बॅच : सकाळ</p></div>`)],
];

const STATEMENTS = [
  ['फी वसुली नोंदवही (Fee Collection Register)', [
    '\tपरफेक्ट कॉम्प्युटर - फी वसुली (ऑगस्ट 2026)',
    '',
    'अ.क्र.\tविद्यार्थ्याचे नाव\tकोर्स\tएकूण फी\tभरलेली फी\tबाकी',
    '1\tअमोल पवार\tMS-CIT\t5000\t3000\t2000',
    '2\tसोनाली माने\tTally\t6000\t6000\t0',
    '3\tराहुल शिंदे\tTyping\t2500\t1500\t1000',
    '4\tपूजा जाधव\tMS-CIT\t5000\t2500\t2500',
    '5\tकिरण काळे\tDTP\t4500\t4500\t0',
    'एकूण\t\t\t23000\t17500\t5500',
  ]],
  ['दूध संकलन तक्ता (Milk Collection Statement)', [
    '\tश्री दत्त दूध संकलन केंद्र, भाळवणी',
    '',
    'दिनांक\tउत्पादकाचे नाव\tलिटर\tफॅट\tदर\tरक्कम',
    '01/09/2026\tबाळू गायकवाड\t12\t4.2\t38\t456',
    '01/09/2026\tसीताराम जगताप\t8\t3.8\t35\t280',
    '02/09/2026\tबाळू गायकवाड\t11\t4.1\t38\t418',
    '02/09/2026\tसीताराम जगताप\t9\t3.9\t35\t315',
    'एकूण\t\t40\t\t\t1469',
  ]],
  ['Student Result Statement', [
    '\tUnit Test Result - Std. IX',
    '',
    'Roll No.\tName\tMarathi\tEnglish\tMaths\tTotal\tResult',
    '1\tAditi Kulkarni\t42\t38\t45\t125\tPass',
    '2\tOmkar Deshmukh\t35\t29\t40\t104\tPass',
    '3\tSakshi More\t48\t44\t50\t142\tPass',
    '4\tVaibhav Salunkhe\t18\t22\t15\t55\tFail',
    '5\tNeha Bhosale\t40\t41\t37\t118\tPass',
  ]],
  ['Shop Sales Register (Monthly)', [
    '\tShri Ganesh General Stores - Sales Register',
    '',
    'Month\tGrocery\tStationery\tCosmetics\tTotal Sales',
    'April\t45,200\t8,750\t6,300\t60,250',
    'May\t48,900\t5,400\t7,100\t61,400',
    'June\t52,300\t15,600\t6,800\t74,700',
    'July\t47,800\t12,250\t7,450\t67,500',
    'Total\t1,94,200\t42,000\t27,650\t2,63,850',
  ]],
];

const EMAILS = [
  ['Email 01 — Fee Receipt Request', { to: 'office@perfectbhalawani.in', subject: 'Request for fee receipt', cc: '', bcc: '', body: 'Dear Sir,\n\nI have paid the second installment of Rs. 2,000 for the MS-CIT course on 5 September 2026. Kindly send me the fee receipt by email.\n\nThank you.\n\nRegards,\nAmol Pawar\nMorning Batch' }],
  ['Email 02 — Job Application with Resume', { to: 'hr@vitthalbank.co.in', subject: 'Application for the post of Data Entry Operator', cc: 'rahul.shinde@gmail.com', bcc: '', body: 'Respected Sir/Madam,\n\nI wish to apply for the post of Data Entry Operator advertised on your website. I have completed HSC and a computer course with typing speed of 35 WPM.\n\nPlease find my resume attached for your kind consideration.\n\nYours faithfully,\nRahul Shinde\nMobile: 98XXXXXX10' }],
  ['Email 03 — Meeting Notice', { to: 'teachers@shivajividyalaya.in', subject: 'Staff meeting on Saturday', cc: 'principal@shivajividyalaya.in', bcc: 'office@shivajividyalaya.in', body: 'Dear Teachers,\n\nA staff meeting will be held on Saturday, 20 September 2026 at 11.00 a.m. in the school library. The agenda is the planning of the first term examination.\n\nAll teachers are requested to attend on time.\n\nRegards,\nOffice Superintendent' }],
  ['Email 04 — Order to Supplier', { to: 'sales@sunstationers.com', subject: 'Order for printer paper and toner', cc: 'accounts@perfectbhalawani.in', bcc: '', body: 'Dear Sir,\n\nPlease supply the following items to our centre at the earliest:\n1. A4 paper - 10 reams\n2. Laser printer toner - 2 nos.\n\nKindly send the bill with the delivery. Payment will be made by UPI.\n\nThanks and regards,\nDhanashri Pawar\nPerfect Computer Education Centre, Bhalwani' }],
  ['Email 05 — Thank You Note', { to: 'raghunath.pawar@perfectbhalawani.in', subject: 'Thank you for the guidance', cc: '', bcc: '', body: 'Respected Sir,\n\nI am happy to inform you that I have been selected as a computer operator in the Gram Panchayat office. Your guidance and the regular typing practice in the class helped me a lot in the test.\n\nThank you very much for your support.\n\nWith regards,\nSonali Mane' }],
];

const Q = (q, options, answer) => ({ q, options, answer });
const MCQ_BASICS = [
  Q('CPU चे पूर्ण रूप काय आहे?', ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Control Processing Unit'], 0),
  Q('खालीलपैकी कोणते Input Device आहे?', ['Monitor', 'Printer', 'Keyboard', 'Speaker'], 2),
  Q('खालीलपैकी कोणते Output Device आहे?', ['Mouse', 'Scanner', 'Microphone', 'Printer'], 3),
  Q('1 KB म्हणजे किती Bytes?', ['1000', '1024', '512', '2048'], 1),
  Q('RAM ही कोणत्या प्रकारची memory आहे?', ['कायमस्वरूपी (Permanent)', 'तात्पुरती (Volatile)', 'फक्त वाचण्यासाठी', 'बाह्य (External)'], 1),
  Q('Windows हे काय आहे?', ['Application Software', 'Operating System', 'Hardware', 'Virus'], 1),
  Q('MS Word हे कोणत्या प्रकारचे software आहे?', ['Operating System', 'Utility', 'Application', 'Hardware'], 2),
  Q('Copy करण्याचा shortcut कोणता?', ['Ctrl + V', 'Ctrl + X', 'Ctrl + C', 'Ctrl + Z'], 2),
  Q('Paste करण्याचा shortcut कोणता?', ['Ctrl + P', 'Ctrl + V', 'Ctrl + S', 'Ctrl + A'], 1),
  Q('Undo करण्यासाठी कोणती keys?', ['Ctrl + Y', 'Ctrl + U', 'Ctrl + Z', 'Ctrl + D'], 2),
  Q('Home Row मध्ये डाव्या हाताची बोटे कोणत्या keys वर असतात?', ['QWER', 'ASDF', 'ZXCV', 'JKL;'], 1),
  Q('Recycle Bin मध्ये काय जाते?', ['नवीन फाइल्स', 'Delete केलेल्या फाइल्स', 'Printer च्या फाइल्स', 'Internet च्या फाइल्स'], 1),
  Q('Pen drive हे काय आहे?', ['Input device', 'Storage device', 'Output device', 'Processing device'], 1),
  Q('संगणकाचा मेंदू कोणाला म्हणतात?', ['Monitor', 'Keyboard', 'CPU', 'Mouse'], 2),
  Q('फाइलचे नाव बदलण्यासाठी कोणती key?', ['F1', 'F2', 'F5', 'F12'], 1),
  Q('सर्व मजकूर select करण्यासाठी shortcut?', ['Ctrl + A', 'Ctrl + S', 'Ctrl + E', 'Ctrl + L'], 0),
  Q('WPM चे पूर्ण रूप काय?', ['Words Per Minute', 'Work Per Month', 'Words Per Machine', 'Write Page Mode'], 0),
  Q('खालीलपैकी कोणते Web Browser आहे?', ['MS Excel', 'Google Chrome', 'Tally', 'Paint'], 1),
  Q('Save करण्याचा shortcut कोणता?', ['Ctrl + S', 'Ctrl + N', 'Ctrl + O', 'Ctrl + W'], 0),
  Q('Capital अक्षर टाइप करण्यासाठी कोणती key दाबून ठेवतात?', ['Ctrl', 'Alt', 'Shift', 'Tab'], 2),
];
const MCQ_OFFICE = [
  Q('MS Excel मध्ये बेरीज करण्याचे function कोणते?', ['=ADD()', '=SUM()', '=TOTAL()', '=PLUS()'], 1),
  Q('Excel मध्ये row व column जिथे मिळतात त्याला काय म्हणतात?', ['Box', 'Cell', 'Table', 'Sheet'], 1),
  Q('Excel मध्ये सरासरी काढण्यासाठी?', ['=AVG()', '=MEAN()', '=AVERAGE()', '=MID()'], 2),
  Q('Word मध्ये मजकूर मध्यभागी आणण्याचा shortcut?', ['Ctrl + E', 'Ctrl + R', 'Ctrl + L', 'Ctrl + J'], 0),
  Q('Word मध्ये Bold साठी shortcut?', ['Ctrl + I', 'Ctrl + U', 'Ctrl + B', 'Ctrl + D'], 2),
  Q('PowerPoint मध्ये प्रत्येक पानाला काय म्हणतात?', ['Page', 'Sheet', 'Slide', 'Frame'], 2),
  Q('Email मध्ये CC चा अर्थ काय?', ['Carbon Copy', 'Computer Copy', 'Clear Copy', 'Common Copy'], 0),
  Q('BCC मध्ये टाकलेला पत्ता इतरांना —', ['दिसतो', 'दिसत नाही', 'लाल दिसतो', 'Subject मध्ये दिसतो'], 1),
  Q('ईमेलसोबत फाइल पाठवण्याला काय म्हणतात?', ['Attachment', 'Signature', 'Draft', 'Spam'], 0),
  Q('URL चे पूर्ण रूप?', ['Uniform Resource Locator', 'Universal Real Link', 'User Resource Line', 'Uniform Read Locator'], 0),
  Q('OTP कोणाला सांगावा?', ['बँक अधिकाऱ्याला', 'मित्राला', 'कोणालाही नाही', 'दुकानदाराला'], 2),
  Q('PDF फाइल बहुतेक कशासाठी वापरतात?', ['गाणी ऐकण्यासाठी', 'document जसाच्या तसा शेअर करण्यासाठी', 'व्हिडिओ एडिटिंग', 'गेम्स'], 1),
  Q('Excel मध्ये formula कोणत्या चिन्हाने सुरू होतो?', ['+', '=', '#', '@'], 1),
  Q('Word मध्ये नवीन page सुरू करण्यासाठी (Page Break)?', ['Ctrl + Enter', 'Shift + Enter', 'Alt + Enter', 'Tab'], 0),
  Q('Internet वरील अधिकृत सरकारी website चे domain सहसा कोणते असते?', ['.com', '.gov.in', '.xyz', '.net'], 1),
  Q('Print करण्याचा shortcut?', ['Ctrl + P', 'Ctrl + T', 'Ctrl + R', 'Ctrl + Q'], 0),
  Q('Excel मध्ये सर्वात मोठी संख्या शोधण्यासाठी?', ['=MIN()', '=MAX()', '=TOP()', '=BIG()'], 1),
  Q('Email पत्त्यामध्ये कोणते चिन्ह असतेच?', ['#', '&', '@', '%'], 2),
  Q('Spam folder मध्ये सहसा काय असते?', ['महत्त्वाचे ईमेल', 'नको असलेले / संशयास्पद ईमेल', 'पाठवलेले ईमेल', 'Draft'], 1),
  Q('Word मध्ये spelling तपासण्यासाठी key?', ['F7', 'F2', 'F4', 'F9'], 0),
];

export const LAB_MODULES = [
  {
    title: '⌨️ Keyboard Lessons (टायपिंग धडे)', icon: '⌨️', sequential: true,
    desc: 'की-बोर्डवरील प्रत्येक ओळ क्रमाने शिका. एक धडा सादर केल्यावर पुढचा उघडतो.',
    exercises: LESSONS.map(([t, keys, text], i) => ({ title: `Lesson ${String(i + 1).padStart(2, '0')} · ${t}`, kind: 'keys', lang: 'en', keysLabel: keys, target: text, targetWpm: 20, tool: 'Typing', intro: '', steps: [], order: i + 1, maxMarks: 10 })),
  },
  {
    title: '⏱️ Speed Typing Practice', icon: '⏱️',
    desc: 'Word सारख्या पानावर वेळेत परिच्छेद टाइप करा — शब्दानुसार तपासणी, WPM व अचूकता.',
    exercises: SPEED.map(([t, lang, text], i) => ({ title: t, kind: 'typing', lang, target: text, duration: 300, targetWpm: lang === 'mr' ? 20 : 30, tool: 'Typing', intro: '', steps: [], order: i + 1, maxMarks: 10 })),
  },
  {
    title: '📝 Letter Writing Practice', icon: '📝',
    desc: 'संदर्भ पत्र बघून Word सारख्या संपादकात formatting सह पत्र टाइप करा.',
    exercises: LETTERS.map(([t, html], i) => ({ title: t, kind: 'letter', sampleHtml: html, tool: 'Word', intro: '', steps: ['पत्राचा मजकूर तसाच टाइप करा.', 'Bold, Underline, Center, Right, Justify असे formatting संदर्भाप्रमाणे करा.', 'पूर्ण झाल्यावर Submit Work दाबा.'], order: i + 1, maxMarks: 10 })),
  },
  {
    title: '📊 Statement Writing Practice', icon: '📊',
    desc: 'संदर्भ तक्ता Excel सारख्या sheet मध्ये त्याच cells मध्ये भरा.',
    exercises: STATEMENTS.map(([t, rows], i) => ({ title: t, kind: 'statement', sheetRows: rows, tool: 'Excel', intro: '', steps: ['प्रत्येक मजकूर संदर्भाप्रमाणे त्याच cell मध्ये (उदा. B1, A3) टाइप करा.', 'Enter ने खाली, Tab ने उजवीकडे जा.', 'पूर्ण झाल्यावर FINISH दाबा.'], order: i + 1, maxMarks: 10 })),
  },
  {
    title: '📧 Email Writing Practice', icon: '📧',
    desc: 'Mail to, Subject, CC, BCC व मजकूर — व्यावसायिक ईमेल अचूक टाइप करण्याचा सराव.',
    exercises: EMAILS.map(([t, email], i) => ({ title: t, kind: 'email', email, tool: 'Email', intro: '', steps: [], order: i + 1, maxMarks: 10 })),
  },
  {
    title: '❓ MCQ Practice', icon: '❓',
    desc: 'संगणक, Office व Internet वरील बहुपर्यायी प्रश्न — उत्तर लगेच कळते.',
    exercises: [
      { title: 'MCQ 01 — Computer Basics (20 प्रश्न)', kind: 'mcq', questions: MCQ_BASICS, tool: 'MCQ', intro: '', steps: [], order: 1, maxMarks: 20 },
      { title: 'MCQ 02 — Office, Email व Internet (20 प्रश्न)', kind: 'mcq', questions: MCQ_OFFICE, tool: 'MCQ', intro: '', steps: [], order: 2, maxMarks: 20 },
    ],
  },
];

// ---------------- Office Lab: Writer / Calc / Impress (पोर्टलवरच पूर्ण संपादक) ----------------
const cell = (r, c, v, extra = {}) => ({ r, c, v: { v, m: String(v), ct: { fa: 'General', t: typeof v === 'number' ? 'n' : 'g' }, ...extra } });
const RESULT = [['Aditi Kulkarni', 42, 38, 45], ['Omkar Deshmukh', 35, 29, 40], ['Sakshi More', 48, 44, 50], ['Vaibhav Salunkhe', 18, 22, 15], ['Neha Bhosale', 40, 41, 37]];
const resultCells = [
  cell(0, 0, 'Unit Test Result - Std. IX', { bl: 1, fs: 14 }),
  ...['Roll No.', 'Name', 'Marathi', 'English', 'Maths', 'Total', 'Average', 'Result'].map((h, c) => cell(2, c, h, { bl: 1, bg: '#dbeafe', ht: 0 })),
  ...RESULT.flatMap(([n, a, b, m], i) => {
    const r = 3 + i, row = r + 1, tot = a + b + m;
    return [
      cell(r, 0, i + 1), cell(r, 1, n), cell(r, 2, a), cell(r, 3, b), cell(r, 4, m),
      cell(r, 5, tot, { f: `=SUM(C${row}:E${row})` }),
      cell(r, 6, Math.round((tot / 3) * 100) / 100, { f: `=ROUND(AVERAGE(C${row}:E${row}),2)` }),
      cell(r, 7, Math.min(a, b, m) >= 35 ? 'Pass' : 'Fail', { f: `=IF(MIN(C${row}:E${row})>=35,"Pass","Fail")` }),
    ];
  }),
  cell(9, 1, 'Class Average', { bl: 1 }),
  ...[2, 3, 4].map((c) => { const col = 'CDE'[c - 2]; const vals = RESULT.map((x) => x[c - 1]); return cell(9, c, Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100, { bl: 1, f: `=ROUND(AVERAGE(${col}4:${col}8),2)` }); }),
];
const RESULT_BOOK = JSON.stringify([{ name: 'Result', order: 0, celldata: resultCells, config: { merge: { '0_0': { r: 0, c: 0, rs: 1, cs: 8 } }, columnlen: { 1: 150 } } }]);

const T = (text, o) => ({ type: 'Textbox', version: '6.9.1', left: 70, top: 40, width: 820, fontSize: 28, fontFamily: 'Calibri', fill: '#1f2937', text, ...o });
const DECK = JSON.stringify({
  w: 960, h: 540, slides: [
    { id: 'a', bg: '#0b2545', json: { objects: [
      T('PERFECT COMPUTERS', { top: 160, fontSize: 56, fontWeight: 'bold', textAlign: 'center', fill: '#ffffff' }),
      T('Computer Education Centre, Bhalwani', { top: 260, fontSize: 28, textAlign: 'center', fill: '#f4a259' }),
      { type: 'Rect', version: '6.9.1', left: 330, top: 320, width: 300, height: 6, fill: '#f4a259' },
    ] } },
    { id: 'b', bg: '#ffffff', json: { objects: [
      T('Our Courses', { top: 36, fontSize: 40, fontWeight: 'bold', fill: '#0b2545' }),
      T('• MS-CIT\n• Typing (English & Marathi)\n• Tally Prime with GST\n• DTP and Internet', { top: 130, fontSize: 30, lineHeight: 1.4 }),
      { type: 'Circle', version: '6.9.1', left: 700, top: 170, radius: 90, fill: '#f4a259' },
    ] } },
    { id: 'c', bg: '#fff4e6', json: { objects: [
      T('Contact Us', { top: 36, fontSize: 40, fontWeight: 'bold', fill: '#b45309' }),
      T('Near Maruti Temple, Kasba, Bhalwani\nPhone: 96659 78585\nAdmissions open — join today!', { top: 150, fontSize: 30, lineHeight: 1.5, textAlign: 'center' }),
    ] } },
  ],
});

LAB_MODULES.push({
  title: '🖥️ Office Lab — Writer, Calc, Impress', icon: '🖥️',
  desc: 'Word / Excel / PowerPoint सारखे पूर्ण संपादक पोर्टलवरच — डावीकडे नमुना, उजवीकडे काम, सादर करा.',
  exercises: [
    { title: 'Writer 01 — Notice with Table', kind: 'writer', tool: 'Writer', maxMarks: 10, order: 1, intro: 'नमुन्याप्रमाणे सूचना (Notice) तयार करा: शीर्षक मध्यभागी व Bold, तारीख उजवीकडे, वेळापत्रकाचा table.', steps: ['शीर्षक: Heading 1, मध्यभागी, Bold.', 'तारीख उजवीकडे (Align right).', 'Table → Insert table (3 स्तंभ, 4 ओळी), पहिली ओळ Bold.', 'शेवटी सही उजवीकडे.'],
      sampleHtml: '<h1 style="text-align:center">NOTICE</h1><p style="text-align:right"><b>Date : 15 November 2026</b></p><p style="text-align:justify">All students are informed that the practical examination of the computer course will be held as per the following schedule. Students must report 15 minutes before the time.</p><table style="border-collapse:collapse;width:100%" border="1"><tbody><tr><td><b>Batch</b></td><td><b>Date</b></td><td><b>Time</b></td></tr><tr><td>Morning</td><td>20/11/2026</td><td>8.00 a.m.</td></tr><tr><td>Afternoon</td><td>20/11/2026</td><td>1.00 p.m.</td></tr><tr><td>Evening</td><td>21/11/2026</td><td>5.00 p.m.</td></tr></tbody></table><p style="text-align:right"><b>Director</b><br>Perfect Computers, Bhalwani</p>' },
    { title: 'Calc 01 — Result Sheet with Formulas', kind: 'calc', tool: 'Calc', maxMarks: 10, order: 2, refBook: RESULT_BOOK, intro: 'संदर्भाप्रमाणे निकाल पत्रक तयार करा. Total, Average व Result स्वतः सूत्रांनी काढा (आकडे टाइप करू नका).', steps: ['A1 मध्ये शीर्षक, A1:H1 Merge करून Bold.', 'ओळ 3 मध्ये headings — Bold व रंगीत पार्श्वभूमी.', 'Total: =SUM(C4:E4) व खाली copy करा.', 'Average: =ROUND(AVERAGE(C4:E4),2).', 'Result: =IF(MIN(C4:E4)>=35,"Pass","Fail").', 'ओळ 10: विषयवार Class Average.'] },
    { title: 'Impress 01 — Centre Presentation (3 slides)', kind: 'impress', tool: 'Impress', maxMarks: 10, order: 3, refDeck: DECK, intro: 'नमुन्यातील 3 slides तसेच तयार करा: Title slide, Courses (bullets + आकार), Contact.', steps: ['Home → New Slide मधून layouts निवडा.', 'Design → Background / Theme ने रंग द्या.', 'Insert → Shapes मधून वर्तुळ / रेषा जोडा.', 'Slide Show → From Beginning ने तपासा.'] },
  ],
});
