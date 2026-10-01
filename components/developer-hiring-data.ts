import type { Developer, DeveloperProject } from './developer-profile-data';

export const engagements = ['Freelance', 'Full-time', 'Co-founder'] as const;
export type Engagement = (typeof engagements)[number];
export type HiringDetails = {
  engagements: Engagement[];
  domains: string[];
  hourlyUsd: number;
  salaryUsd: number;
  hoursPerWeek: number;
  startWeeks: number;
  utcHours: readonly [number, number];
  approach: string;
  founder?: { stage: string; commitment: string; equity: string; lookingFor: string };
};

// Illustrative expectations, not real offers, availability, or salary benchmarks.
export const hiringDetails: Record<string, HiringDetails> = {
  'alex-morgan': { engagements: ['Full-time', 'Freelance'], domains: ['SaaS', 'Design systems'], hourlyUsd: 85, salaryUsd: 115000, hoursPerWeek: 40, startWeeks: 2, utcHours: [9, 17], approach: 'Start with the user journey, build a small accessible slice, then iterate with the product team. Weekly demos and documented component decisions.' },
  'jamie-chen': { engagements: ['Freelance', 'Co-founder'], domains: ['SaaS', 'Commerce'], hourlyUsd: 95, salaryUsd: 135000, hoursPerWeek: 30, startWeeks: 3, utcHours: [13, 21], approach: 'Make the first release small enough to ship. Agree on the core journey, model the data, and test the whole flow before adding features.', founder: { stage: 'Idea to first customers', commitment: '20–30 hours/week initially', equity: 'Open to discussing a meaningful founding stake', lookingFor: 'A commercial partner who enjoys customer discovery and selling.' } },
  'nadia-hassan': { engagements: ['Freelance', 'Full-time'], domains: ['Developer tools', 'Infrastructure'], hourlyUsd: 80, salaryUsd: 105000, hoursPerWeek: 25, startWeeks: 0, utcHours: [8, 16], approach: 'Define the failure modes before the happy path. Small API contracts, observable services, and a handover your team can maintain.' },
  'sam-rivera': { engagements: ['Freelance'], domains: ['Creative', 'Commerce'], hourlyUsd: 70, salaryUsd: 90000, hoursPerWeek: 20, startWeeks: 0, utcHours: [11, 19], approach: 'Prototype the interaction early, then refine the details. Every expressive experience gets a fast, keyboard-friendly alternative.' },
  'maya-patel': { engagements: ['Full-time', 'Co-founder'], domains: ['SaaS', 'Collaboration'], hourlyUsd: 75, salaryUsd: 100000, hoursPerWeek: 40, startWeeks: 4, utcHours: [5, 13], approach: 'Bring the team into the prototype early. I like clear ownership, asynchronous updates, and shipping small improvements continuously.', founder: { stage: 'Prototype or early validation', commitment: 'Full-time after a four-week transition', equity: 'Discussed together after a working session', lookingFor: 'A domain expert with a clear customer problem and time to validate it.' } },
  'leo-martins': { engagements: ['Freelance', 'Full-time'], domains: ['Infrastructure', 'Developer tools'], hourlyUsd: 110, salaryUsd: 145000, hoursPerWeek: 35, startWeeks: 3, utcHours: [12, 20], approach: 'Make infrastructure understandable. Start with a runbook and a repeatable environment, then build reliable delivery and useful monitoring.' },
};

