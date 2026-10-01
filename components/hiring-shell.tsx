import Link from 'next/link';
import { Brand } from './brand';
import { ShortlistLink } from './hiring-ui';
import type { ReactNode } from 'react';
import '../app/developer-profiles.css';
import '../app/hiring.css';
export function HiringShell({ children }: { children: ReactNode }) {
  return <div className="hiring-shell"><header className="hiring-header"><Brand /><nav aria-label="Hiring navigation"><Link href="/developers">Explore talent</Link><ShortlistLink /><Link href="/messages">Messages</Link><Link href="/login">Log in</Link></nav></header><main id="main-content" className="hiring-main">{children}</main><footer className="hiring-footer"><Link href="/">TalentFound · Good work. Great company.</Link><span>Sample talent · Local preview</span></footer></div>;
}
