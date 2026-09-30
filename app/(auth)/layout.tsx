import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/brand";
import "./auth.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-visual" aria-hidden="true">
        <Image src="/images/auth-portal.png" alt="" fill sizes="50vw" priority />
      </aside>
      <div className="auth-form-side">
        <header className="auth-header">
          <Link className="auth-home-link" href="/">Back to home <Arrow diagonal /></Link>
        </header>
        <main className="auth-content" id="main-content">{children}</main>
        <footer className="auth-footer">
          <span>Good work. Great company.</span>
          <span>© {new Date().getFullYear()} TalentFound</span>
        </footer>
      </div>
    </div>
  );
}
