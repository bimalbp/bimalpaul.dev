import Link from "next/link";
import { money, moneyShort, PERIOD_LABEL, roleName, SOURCE_LABEL } from "@/lib/format";
import type { SalaryGroup } from "@/lib/types";
import { RangeBar } from "./RangeBar";

export function GroupCard({ g, scale, showCompany = true }: { g: SalaryGroup; scale: [number, number]; showCompany?: boolean }) {
  return (
    <article className="card">
      <div className="card-head">
        <div>
          {showCompany && (
            <Link href={`/company/${g.company.slug}`} className="company">
              {g.company.name}
            </Link>
          )}
          <h3>{roleName(g.role)}</h3>
          <div className="muted">
            {g.location} · {g.count} {g.count === 1 ? "record" : "records"} · updated {g.lastUpdated}
          </div>
        </div>
        <div className="median">
          <div className="median-value">{moneyShort(g.median, g.currency)}</div>
          <div className="muted small">median / yr</div>
        </div>
      </div>
      <RangeBar {...g} scale={scale} showBand={g.count >= 3} />
      <div className="range-legend muted small">
        <span>
          <span className="key key-line" aria-hidden /> range {moneyShort(g.low, g.currency)}–{moneyShort(g.high, g.currency)}
        </span>
        {g.count >= 3 && (
          <span>
            <span className="key key-band" aria-hidden /> middle half {moneyShort(g.p25, g.currency)}–{moneyShort(g.p75, g.currency)}
          </span>
        )}
        <span>
          <span className="key key-median" aria-hidden /> median {moneyShort(g.median, g.currency)}
        </span>
      </div>
      <details>
        <summary>Sources ({g.count})</summary>
        <table className="records">
          <thead>
            <tr>
              <th>Title as listed</th>
              <th>Range</th>
              <th>Source</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {g.records.map((r) => (
              <tr key={r.id}>
                <td>{r.rawTitle}</td>
                <td className="num">
                  {money(r.min, r.currency)}
                  {r.max !== r.min && <>–{money(r.max, r.currency)}</>}
                  <span className="muted">{PERIOD_LABEL[r.payPeriod]}</span>
                </td>
                <td>
                  <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {SOURCE_LABEL[r.sourceType] ?? r.sourceType}
                  </a>
                  {r.sourceRef && <span className="muted small"> {r.sourceRef}</span>}
                </td>
                <td className="nowrap">{r.observedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </article>
  );
}
