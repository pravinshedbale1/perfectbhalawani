import { Link } from 'react-router-dom';
import { CENTER, COURSES } from '../config';
import { useNotices } from '../components/PublicLayout';
import { fmtDate, toDate } from '../lib/format';

export default function Home() {
  const notices = useNotices();
  const isNew = (n) => Date.now() - (toDate(n.createdAt)?.getTime() || 0) < 7 * 864e5;
  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>संगणक साक्षरतेकडून डिजिटल कौशल्याकडे</h1>
          <p>
            {CENTER.nameMr}, {CENTER.place} येथे प्रात्यक्षिकावर आधारित संगणक प्रशिक्षण — टायपिंग, ऑफिस, टॅली,
            इंटरनेट, सायबर सुरक्षा आणि AI तंत्रज्ञान. प्रत्येक विद्यार्थ्याचा सराव, गुण व प्रगती ऑनलाइन.
          </p>
          <div className="btns">
            <Link className="btn saffron" to="/login">👨‍🎓 विद्यार्थी लॉगिन</Link>
            <Link className="btn white" to="/login?admin=1">🔐 Admin लॉगिन</Link>
          </div>
        </div>
        <div className="hero-box">
          <b>आमची वैशिष्ट्ये</b>
          <ul>
            <li>✅ मॉड्यूलनिहाय प्रात्यक्षिक सराव</li>
            <li>✅ सराव फाइल ऑनलाइन सादर करण्याची सोय</li>
            <li>✅ शिक्षकांकडून गुण व अभिप्राय</li>
            <li>✅ बॅचनिहाय लीडरबोर्ड</li>
            <li>✅ मराठी माध्यमातून मार्गदर्शन</li>
          </ul>
        </div>
      </section>

      <div className="grid split" id="courses">
        <div>
          <div className="section-title"><h2>अभ्यासक्रम</h2></div>
          <div className="grid g2">
            {COURSES.map((c) => (
              <div key={c.name} className="card accent course">
                <div className="icon">{c.icon}</div>
                <h3>{c.mr}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="notices">
          <div className="section-title"><h2>सूचना फलक</h2></div>
          <div className="card notice-board">
            {notices.length ? (
              <ul>
                {notices.map((n) => (
                  <li key={n.id}>
                    {n.link ? <a href={n.link} target="_blank" rel="noreferrer">{n.title}</a> : n.title}
                    {isNew(n) && <span className="new-badge">नवीन</span>}
                    <small>{fmtDate(n.createdAt)}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">सध्या कोणतीही सूचना नाही.</p>
            )}
          </div>
          <div className="card mt">
            <h3>संपर्क</h3>
            <div>📍 {CENTER.address}</div>
            {CENTER.phones.map((p) => <div key={p}>📞 <a href={`tel:${p}`}>{p}</a></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