export type ProjectEvidence = {
  context: string;
  problem: string;
  outcome: string;
  artifacts: string[];
};
const evidence: Record<string, ProjectEvidence> = {
  Orbit: { context: 'Product team · frontend owner', problem: 'A busy workspace needed predictable navigation across projects and tasks.', outcome: 'A unified task workflow with keyboard navigation and reusable components.', artifacts: ['Interface walkthrough', 'Component decisions', 'Keyboard navigation checklist'] },
  'Forma UI': { context: 'Internal tooling · library maintainer', problem: 'Product teams were implementing the same interface patterns differently.', outcome: 'Shared components with documented states and a visual regression workflow.', artifacts: ['Component catalogue', 'Accessibility notes', 'Visual test strategy'] },
  Wayfinder: { context: 'Travel product · interface lead', problem: 'Editing an itinerary on a small screen was difficult alongside a map.', outcome: 'A responsive map and editor that keeps trip context visible.', artifacts: ['Mobile flow', 'Map interaction notes'] },
  Readwell: { context: 'Reading product · solo frontend build', problem: 'Saved reading needed to remain usable without a connection.', outcome: 'An offline reader with adjustable typography and reading preferences.', artifacts: ['Offline flow', 'Cache strategy'] },
  Gather: { context: 'Early-stage product · solo engineering', problem: 'A small community needed a shared home for people and events.', outcome: 'Member onboarding, event discovery, and a consistent data model.', artifacts: ['Member journey', 'Schema outline', 'Permissions walkthrough'] },
  Counter: { context: 'Commerce team · full-stack owner', problem: 'Independent sellers needed checkout and inventory in one workspace.', outcome: 'An integrated purchasing flow and merchant dashboard.', artifacts: ['Checkout flow', 'Inventory model'] },
  'Open Hours': { context: 'Scheduling product · full-stack build', problem: 'Booking across working hours and time zones created conflicts.', outcome: 'Availability rules with calendar sync and booking reminders.', artifacts: ['Timezone examples', 'Conflict handling'] },
  Relay: { context: 'Platform team · backend owner', problem: 'Background tasks needed to recover cleanly after transient failures.', outcome: 'A queue service with bounded retries, schedules, and observable job states.', artifacts: ['Queue architecture', 'Retry policy', 'Failure-mode walkthrough'] },
  Beacon: { context: 'Infrastructure team · API owner', problem: 'Service signals were noisy and difficult to act on.', outcome: 'A health API that turns telemetry into actionable service states.', artifacts: ['API contract', 'Alert design', 'Telemetry flow'] },
  Papertrail: { context: 'Developer tooling · solo build', problem: 'Hand-written API documentation drifted from the application schema.', outcome: 'Versioned documentation and integration examples generated from schemas.', artifacts: ['OpenAPI outline', 'Documentation pipeline'] },
  Playground: { context: 'Personal experiments · creative development', problem: 'Interactive graphics needed to stay usable on modest devices.', outcome: 'Responsive visual experiments with reduced-motion alternatives.', artifacts: ['Interaction studies', 'Rendering approach'] },
  Frequency: { context: 'Audio prototype · solo build', problem: 'An audio-reactive experience also needed understandable playback controls.', outcome: 'Browser audio analysis with accessible controls and canvas rendering.', artifacts: ['Audio pipeline', 'Control states'] },
  'Soft Space': { context: 'Studio website · development lead', problem: 'A tactile visual identity needed to translate across screen sizes.', outcome: 'A responsive brand experience with purposeful motion.', artifacts: ['Responsive layouts', 'Motion guidelines'] },
  Afterimage: { context: 'Gallery prototype · creative development', problem: 'Immersive navigation could make an artwork collection harder to browse.', outcome: 'A 3D gallery paired with standard browsing and keyboard controls.', artifacts: ['Navigation modes', 'Image loading strategy'] },
  Fieldnotes: { context: 'Research product · full-stack owner', problem: 'Research notes and collections were scattered across tools.', outcome: 'A collaborative editor with shared collections and full-text search.', artifacts: ['Editor flow', 'Search architecture'] },
  Together: { context: 'Collaboration prototype · sync owner', problem: 'Concurrent board edits needed to avoid overwriting another person’s work.', outcome: 'Live cursors and conflict-safe updates with optimistic feedback.', artifacts: ['Sync architecture', 'Concurrent edit examples'] },
  Thread: { context: 'Team knowledge product · full-stack build', problem: 'Decisions lost context and were difficult to discover later.', outcome: 'A searchable publishing workflow with explicit permissions.', artifacts: ['Permission matrix', 'Publishing flow'] },
  Pulse: { context: 'Platform team · systems owner', problem: 'Service metrics needed a dependable ingestion and alerting path.', outcome: 'A metrics pipeline connected to understandable dashboards and alerts.', artifacts: ['Ingestion architecture', 'Storage design', 'Alert runbook'] },
  Dockyard: { context: 'Internal platform · tooling lead', problem: 'Small teams needed deployments they could repeat and recover from.', outcome: 'Container templates with health checks and rollback tooling.', artifacts: ['Deployment flow', 'Rollback runbook'] },
  Switchboard: { context: 'Infrastructure product · backend lead', problem: 'Event delivery needed to tolerate retries without duplicate effects.', outcome: 'Delivery tracking, idempotency, and event replay.', artifacts: ['Event contract', 'Idempotency strategy', 'Replay walkthrough'] },
  Keystone: { context: 'Developer tooling · systems owner', problem: 'Schema changes needed clearer validation and rollout visibility.', outcome: 'Migration previews and audit logs with rollout checks.', artifacts: ['Migration workflow', 'Validation checklist'] },
};

