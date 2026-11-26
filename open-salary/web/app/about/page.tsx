import { getIndex } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "About the data · Open Salary Data" };

export default function About() {
  const { dataset } = getIndex();
  return (
    <article className="prose">
      <h1>About the data</h1>
      <p>
        Open Salary Data is a free, public salary-transparency site. Anyone can see salary ranges with no account, no sign-in and no paywall.
        Companies may later pay to publish verified data, but no one ever pays to view it.
      </p>
      <h2>Where numbers come from</h2>
      <ul>
        <li>
          <strong>H-1B / LCA wage disclosures</strong> from the US Department of Labor&apos;s quarterly public datasets: employer, job title,
          worksite and offered wage. These are usually base pay only.
        </li>
        <li>
          <strong>Job postings in pay-transparency states</strong> (New York, California, Colorado, Washington), which must list a salary range.
          Coming next.
        </li>
      </ul>
      <h2>How to read a result</h2>
      <p>
        Each result is one role at one company in one city. Hourly, weekly and monthly pay is converted to a yearly figure (2,080 hours a year).
        The median and the middle half (25th–75th percentile) use the midpoint of each record&apos;s range; the thin line spans the lowest and
        highest figures seen.
      </p>
      <h2>Current dataset</h2>
      <p>Generated {dataset.generatedAt.slice(0, 10)}.</p>
      <ul>
        {dataset.sources.map((s) => (
          <li key={`${s.type}-${s.period ?? ""}`}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
            {s.period && <> · {s.period}</>}
          </li>
        ))}
      </ul>
      <h2>Public API</h2>
      <p>
        The same data is available as JSON, free and without a key: <code>/api/search?q=…&amp;city=…</code>, <code>/api/companies/:slug</code>
        , <code>/api/meta</code>.
      </p>
    </article>
  );
}
