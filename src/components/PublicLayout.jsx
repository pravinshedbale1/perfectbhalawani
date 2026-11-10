import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, isConfigured } from '../firebase';
import { CENTER } from '../config';
import { useAuth } from '../lib/auth';
import { byTimeDesc } from '../lib/format';
import { PersonIcon } from './ui';


export function SiteHeader() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname, loc.hash]);

  return (
    <>
      <div className="tricolor" />
      <div className="topbar">
        <div className="wrap">
          <span className="tb-left">📍 {CENTER.address}</span>
          <span className="tb-right">
            {CENTER.phones.map((p) => <a key={p} href={`tel:${p}`}>📞 {p}</a>)}
          </span>
        </div>
      </div>
      <header className="site-head">
        <div className="wrap">
          <Link to="/" className="logo"><img src="/logo.png" alt="परफेक्ट कॉम्प्युटर्स लोगो" /></Link>
          <div className="site-title">
            <div className="mr">{CENTER.nameMr}, {CENTER.place}</div>
            <div className="en">{CENTER.nameEn} · {CENTER.placeEn}</div>
            <div className="tag">{CENTER.tagline} — गुणवत्तापूर्ण संगणक शिक्षण, आपल्या गावात</div>
          </div>
          <div className="head-people">
            <div className="person"><span className="av"><PersonIcon /></span><div><b>{CENTER.owner}</b><small>संचालक</small></div></div>
            <div className="person f"><span className="av"><PersonIcon /></span><div><b>{CENTER.director}</b><small>संचालिका</small></div></div>
          </div>
        </div>
      </header>
      <nav className="mainnav" aria-label="मुख्य मेनू">
        <div className="wrap">
          <button className="menu-btn" aria-label="मेनू" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
          <div className={'links' + (open ? ' open' : '')}>
            <NavLink to="/" end>मुख्यपृष्ठ</NavLink>
            <a href="/#courses">अभ्यासक्रम</a>
            <a href="/#admission">प्रवेश प्रक्रिया</a>
            <a href="/#notices">सूचना फलक</a>
            <a href="/#contact">संपर्क</a>
          </div>
          <span className="spacer" />
          {role === 'admin' && <NavLink className="nav-cta" to="/admin">Admin डॅशबोर्ड →</NavLink>}
          {role === 'student' && <NavLink className="nav-cta" to="/student">माझे डॅशबोर्ड →</NavLink>}
          {!role && <NavLink className="nav-cta" to="/login">🔐 लॉगिन</NavLink>}
        </div>
      </nav>
    </>
  );
}

export function useNotices() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    if (!isConfigured) return setItems([]);
    getDocs(collection(db, 'notices'))
      .then((s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((n) => n.active !== false).sort(byTimeDesc('createdAt'))))
      .catch(() => setItems([]));
  }, []);
  return items;
}

export function Ticker({ notices }) {
  const list = notices?.length
    ? notices.map((n) => n.title)
    : ['नवीन बॅच प्रवेश सुरू आहेत — आजच संपर्क करा!', 'CCC, Tally, Excel, मराठी/इंग्रजी टायपिंग व AI अभ्यासक्रम उपलब्ध.', `संपर्क: ${CENTER.phones.join(' / ')}`];
  return (
    <div className="ticker">
      <div className="wrap">
        <span className="label">ताज्या घडामोडी</span>
        <div className="track"><div className="move">{list.map((t, i) => <span key={i}>{t}</span>)}</div></div>
      </div>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-foot" id="contact">
      <div className="wrap f-grid">
        <div className="f-brand">
          <img src="/logo.png" alt="परफेक्ट कॉम्प्युटर्स लोगो" />
          <div>
            <h4>{CENTER.nameMr}, {CENTER.place}</h4>
            <div className="f-en">{CENTER.nameEn} · {CENTER.placeEn}</div>
            <p className="f-tag">संगणक प्रशिक्षण केंद्र — गुणवत्तापूर्ण संगणक शिक्षण, आपल्या गावात.</p>
          </div>
        </div>
        <div>
          <h4>संपर्क</h4>
          <ul className="f-list">
            <li><span className="f-ic">📍</span><span>{CENTER.address}</span></li>
            {CENTER.phones.map((p) => (
              <li key={p}><span className="f-ic">📞</span><a href={`tel:+91${p}`}>{p.replace(/(\d{5})(\d{5})/, '$1 $2')}</a></li>
            ))}
            <li><span className="f-ic">🗺️</span><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Perfect Computers Bhalwani Pandharpur')}`} target="_blank" rel="noreferrer">नकाशावर पहा</a></li>
          </ul>
        </div>
        <div>
          <h4>उपयुक्त दुवे</h4>
          <ul className="f-list f-links">
            <li><a href="/#courses">अभ्यासक्रम</a></li>
            <li><Link to="/login">विद्यार्थी लॉगिन</Link></li>
            <li><Link to="/login?admin=1">Admin लॉगिन</Link></li>
          </ul>
        </div>
        <div>
          <h4>व्यवस्थापन</h4>
          <ul className="f-list">
            <li><span className="f-ic">👤</span><span><small>संचालक</small><b>{CENTER.owner}</b></span></li>
            <li><span className="f-ic">👤</span><span><small>संचालिका</small><b>{CENTER.director}</b></span></li>
          </ul>
        </div>
      </div>
      <div className="bottom">
        <div className="wrap">
          <span>© {year} {CENTER.nameMr}, {CENTER.place}. सर्व हक्क राखीव.</span>
          <span className="f-credit">
            Developed by <a href="mailto:pravinvshedbale09@gmail.com" title="pravinvshedbale09@gmail.com">Pravin Shedbale</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const notices = useNotices();
  return (
    <>
      <SiteHeader />
      <Ticker notices={notices} />
      <Outlet context={{ notices }} />
      <SiteFooter />
    </>
  );
}
