import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sprout } from "lucide-react";
import type { ReactNode } from "react";
const defaultAvatars = ["alex", "jamie", "nadia", "sam", "maya", "leo"];

function defaultAvatar(name: string) {
  // A stable selection keeps server rendering and every profile surface in sync.
  let hash = 0;
  for (const character of name.trim().toLowerCase()) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  }
  return `/images/avatars/${defaultAvatars[hash % defaultAvatars.length]}.svg`;
}

export function Avatar({ name, src }: { name: string; src?: string | null }) {
  return (
    <span className="pf-avatar">
      <Image
        src={src || defaultAvatar(name)}
        alt=""
        width={82}
        height={82}
        unoptimized
      />
    </span>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="pf-heading">
      <div>
        <span className="pf-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Empty({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="pf-empty">
      <Sprout size={27} />
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link className="pf-button" href={href}>
          {label}
          <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
}
export function Field({
  label,
  help,
  children,
  wide = false,
}: {
  label: string;
  help?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`pf-field ${wide ? "pf-span" : ""}`}>
      <span>{label}</span>
      {children}
      {help && <small>{help}</small>}
    </label>
  );
}
export function Status({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return error ? (
    <div role="alert" className="pf-status pf-error">
      {error}
    </div>
  ) : message ? (
    <div role="status" className="pf-status">
      {message}
    </div>
  ) : null;
}
export function Badge({ status }: { status: string }) {
  return <span className={`pf-badge ${status}`}>{status}</span>;
}
export function date(value: string) {
  return new Date(value).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}
