type ConnectionArtProps = {
  variant: "people" | "together";
};

export function ConnectionArt({ variant }: ConnectionArtProps) {
  return (
    <svg
      className={`connection-graphic connection-graphic-${variant}`}
      viewBox="0 0 360 320"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {variant === "people" ? (
        <g transform="rotate(-9 180 160)">
          <circle cx="124" cy="104" r="48" fill="var(--accent)" />
          <rect x="184.8" y="56" width="96" height="96" rx="4.8" fill="var(--brand-white)" />
          <rect x="76" y="164.8" width="96" height="96" rx="4.8" fill="#aaa5a7" />
          <path
            d="M189.6 164.8H276a4.8 4.8 0 0 1 4.8 4.8v19.2a72 72 0 0 1-72 72h-19.2a4.8 4.8 0 0 1-4.8-4.8v-86.4a4.8 4.8 0 0 1 4.8-4.8Z"
            fill="var(--brand-brown)"
          />
        </g>
      ) : (
        <g className="connection-pieces" transform="rotate(-12 180 160)">
          <path
            d="M64 70h110v48c0 5 5 8 10 5a23 23 0 1 1 0 42c-5-3-10 0-10 5v48H64V70Z"
            fill="#ff3317"
          />
          <path
            d="M190 86h110v148H190v-46c0-4 3-6 7-5a39 39 0 1 0 0-77c-4 1-7-1-7-5V86Z"
            fill="#f5f1e8"
          />
          <path d="M80 87h32M80 96h19" stroke="#ffac97" strokeWidth="2" opacity="0.55" />
          <path d="M253 208h30m-18 8h18" stroke="#a6a097" strokeWidth="2" opacity="0.6" />
        </g>
      )}
    </svg>
  );
}
