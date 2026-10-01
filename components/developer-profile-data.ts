import { sampleReviews, type DeveloperReview } from './developer-review-data';

export const developerCategories = ['Frontend', 'Full-stack', 'Backend'] as const;
export type DeveloperCategory = (typeof developerCategories)[number];
export const developerCategoryThemes = {
  Frontend: 'sage',
  'Full-stack': 'coral',
  Backend: 'lavender',
} as const satisfies Record<DeveloperCategory, string>;

export type DeveloperProject = {
  name: string;
  kind: string;
  stack: string;
  description: string;
  contribution: string;
  color: string;
  image?: { src: string; alt: string; sampleTile?: number };
};
export type Developer = {
  id: string;
  joinedAt: string;
  reviews: DeveloperReview[];
  name: string;
  handle: string;
  avatar: string;
  isOnline: boolean;
  role: string;
  category: DeveloperCategory;
  location: string;
  experience: string;
  availability: string;
  start: string;
  timezone: string;
  workStyle: string;
  specialty: string;
  strengths: string[];
  skills: string[];
  bio: string;
  theme: string;
  projects: DeveloperProject[];
};

// Mock screenshots share a six-panel image. Real project uploads use a standalone
// image src and alt, omitting sampleTile.
const projectImages = {
  workspace: { src: '/images/projects/sample-projects.png', alt: 'Project workspace screenshot', sampleTile: 0 },
  design: { src: '/images/projects/sample-projects.png', alt: 'Design system screenshot', sampleTile: 1 },
  travel: { src: '/images/projects/sample-projects.png', alt: 'Travel planning screenshot', sampleTile: 2 },
  systems: { src: '/images/projects/sample-projects.png', alt: 'Service monitoring screenshot', sampleTile: 3 },
  community: { src: '/images/projects/sample-projects.png', alt: 'Community and calendar screenshot', sampleTile: 4 },
  reading: { src: '/images/projects/sample-projects.png', alt: 'Reading and research screenshot', sampleTile: 5 },
};

