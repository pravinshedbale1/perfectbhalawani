import { useEffect, useState } from 'react';

// नवीन आवृत्ती आली का ते तपासा: सर्व्हरवरील index.html मधील script नाव सध्याच्या पानाशी जुळत नसल्यास बॅनर दाखवा.
// (GitHub Pages / ब्राउझर cache मुळे जुनी आवृत्ती दिसत राहू नये म्हणून)
const currentScript = () => document.querySelector('script[type="module"][src*="/assets/index-"]')?.getAttribute('src');

export default function UpdateBanner() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const mine = currentScript();
    if (!mine) return; // dev server — तपासणी नाही
    let stopped = false;
    const check = async () => {
      if (stopped || document.hidden) return;
      try {
        const html = await (await fetch('/?_v=' + Date.now(), { cache: 'no-store' })).text();
        const latest = html.match(/\/assets\/index-[^"']+\.js/)?.[0];
        if (latest && !mine.endsWith(latest.replace(/^\//, ''))) setAvailable(true);
      } catch { /* offline — पुढच्या वेळी */ }
    };
    const t = setInterval(check, 5 * 60 * 1000);
    const onVisible = () => !document.hidden && check();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    setTimeout(check, 15000);
    return () => { stopped = true; clearInterval(t); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', onVisible); };
  }, []);

  if (!available) return null;
  return (
    <div className="update-banner" role="status">
      <span>🔄 संकेतस्थळाची नवीन आवृत्ती उपलब्ध आहे.</span>
      <button className="btn sm saffron" onClick={() => window.location.reload()}>Refresh</button>
      <button className="x" aria-label="बंद करा" onClick={() => setAvailable(false)}>×</button>
    </div>
  );
}