export function projectEvidence(project: DeveloperProject): ProjectEvidence {
  return evidence[project.name] ?? { context: 'Sample project', problem: project.description, outcome: project.contribution, artifacts: ['Project walkthrough'] };
}
export function projectSlug(project: DeveloperProject) { return project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
export function compensation(person: Developer, type: Engagement | '' = '') {
  const details = hiringDetails[person.id];
  if (type === 'Co-founder') return 'Equity discussed together';
  if (type === 'Full-time' || (!type && !details.engagements.includes('Freelance'))) return `From $${(details.salaryUsd / 1000).toFixed(0)}k USD/year`;
  return `From $${details.hourlyUsd} USD/hour`;
}

export type FitFilters = { query: string; engagement: Engagement | ''; domain: string; maxBudget: string; minHours: string; startWeeks: string; overlap: string };
export const emptyFit: FitFilters = { query: '', engagement: '', domain: '', maxBudget: '', minHours: '', startWeeks: '', overlap: '' };
export const overlapWindows: Record<string, readonly [number, number]> = { Europe: [9, 17], Americas: [14, 22], Asia: [3, 11] };
export function overlapHours(a: readonly [number, number], b: readonly [number, number]) { return Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0])); }
export function hasFitFilters(filters: FitFilters) { return Object.values(filters).some(Boolean); }
export function developerFit(person: Developer, filters: FitFilters) {
  const details = hiringDetails[person.id];
  const reasons: string[] = [];
  const text = [person.name, person.role, person.specialty, ...person.skills, ...details.domains, ...person.projects.flatMap(project => [project.name, project.kind, project.stack, project.contribution])].join(' ').toLowerCase();
  const terms = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.some(term => !text.includes(term))) return { matches: false, reasons };
  if (terms.length) reasons.push(`Work or skills matching “${filters.query.trim()}”`);
  if (filters.engagement && !details.engagements.includes(filters.engagement)) return { matches: false, reasons };
  if (filters.engagement) reasons.push(`Open to ${filters.engagement.toLowerCase()}`);
  if (filters.domain && !details.domains.includes(filters.domain)) return { matches: false, reasons };
  if (filters.domain) reasons.push(`${filters.domain} experience`);
  if (filters.maxBudget && filters.engagement && filters.engagement !== 'Co-founder') {
    const expectation = filters.engagement === 'Full-time' ? details.salaryUsd : details.hourlyUsd;
    if (expectation > Number(filters.maxBudget)) return { matches: false, reasons };
    reasons.push('Within your stated budget');
  }
  if (filters.minHours && details.hoursPerWeek < Number(filters.minHours)) return { matches: false, reasons };
  if (filters.startWeeks && details.startWeeks > Number(filters.startWeeks)) return { matches: false, reasons };
  if (filters.startWeeks) reasons.push(details.startWeeks === 0 ? 'Available now' : `Can start in ${details.startWeeks} weeks`);
  if (filters.overlap && overlapWindows[filters.overlap]) {
    const hours = overlapHours(details.utcHours, overlapWindows[filters.overlap]);
    if (hours < 4) return { matches: false, reasons };
    reasons.push(`${hours}h overlap with your selected window`);
  }
  return { matches: true, reasons };
}