export const developers: Developer[] = [
  {
    id: 'alex-morgan', joinedAt: '2026-01-12', reviews: sampleReviews['alex-morgan'],
    name: 'Alex Morgan', isOnline: true, handle: 'alexmorgan', avatar: '/images/avatars/alex.svg', role: 'Frontend developer', category: 'Frontend', location: 'London, UK', experience: '5 years', availability: 'Open to full-time', start: 'In 2 weeks', timezone: 'UK / Europe overlap', workStyle: 'Remote or hybrid', specialty: 'Design systems', strengths: ['Accessible by default', 'Product-minded'], skills: ['React', 'TypeScript', 'Accessibility'], bio: 'I turn complex workflows into interfaces people can actually enjoy.', theme: 'sage',
    projects: [
      { name: 'Orbit', image: projectImages.workspace, kind: 'Workspace', stack: 'React · TypeScript', description: 'A keyboard-first project workspace with real-time updates and a calm, focused interface.', contribution: 'Owned frontend architecture and an accessible component library.', color: 'sage' },
      { name: 'Forma UI', image: projectImages.design, kind: 'Design system', stack: 'Storybook · CSS', description: 'Reusable components with documented interaction states and accessible defaults.', contribution: 'Built the component library, documentation, and visual regression workflow.', color: 'violet' },
      { name: 'Wayfinder', image: projectImages.travel, kind: 'Travel planner', stack: 'Next.js · Maps', description: 'A responsive itinerary planner that works beautifully on smaller screens.', contribution: 'Designed and built the map interface and trip editor.', color: 'orange' },
      { name: 'Readwell', image: projectImages.reading, kind: 'Reading app', stack: 'React · PWA', description: 'An offline reading list with adjustable typography and a distraction-free reader.', contribution: 'Built offline support and personalized reading settings.', color: 'blue' },
    ],
  },
  {
    id: 'jamie-chen', joinedAt: '2026-02-08', reviews: sampleReviews['jamie-chen'],
    name: 'Jamie Chen', isOnline: true, handle: 'jamiebuilds', avatar: '/images/avatars/jamie.svg', role: 'Full-stack developer', category: 'Full-stack', location: 'Toronto, Canada', experience: '6 years', availability: 'Open to collaborations', start: 'This month', timezone: 'North America overlap', workStyle: 'Remote', specialty: 'Early-stage products', strengths: ['Idea to launch', 'End-to-end ownership'], skills: ['Next.js', 'Node.js', 'PostgreSQL'], bio: 'From the first sketch to the last API. I make the whole product work.', theme: 'coral',
    projects: [
      { name: 'Gather', image: projectImages.community, kind: 'Community', stack: 'Next.js · Postgres', description: 'A small-community platform with member profiles, events, and thoughtful onboarding.', contribution: 'Built the full product, from database schema to onboarding.', color: 'orange' },
      { name: 'Counter', image: projectImages.design, kind: 'Commerce', stack: 'Node.js · Stripe', description: 'A storefront and order workspace for independent sellers.', contribution: 'Implemented checkout, inventory, and the merchant dashboard.', color: 'sage' },
      { name: 'Open Hours', image: projectImages.community, kind: 'Scheduling', stack: 'React · Calendar API', description: 'A simple booking tool that respects time zones and working hours.', contribution: 'Built availability logic, calendar sync, and email reminders.', color: 'rose' },
    ],
  },
  {
    id: 'nadia-hassan', joinedAt: '2026-04-04', reviews: sampleReviews['nadia-hassan'],
    name: 'Nadia Hassan', isOnline: true, handle: 'nadiaengineers', avatar: '/images/avatars/nadia.svg', role: 'Backend developer', category: 'Backend', location: 'Berlin, Germany', experience: '4 years', availability: 'Open to freelance', start: 'Available now', timezone: 'Europe overlap', workStyle: 'Remote · 20–30h/week', specialty: 'Reliable APIs', strengths: ['Clear documentation', 'Observability first'], skills: ['Python', 'FastAPI', 'Redis'], bio: 'Reliable systems, thoughtful APIs, and fewer late-night alerts.', theme: 'lavender',
    projects: [
      { name: 'Relay', image: projectImages.systems, kind: 'Job queues', stack: 'Python · Redis', description: 'A background-job service with retries, scheduling, and a readable activity log.', contribution: 'Designed queue processing, retry policies, and monitoring.', color: 'violet' },
      { name: 'Beacon', image: projectImages.systems, kind: 'Monitoring', stack: 'FastAPI · Grafana', description: 'A service-health API with actionable signals instead of noisy alerts.', contribution: 'Built telemetry ingestion and service health reporting.', color: 'blue' },
      { name: 'Papertrail', image: projectImages.reading, kind: 'Developer tools', stack: 'Python · OpenAPI', description: 'Versioned API documentation generated from the application schema.', contribution: 'Created the documentation pipeline and integration examples.', color: 'sand' },
    ],
  },
  {
    id: 'sam-rivera', joinedAt: '2026-08-28', reviews: sampleReviews['sam-rivera'],
    name: 'Sam Rivera', isOnline: true, handle: 'samcreates', avatar: '/images/avatars/sam.svg', role: 'Creative developer', category: 'Frontend', location: 'Lisbon, Portugal', experience: '3 years', availability: 'Open to freelance', start: 'Available now', timezone: 'Europe / US overlap', workStyle: 'Remote · Project-based', specialty: 'Interactive experiences', strengths: ['Creative coding', 'Motion with purpose'], skills: ['React', 'WebGL', 'Motion'], bio: 'A little interaction can make a big difference. I build for that moment.', theme: 'sand',
    projects: [
      { name: 'Playground', image: projectImages.design, kind: 'Experiments', stack: 'WebGL · React', description: 'A collection of interactive visual experiments with reduced-motion alternatives.', contribution: 'Created the graphics, interactions, and responsive rendering.', color: 'orange' },
      { name: 'Frequency', image: projectImages.systems, kind: 'Audio experience', stack: 'Web Audio · Canvas', description: 'A browser-based audio experience that responds to the music.', contribution: 'Built audio analysis and accessible playback controls.', color: 'violet' },
      { name: 'Soft Space', image: projectImages.travel, kind: 'Brand website', stack: 'Next.js · Motion', description: 'An expressive studio website with tactile, playful interactions.', contribution: 'Translated the visual identity into a responsive experience.', color: 'rose' },
      { name: 'Afterimage', image: projectImages.reading, kind: 'Digital gallery', stack: 'Three.js · React', description: 'An immersive gallery with an equally considered standard browsing mode.', contribution: 'Built 3D navigation, image loading, and keyboard controls.', color: 'blue' },
    ],
  },
  {
    id: 'maya-patel', joinedAt: '2026-09-26', reviews: sampleReviews['maya-patel'],
    name: 'Maya Patel', isOnline: true, handle: 'mayamakes', avatar: '/images/avatars/maya.svg', role: 'Full-stack developer', category: 'Full-stack', location: 'Bengaluru, India', experience: '5 years', availability: 'Open to full-time', start: 'In 4 weeks', timezone: 'Asia / Europe overlap', workStyle: 'Remote', specialty: 'Collaborative products', strengths: ['Real-time features', 'Thoughtful UX'], skills: ['TypeScript', 'React', 'Go'], bio: 'Turning early ideas into useful products, one considered release at a time.', theme: 'rose',
    projects: [
      { name: 'Fieldnotes', image: projectImages.reading, kind: 'Research', stack: 'React · Go', description: 'A collaborative research notebook with shared collections and full-text search.', contribution: 'Built the editor, search service, and shared collections.', color: 'rose' },
      { name: 'Together', image: projectImages.workspace, kind: 'Collaboration', stack: 'WebSockets · React', description: 'A team planning board with live cursors and conflict-safe updates.', contribution: 'Implemented real-time sync and optimistic interactions.', color: 'sage' },
      { name: 'Thread', image: projectImages.community, kind: 'Team knowledge', stack: 'Go · PostgreSQL', description: 'A searchable home for team decisions and their context.', contribution: 'Built permissions, search, and the publishing workflow.', color: 'sand' },
    ],
  },
  {
    id: 'leo-martins', joinedAt: '2026-05-15', reviews: sampleReviews['leo-martins'],
    name: 'Leo Martins', isOnline: true, handle: 'leosystems', avatar: '/images/avatars/leo.svg', role: 'Backend developer', category: 'Backend', location: 'São Paulo, Brazil', experience: '7 years', availability: 'Open to collaborations', start: 'This month', timezone: 'Americas overlap', workStyle: 'Remote', specialty: 'Platform engineering', strengths: ['Infrastructure as code', 'Developer experience'], skills: ['Go', 'PostgreSQL', 'Docker'], bio: 'Building the quiet infrastructure that lets good ideas scale.', theme: 'slate',
    projects: [
      { name: 'Pulse', image: projectImages.systems, kind: 'Observability', stack: 'Go · PostgreSQL', description: 'Service metrics turned into clear dashboards and useful alerts.', contribution: 'Designed ingestion, storage, and the alerting service.', color: 'blue' },
      { name: 'Dockyard', image: projectImages.systems, kind: 'Deployment', stack: 'Docker · Go', description: 'A repeatable deployment workflow for small engineering teams.', contribution: 'Built container templates, health checks, and rollback tools.', color: 'sand' },
      { name: 'Switchboard', image: projectImages.systems, kind: 'Event routing', stack: 'Go · Redis', description: 'A reliable event router with delivery tracking and replay.', contribution: 'Implemented idempotent delivery and event replay.', color: 'violet' },
      { name: 'Keystone', image: projectImages.workspace, kind: 'Data tools', stack: 'SQL · Go', description: 'Database migration tooling with clear previews and audit logs.', contribution: 'Built migration validation and safe rollout workflows.', color: 'sage' },
    ],
  },
];
