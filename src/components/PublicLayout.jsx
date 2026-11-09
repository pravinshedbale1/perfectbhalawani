import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, isConfigured } from '../firebase';
import { CENTER } from '../config';
import { useAuth } from '../lib/auth';
import { byTimeDesc } from '../lib/format';

const initial = (s) => String(s).replace(/^(श्री\.|सौ\.|कु\.)\s*/, '').trim().charAt(0);

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
          <Link to="/" className="logo"><img src="/logo.svg" alt="परफेक्ट कॉम्प्युटर्स लोगो" /></Link>
          <div className="site-title">
            <div className="mr">{CENTER.nameMr}, {CENTER.place}</div>
            <div className="en">{CENTER.nameEn} · {CENTER.placeEn}</div>
            <div className="tag">{CENTER.tagline} — गुणवत्तापूर्ण संगणक शिक्षण, आपल्या गावात</div>
          </div>
          <div className="head-people">
            <div className="person"><span className="av">{initial(CENTER.owner)}</span><div><b>{CENTER.owner}</b><small>संचालक</small></div></div>
            <div className="person f"><span className="av">{initial(CENTER.director)}</span><div><b>{CENTER.director}</b><small>संचालिका</small></div></div>
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
  return (
    <footer className="site-foot" id="contact">
      <div className="wrap">
        <div className="f-brand">
          <img src="/logo.svg" alt="" />
          <div>
            <h4>{CENTER.nameMr}, {CENTER.place}</h4>
            <div>📍 {CENTER.address}</div>
            <div>📞 {CENTER.phones.map((p, i) => <span key={p}>{i ? ' / ' : ''}<a href={`tel:${p}`}>{p}</a></span>)}</div>
          </div>
        </div>
        <div>
          <h4>उपयुक्त दुवे</h4>
          <div><Link to="/login">विद्यार्थी लॉगिन</Link></div>
          <div><Link to="/login?admin=1">Admin लॉगिन</Link></div>
          <div><a href="/#courses">अभ्यासक्रम</a></div>
        </div>
        <div>
          <h4>व्यवस्थापन</h4>
          <div>संचालक: {CENTER.owner}</div>
          <div>संचालिका: {CENTER.director}</div>
        </div>
      </div>
      <div className="bottom">
        <div className="wrap">
          <span>© {new Date().getFullYear()} {CENTER.nameMr}, {CENTER.place}. सर्व हक्क राखीव.</span>
          <span>perfectbhalawani.in</span>
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
