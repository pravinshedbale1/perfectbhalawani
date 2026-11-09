import { CENTER } from '../config';
import { amountInWordsMr } from '../lib/amountInWords';
import { fmtDate, money } from '../lib/format';

// एक पावती — अर्धा A4 (A5 landscape आकार)
export default function Receipt({ p, copyLabel }) {
  const paidAfter = Number(p.paidBefore || 0) + Number(p.amount || 0);
  const due = Math.max(0, Number(p.totalFee || 0) - paidAfter);
  return (
    <div className={'rcpt' + (p.cancelled ? ' void' : '')}>
      {copyLabel && <div className="copy">{copyLabel}</div>}
      <div className="rcpt-head">
        <img src="/logo.svg" alt="" />
        <div className="t">
          <div className="mr">{CENTER.nameMr}, {CENTER.place}</div>
          <div className="en">{CENTER.nameEn} · {CENTER.placeEn}</div>
          <div className="ad">{CENTER.address} · ☎ {CENTER.phones.join(' / ')}</div>
        </div>
        <div style={{ width: '19mm' }} />
      </div>

      <div className="rcpt-title"><span>फी पावती / FEE RECEIPT</span></div>

      <div className="rcpt-meta">
        <div>पावती क्र.: <b>{p.receiptNo}</b></div>
        <div>दिनांक: <b>{fmtDate(p.date)}</b></div>
      </div>

      <div className="rcpt-lines">
        <div className="rcpt-line"><span className="k">श्री./कु.</span><span className="v">{p.studentName}</span></div>
        <div className="row" style={{ gap: '4mm', flexWrap: 'nowrap' }}>
          <div className="rcpt-line" style={{ flex: 1 }}><span className="k">नोंदणी क्र.</span><span className="v">{p.regNo}</span></div>
          <div className="rcpt-line" style={{ flex: 1 }}><span className="k">मोबाईल</span><span className="v">{p.mobile}</span></div>
        </div>
        <div className="row" style={{ gap: '4mm', flexWrap: 'nowrap' }}>
          <div className="rcpt-line" style={{ flex: 1.3 }}><span className="k">अभ्यासक्रम / बॅच</span><span className="v">{[p.course, p.batchName].filter(Boolean).join(' / ')}</span></div>
          <div className="rcpt-line" style={{ flex: 1 }}><span className="k">महिना</span><span className="v">{p.forMonth}</span></div>
        </div>
        <div className="rcpt-line"><span className="k">अक्षरी रक्कम</span><span className="v">{amountInWordsMr(p.amount)}</span></div>
        <div className="rcpt-amt">
          <div className="rcpt-line" style={{ flex: 1, margin: 0 }}><span className="k">भरणा पद्धत</span><span className="v">{p.mode}{p.note ? ' — ' + p.note : ''}</span></div>
          <div className="box">{money(p.amount)}/-</div>
        </div>
        <div className="rcpt-sum">
          <div>एकूण फी<br /><b>{money(p.totalFee)}</b></div>
          <div>आतापर्यंत जमा<br /><b>{money(paidAfter)}</b></div>
          <div>बाकी फी<br /><b>{money(due)}</b></div>
        </div>
      </div>

      <div className="rcpt-foot">
        <div style={{ fontSize: '8.5pt', maxWidth: '55%' }}>
          टीप: भरलेली फी परत मिळणार नाही. ही पावती जपून ठेवा.
        </div>
        <div className="sign">प्राप्तकर्त्याची सही<br />{CENTER.nameMr}</div>
      </div>
    </div>
  );
}
