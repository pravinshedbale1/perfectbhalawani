import { useEffect } from 'react';

export const Spinner = () => <div className="spinner" aria-label="लोड होत आहे" />;

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="x" onClick={onClose} aria-label="बंद करा">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export const Empty = ({ children }) => <div className="empty">{children || 'माहिती उपलब्ध नाही.'}</div>;

export const Alert = ({ type = 'err', children }) => (children ? <div className={'alert ' + type}>{children}</div> : null);

export function Field({ label, required, children, full }) {
  return (
    <div className={full ? 'full' : ''}>
      <label className={required ? 'req' : ''}>{label}</label>
      {children}
    </div>
  );
}

export function StatusBadge({ status }) {
  if (status === 'evaluated') return <span className="badge ok">तपासले</span>;
  if (status === 'submitted') return <span className="badge warn">तपासणी बाकी</span>;
  if (status === 'redo') return <span className="badge bad">पुन्हा सादर करा</span>;
  return <span className="badge info">सादर नाही</span>;
}
