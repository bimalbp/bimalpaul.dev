import Link from "next/link";

export function SampleBanner() {
  return (
    <div className="banner" role="note">
      <strong>Sample data.</strong> These companies are fictional and the numbers are generated for the demo. Real data loads from public US
      Department of Labor filings. <Link href="/about">How the data works</Link>
    </div>
  );
}
