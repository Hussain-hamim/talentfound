import Link from "next/link";
import { PublicShell } from "@/components/platform/public-shell";
export default function NotFound() {
  return (
    <PublicShell>
      <div className="pf-empty">
        <h1>That profile isn’t here.</h1>
        <p>It may have moved, or the address might be incorrect.</p>
        <Link className="button button-red" href="/developers">
          Explore developers
        </Link>
      </div>
    </PublicShell>
  );
}
