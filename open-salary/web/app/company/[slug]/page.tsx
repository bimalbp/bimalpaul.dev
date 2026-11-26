import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupCard } from "@/components/GroupCard";
import { scaleFor } from "@/components/RangeBar";
import { SampleBanner } from "@/components/SampleBanner";
import { getIndex } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getIndex().companiesBySlug.get(slug);
  return { title: c ? `${c.name} salaries · Open Salary Data` : "Not found" };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = getIndex();
  const result = index.company(slug);
  if (!result) notFound();
  const { company, groups } = result;
  const scale = scaleFor(groups);
  const records = groups.reduce((n, g) => n + g.count, 0);
  const cities = new Set(groups.map((g) => g.location)).size;
  const roles = new Set(groups.map((g) => g.role.id)).size;

  return (
    <>
      {index.dataset.isSample && <SampleBanner />}
      <p className="crumbs">
        <Link href="/">Search</Link> / {company.name}
      </p>
      <h1>{company.name}</h1>
      <p className="muted">
        {roles} {roles === 1 ? "role" : "roles"} · {cities} {cities === 1 ? "city" : "cities"} · {records} records
        {company.aliases.length > 0 && <> · filed as {company.aliases.slice(0, 3).join(", ")}</>}
      </p>
      <section className="results">
        {groups.map((g) => (
          <GroupCard key={g.key} g={g} scale={scale} showCompany={false} />
        ))}
      </section>
    </>
  );
}
