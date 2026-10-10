"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Arrow } from "@/components/brand";
export function AccountLinks() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const db = createClient();
    let active = true;
    void db.auth.getUser().then(({ data }) => {
      if (active) setSignedIn(!!data.user);
    });
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  return signedIn ? (
    <Link className="button button-red button-small" href="/dashboard">
      Your workspace <Arrow diagonal />
    </Link>
  ) : (
    <>
      <Link href="/login" className="login-link">
        Log in
      </Link>
      <Link href="/signup" className="button button-red button-small">
        Join the network <Arrow diagonal />
      </Link>
    </>
  );
}
