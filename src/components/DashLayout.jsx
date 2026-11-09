import { useEffect, useState } from 'react';
import { NavLink, Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { SiteHeader } from './PublicLayout';
import { useAuth } from '../lib/auth';
import { Spinner, PersonIcon } from './ui';
import { CENTER } from '../config';

export default function DashLayout({ role, links }) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);

  if (auth.loading) return <Spinner />;
  if (!auth.user) return <Navigate to={role === 'admin' ? '/login?admin=1' : '/login'} replace />;
  const blocked =
    auth.role !== role ? 'या पानासाठी परवानगी नाही. कृपया योग्य खात्याने लॉगिन करा.'
    : role === 'student' && auth.profile?.active === false ? 'तुमचे खाते सध्या निष्क्रिय आहे. कृपया संस्थेशी संपर्क साधा.'
    : '';
  if (blocked) {
    return (
      <>
        <SiteHeader />
        <div className="page"><div className="alert err">{blocked}</div></div>
      </>
    );
  }

  const name = auth.profile?.name || 'Admin';
  const sub = role === 'admin' ? 'प्रशासक' : `${auth.profile?.loginId || ''} · ${auth.profile?.batchName || ''}`;

  return (
    <>
      <header className="appbar">
        <div className="bar">
          <button className="menu-btn" aria-label="मेनू" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
          <Link to="/" className="brand">
            <img src="/logo.svg" alt="" />
            <div>
              <b>{CENTER.nameMr}, {CENTER.place}</b>
              <small>{role === 'admin' ? 'व्यवस्थापन पॅनेल' : 'विद्यार्थी पोर्टल'}</small>
            </div>
          </Link>
          <span className="spacer" />
          <div className="user">
            <div className="nm" style={{ textAlign: 'right' }}><b>{name}</b><small>{sub}</small></div>
            <span className="av"><PersonIcon /></span>
            <button className="btn sm light logout-btn" onClick={() => auth.logout()}>⎋ Log Out</button>
          </div>
        </div>
      </header>
      <div className="dash">
        <aside className={'side' + (open ? ' open' : '')}>
          <div className="sec">{role === 'admin' ? 'व्यवस्थापन' : 'माझे शिक्षण'}</div>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <span className="ic">{l.icon}</span> {l.label}
            </NavLink>
          ))}
          <div className="bottom-links">
            <Link to="/"><span className="ic">🌐</span> मुख्य संकेतस्थळ</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); auth.logout(); }}><span className="ic">🚪</span> Log Out</a>
          </div>
        </aside>
        <div className={'scrim' + (open ? ' open' : '')} onClick={() => setOpen(false)} />
        <main className="dash-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
