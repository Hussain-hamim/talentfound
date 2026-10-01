import Link from 'next/link';
import { HiringShell } from '@/components/hiring-shell';
export default function NotFound() { return <HiringShell><div className="hiring-empty"><h1>That profile isn’t here.</h1><p>It may have moved, or the address might be incorrect.</p><Link className="button button-red" href="/developers">Explore developers</Link></div></HiringShell>; }
