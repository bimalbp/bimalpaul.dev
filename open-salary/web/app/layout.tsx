import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Salary Data",
  description: "Free, public salary ranges. No account, no sign-in, no paywall. Every number links to its public source.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="wrap header-row">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden>
                $
              </span>
              Open Salary
            </Link>
            <nav>
              <Link href="/about">About the data</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            Free to view, always. No login, no cookie wall, no email capture. Every number links back to its public source.
          </div>
        </footer>
      </body>
    </html>
  );
}
