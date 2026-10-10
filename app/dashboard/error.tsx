"use client";
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="platform pf-public-main">
      <h1>We couldn’t load your workspace.</h1>
      <p className="pf-muted">Your changes are safe. Please try again.</p>
      <button className="pf-button" onClick={retry}>
        Try again
      </button>
    </main>
  );
}
