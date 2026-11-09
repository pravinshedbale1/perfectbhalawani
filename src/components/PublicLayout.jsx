import { NavLink, Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, isConfigured } from '../firebase';
import { CENTER } from '../config';
import { useAuth } from '../lib/auth';
import { byTimeDesc } from '../lib/format';

export function SiteHeader() {
  const { role, logout } = useAuth();
  return (
    <>
      <div className="tricolor" />
      <div className="topbar">
        <div className="wrap">
          <span>📍 {CENTER.address}</span>
          <span>📞 <a href={`tel:${CENTER.phones[0]}`}>{CENTER.phones.join(' / ')}</a></span>
        </div>
      </div>
      <header className="site-head">
        <div className="wrap">
          <Link to="/"><img src="/logo.svg" alt="परफेक्ट कॉम्प्युटर्स लोगो" /></Link>
          <div className="site-title">
            <div className="mr">{CENTER.nameMr}, {CENTER.place}</div>
            <div className="en">{CENTER.nameEn} · {CENTER.placeEn}</div>
            <div className="tag">{CENTER.tagline} — गुणवत्तापूर्ण संगणक शिक्षण, आपल्या गावात</div>
          </div>
          <div className="head-right">
            <b>{CENTER.owner}</b>संचालक
            <b className="mt" style={{ marginTop: 6 }}>{CENTER.director}</b>संचालिका
          </div>
        </div>
      </header>
      <nav className="mainnav">
        <div className="wrap">
          <NavLink to="/" end>मुख्यपृष्ठ</NavLink>
          <a href="/#courses">अभ्यासक्रम</a>
          <a href="/#notices">सूचना</a>
          <a href="/#contact">संपर्क</a>
          <span className="spacer" />
          {role === 'admin' && <NavLink to="/admin">Admin डॅशबोर्ड</NavLink>}
          {role === 'student' && <NavLink to="/student">माझे डॅशबोर्ड</NavLink>}
          {role ? (
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>बाहेर पडा</a>
          ) : (
            <NavLink to="/login">🔐 लॉगिन</NavLink>
          )}
        </div>
      </nav>
    </>
  );
}

export function useNotices() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!isConfigured) return;
    getDocs(collection(db, 'notices'))
      .then((s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((n) => n.active !== false).sort(byTimeDesc('createdAt'))))
      .catch(() => {});
  }, []);
  return items;
}

export function Ticker() {
  const notices = useNotices();
  const list = notices.length ? notices.map((n) => n.title) : ['नवीन बॅच प्रवेश सुरू आहेत — आजच संपर्क करा!', 'CCC, Tally, Excel, मराठी/इंग्रजी टायपिंग व AI अभ्यासक्रम उपलब्ध.'];
  return (
    <div className="ticker">
      <div className="label">ताज्या घडामोडी</div>
      <div className="track"><div className="move">{list.map((t, i) => <span key={i}>{t}</span>)}</div></div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-foot" id="contact">
      <div className="wrap">
        <div>
          <h4>{CENTER.nameMr}, {CENTER.place}</h4>
          <div>{CENTER.address}</div>
          <div>📞 {CENTER.phones.join(' / ')}</div>
        </div>
        <div>
          <h4>दुवे</h4>
          <div><Link to="/login" style={{ color: '#fff' }}>विद्यार्थी लॉगिन</Link></div>
          <div><Link to="/login?admin=1" style={{ color: '#fff' }}>Admin लॉगिन</Link></div>
        </div>
        <div>
          <h4>व्यवस्थापन</h4>
          <div>संचालक: {CENTER.owner}</div>
          <div>संचालिका: {CENTER.director}</div>
        </div>
      </div>
      <div className="bottom">© {new Date().getFullYear()} {CENTER.nameMr}, {CENTER.place}. सर्व हक्क राखीव.</div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <>
      <SiteHeader />
      <Ticker />
      <Outlet />
      <SiteFooter />
    </>
  );
}
