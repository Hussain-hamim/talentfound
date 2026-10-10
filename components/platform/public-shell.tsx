import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { getSession } from "@/lib/platform/session";
import "@/app/dashboard/dashboard.css";
export async function PublicShell({ children }: { children: ReactNode }) {
  const s = await getSession();
  return (
    <div className="platform">
      <header className="pf-public-header">
        <Brand />
        <nav>
          <Link href="/developers">Explore talent</Link>
          {s.user ? (
            <Link className="pf-button small" href="/dashboard">
              Your workspace ↗
            </Link>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link className="pf-button primary small" href="/signup">
                Join the network
              </Link>
            </>
          )}
        </nav>
      </header>
      <main id="main-content" className="pf-public-main">
        {children}
      </main>
      <footer className="pf-public-header">
        <span className="pf-note">TalentFound · Good work. Great company.</span>
        <Link className="pf-note" href="/">
          Back to home ↗
        </Link>
      </footer>
    </div>
  );
}
