import Link from "next/link";
import {
  WORDMARK_WIDTH, WORDMARK_HEIGHT, WORDMARK_LETTERS, WORDMARK_BRACKETS,
  ICON_LETTERS, ICON_LETTERS_X, ICON_BRACKETS,
} from "./brand-artwork";
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
    <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={ICON_BRACKETS} />
      <path d={ICON_LETTERS} transform={`translate(${ICON_LETTERS_X} 0)`} />
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
export function BrandWordmark() {
  return (
    <svg className="brand-wordmark" viewBox={`0 0 ${WORDMARK_WIDTH} ${WORDMARK_HEIGHT}`} aria-hidden="true" focusable="false">
      <path className="brand-brackets" d={WORDMARK_BRACKETS} />
      <path className="brand-lettering" d={WORDMARK_LETTERS} />
    </svg>
  );
}
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand bracket-brand${light ? " brand-light" : ""}`}
      aria-label="TalentFound home"
    >
      <BrandWordmark />
    </Link>
  );
}
