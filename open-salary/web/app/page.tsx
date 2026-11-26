import Link from "next/link";
import { GroupCard } from "@/components/GroupCard";
import { scaleFor } from "@/components/RangeBar";
import { SampleBanner } from "@/components/SampleBanner";
import { SearchForm } from "@/components/SearchForm";
import { getIndex } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; city?: string }> }) {
  const { q = "", city = "" } = await searchParams;
  const index = getIndex();
  const hasQuery = Boolean(q.trim() || city.trim());
  const { total, groups } = hasQuery ? index.search({ q, city, limit: 50 }) : { total: 0, groups: [] };
  const scale = scaleFor(groups);
  const stats = index.stats();

  return (
    <>
      {index.dataset.isSample && <SampleBanner />}
      {!hasQuery && (
        <section className="hero">
          <h1>See what jobs pay. Free.</h1>
          <p className="lede">
            Salary ranges from public filings and pay-transparent job postings. No account, no sign-in, no paywall, and every number links to
            its source.
          </p>
        </section>
      )}
      <SearchForm q={q} city={city} autoFocus={!hasQuery} />

      {hasQuery ? (
        <section className="results">
          <p className="muted">
            {total === 0 ? "No results." : `${total} result${total === 1 ? "" : "s"}`}
            {total > groups.length && ` · showing top ${groups.length}`}
            {total === 0 && " Try a company name or a shorter title."}
          </p>
          {groups.map((g) => (
            <GroupCard key={g.key} g={g} scale={scale} />
          ))}
        </section>
      ) : (
        <section className="browse">
          <h2>Browse companies</h2>
          <p className="muted small">
            {stats.records.toLocaleString()} salary records · {stats.companies.toLocaleString()} companies · {stats.roles.toLocaleString()} roles
          </p>
          <ul className="chips">
            {index.dataset.companies.slice(0, 40).map((c) => (
              <li key={c.id}>
                <Link href={`/company/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
