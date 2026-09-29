import Link from "next/link";
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      {diagonal ? (
        <path d="M6 18 18 6M6 6h12v12" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}
export function MatchMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="m16 8-12 12 12 12M24 8l12 12-12 12M24 4l-8 32"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
export function CodeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" />
    </svg>
  );
}
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand${light ? " brand-light" : ""}`}
      aria-label="DevMatch home"
    >
      <span className="brand-mark">
        <MatchMark />
      </span>
      <span>
        devmatch<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
