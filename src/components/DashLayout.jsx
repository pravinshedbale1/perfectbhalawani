import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { SiteHeader } from './PublicLayout';
import { useAuth } from '../lib/auth';
import { Spinner } from './ui';

export default function DashLayout({ role, links }) {
  const auth = useAuth();
  if (auth.loading) return <Spinner />;
  if (!auth.user) return <Navigate to={role === 'admin' ? '/login?admin=1' : '/login'} replace />;
  if (auth.role !== role) {
    return (
      <>
        <SiteHeader />
        <div className="page"><div className="alert err">या पानासाठी परवानगी नाही. कृपया योग्य खात्याने लॉगिन करा.</div></div>
      </>
    );
  }
  if (role === 'student' && auth.profile?.active === false) {
    return (
      <>
        <SiteHeader />
        <div className="page"><div className="alert err">तुमचे खाते सध्या निष्क्रिय आहे. कृपया संस्थेशी संपर्क साधा.</div></div>
      </>
    );
  }
  return (
    <>
      <SiteHeader />
      <div className="dash">
        <aside className="side">
          <div className="who">
            <b>{auth.profile?.name || auth.user.email}</b>
            <small>{role === 'admin' ? 'प्रशासक (Admin)' : auth.profile?.batchName || 'विद्यार्थी'}</small>
          </div>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
          <a href="#" onClick={(e) => { e.preventDefault(); auth.logout(); }}><span>🚪</span> बाहेर पडा</a>
        </aside>
        <main className="dash-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
