import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { CENTER, COURSES } from '../config';
import { fmtDate, toDate } from '../lib/format';

const byOrder = (a, b) => Number(a.order || 0) - Number(b.order || 0);

// अभ्यासक्रम व मॉड्यूल्स Firestore मधून (Admin → अभ्यासक्रम व सराव); नसल्यास config मधील यादी
function useSyllabus() {
  const [state, setState] = useState({ courses: null, modules: [] });
  useEffect(() => {
    Promise.all([getDocs(collection(db, 'courses')), getDocs(collection(db, 'modules'))])
      .then(([c, m]) => setState({
        courses: c.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => x.active !== false && x.showOnHome !== false).sort(byOrder),
        modules: m.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => x.active !== false).sort(byOrder),
      }))
      .catch(() => setState({ courses: [], modules: [] }));
  }, []);
  const fallback = COURSES.map((c) => ({ id: c.name, name: c.name, title: c.mr, icon: c.icon, desc: c.desc }));
  return { courses: state.courses?.length ? state.courses : state.courses ? fallback : null, modules: state.modules };
}

export default function Home() {
  const { notices } = useOutletContext() || {};
  const isNew = (n) => Date.now() - (toDate(n.createdAt)?.getTime() || 0) < 7 * 864e5;
  const { courses, modules } = useSyllabus();
  const modsFor = (c) => modules.filter((m) => m.courseIds?.includes(c.id));

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <span className="kicker">🎓 {CENTER.tagline} · {CENTER.place}</span>
            <h1>संगणक साक्षरतेकडून <em>डिजिटल कौशल्याकडे</em></h1>
            <p>
              प्रात्यक्षिकावर आधारित संगणक प्रशिक्षण — टायपिंग, ऑफिस, टॅली, इंटरनेट, सायबर सुरक्षा आणि AI तंत्रज्ञान.
              प्रत्येक विद्यार्थ्याचा सराव, गुण व प्रगती आता ऑनलाइन.
            </p>
            <div className="btns">
              <Link className="btn saffron" to="/login">👨‍🎓 विद्यार्थी लॉगिन</Link>
              <a className="btn ghost" href="#courses">अभ्यासक्रम पहा</a>
            </div>
          </div>
          <div className="hero-box">
            <h3>आमची वैशिष्ट्ये</h3>
            <ul>
              <li>मॉड्यूलनिहाय प्रात्यक्षिक सराव व पायऱ्या</li>
              <li>सराव फाइल ऑनलाइन सादर करण्याची सोय</li>
              <li>शिक्षकांकडून गुण व वैयक्तिक अभिप्राय</li>
              <li>बॅचनिहाय लीडरबोर्ड — निरोगी स्पर्धा</li>
              <li>संपूर्ण मार्गदर्शन मराठीतून</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="wrap">
          <div className="it"><b>{courses ? courses.length : '…'}</b><span>अभ्यासक्रम</span></div>
          <div className="it"><b>{modules.length || '…'}</b><span>प्रशिक्षण मॉड्यूल्स</span></div>
          <div className="it"><b>100%</b><span>प्रात्यक्षिक शिक्षण</span></div>
          <div className="it"><b>मराठी</b><span>माध्यमातून शिक्षण</span></div>
        </div>
      </section>

      <div className="page">
        <div className="home-grid">
          <div>
            <div className="section-title" id="courses"><h2>अभ्यासक्रम</h2></div>
            <div className="grid g2 courses-grid">
              {(courses || []).map((c) => {
                const mods = modsFor(c);
                return (
                  <div key={c.id} className="card accent course">
                    <div className="icon">{c.icon}</div>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                    {c.duration && <div className="meta"><span className="badge info">⏱ {c.duration}</span></div>}
                    {mods.length > 0 && (
                      <ul className="course-mods">
                        {mods.slice(0, 6).map((m) => <li key={m.id}>{m.title}</li>)}
                        {mods.length > 6 && <li>+{mods.length - 6} अधिक</li>}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="section-title" id="admission"><h2>प्रवेश प्रक्रिया</h2></div>
            <div className="steps-row">
              <div className="card step-card"><h3>संस्थेत संपर्क</h3><p>केंद्राला भेट द्या किंवा फोन करा. अभ्यासक्रम व बॅचची वेळ निवडा.</p></div>
              <div className="card step-card"><h3>नोंदणी व Student ID</h3><p>नोंदणीनंतर तुम्हाला Student ID व पासवर्ड मिळेल. फीची पावती लगेच.</p></div>
              <div className="card step-card"><h3>ऑनलाइन सराव सुरू</h3><p>लॉगिन करा, सराव पूर्ण करून फाइल सादर करा, गुण व क्रमांक पहा.</p></div>
            </div>
          </div>

          <aside className="home-side">
            <div className="card notice-board" id="notices">
              <div className="nb-head"><h3>📢 सूचना फलक</h3></div>
              {notices?.length ? (
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
                <p className="empty-note">{notices ? 'सध्या कोणतीही सूचना नाही.' : 'लोड होत आहे…'}</p>
              )}
            </div>
            <div className="card contact-card">
              <h3>संपर्क</h3>
              <div className="ci"><span>📍</span><span>{CENTER.address}</span></div>
              {CENTER.phones.map((p) => <div className="ci" key={p}><span>📞</span><a href={`tel:${p}`}>{p}</a></div>)}
              <a className="btn green block mt" href={`https://wa.me/91${CENTER.phones[0]}`} target="_blank" rel="noreferrer">💬 WhatsApp वर संपर्क</a>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
