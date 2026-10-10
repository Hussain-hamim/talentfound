"use client";
import Link from "next/link";
import { useState } from "react";
import { AccountLinks } from "./platform/account-links";
import { Arrow, Brand } from "./brand";
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner frame">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#developers">The people</a>
          <a href="#for-founders">Find your match</a>
        </nav>
        <div className="header-actions">
          <AccountLinks />
        </div>
        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            "×"
          ) : (
            <>
              <span />
              <span />
            </>
          )}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
          onClick={() => setOpen(false)}
        >
          <a href="#developers">The people</a>
          <a href="#for-founders">Find your match</a>
          <AccountLinks />
          <Link href="/signup">
            Create your profile <Arrow />
          </Link>
        </nav>
      )}
    </header>
  );
}
