export type ReviewScore = 1 | 2 | 3 | 4 | 5;
export type DeveloperReview = {
  id: string;
  clientId: string;
  source: 'sample';
  reply?: string;
  client: string;
  avatar: string;
  company: string;
  project: string;
  date: string;
  feedback: string;
  scores: { quality: ReviewScore; communication: ReviewScore; reliability: ReviewScore };
};

// Fictional feedback for the landing-page prototype, not verified endorsements.
export const sampleReviews: Record<string, DeveloperReview[]> = {
  'alex-morgan': [
    { id: 'alex-orbit', reply: 'Thank you, Elena. The sessions with your support team helped us decide which keyboard flows mattered most.', clientId: 'elena-brooks', source: 'sample', client: 'Elena Brooks', avatar: '/images/avatars/clients/client-5.svg', company: 'Orbit Studio', project: 'Orbit', date: '2026-09-20', feedback: 'Alex made our busiest workflow feel effortless. The keyboard navigation and thoughtful handover made a real difference to our team.', scores: { quality: 5, communication: 5, reliability: 5 } },
    { id: 'alex-forma', clientId: 'owen-park', source: 'sample', client: 'Owen Park', avatar: '/images/avatars/clients/client-10.svg', company: 'Forma Labs', project: 'Forma UI', date: '2026-08-14', feedback: 'A component library we could actually maintain. Clear documentation, sensible defaults, and careful attention to accessibility.', scores: { quality: 5, communication: 5, reliability: 4 } },
    { id: 'alex-wayfinder', clientId: 'priya-wells', source: 'sample', client: 'Priya Wells', avatar: '/images/avatars/clients/client-11.svg', company: 'Wayfinder Travel', project: 'Wayfinder', date: '2026-07-02', feedback: 'The trip editor works beautifully on phones. A few milestones shifted, but Alex kept us informed and delivered a polished result.', scores: { quality: 5, communication: 5, reliability: 4 } },
    { id: 'alex-readwell', clientId: 'ben-taylor', source: 'sample', client: 'Ben Taylor', avatar: '/images/avatars/clients/client-3.svg', company: 'Readwell', project: 'Readwell', date: '2026-05-18', feedback: 'Reliable delivery and a reading experience that feels calm and fast. We would happily work together again.', scores: { quality: 5, communication: 5, reliability: 5 } },
    { id: 'alex-orbit-refresh', clientId: 'elena-brooks', source: 'sample', client: 'Elena Brooks', avatar: '/images/avatars/clients/client-5.svg', company: 'Orbit Studio', project: 'Orbit dashboard refresh', date: '2026-03-10', feedback: 'Alex listened closely to our support team and turned their feedback into practical improvements without adding complexity.', scores: { quality: 5, communication: 5, reliability: 4 } },
  ],
  'jamie-chen': [
    { id: 'jamie-gather', clientId: 'mina-foster', source: 'sample', client: 'Mina Foster', avatar: '/images/avatars/clients/client-8.svg', company: 'Gather Collective', project: 'Gather', date: '2026-09-12', feedback: 'Jamie connected the product details with the technical decisions. We launched a complete, usable first version with a clear path forward.', scores: { quality: 5, communication: 5, reliability: 4 } },
    { id: 'jamie-counter', clientId: 'theo-bennett', source: 'sample', client: 'Theo Bennett', avatar: '/images/avatars/clients/client-13.svg', company: 'Counter Goods', project: 'Counter', date: '2026-07-22', feedback: 'Checkout and inventory now work together reliably. We needed a little extra time for testing, and the final handover was thorough.', scores: { quality: 5, communication: 4, reliability: 4 } },
    { id: 'jamie-hours', clientId: 'lena-ortiz', source: 'sample', client: 'Lena Ortiz', avatar: '/images/avatars/clients/client-7.svg', company: 'Open Hours', project: 'Open Hours', date: '2026-06-08', feedback: 'Time zones were our biggest headache. Jamie handled the edge cases and explained the tradeoffs clearly throughout.', scores: { quality: 5, communication: 5, reliability: 5 } },
    { id: 'jamie-gather-events', clientId: 'mina-foster', source: 'sample', client: 'Mina Foster', avatar: '/images/avatars/clients/client-8.svg', company: 'Gather Collective', project: 'Gather events', date: '2026-04-19', feedback: 'A useful addition to the platform. Communication was steady and feedback was incorporated quickly.', scores: { quality: 4, communication: 5, reliability: 4 } },
  ],
  'nadia-hassan': [
    { id: 'nadia-beacon', clientId: 'daniel-kim', source: 'sample', client: 'Daniel Kim', avatar: '/images/avatars/clients/client-4.svg', company: 'Beacon Systems', project: 'Beacon', date: '2026-09-24', feedback: 'Nadia gave us useful alerts instead of more noise. The service is easy to understand, and the operational documentation is excellent.', scores: { quality: 5, communication: 5, reliability: 5 } },
    { id: 'nadia-relay', clientId: 'sofia-reed', source: 'sample', client: 'Sofia Reed', avatar: '/images/avatars/clients/client-12.svg', company: 'Relay Works', project: 'Relay', date: '2026-08-03', feedback: 'Careful engineering and a dependable delivery. Nadia helped us spot failure modes we had not considered.', scores: { quality: 5, communication: 4, reliability: 5 } },
    { id: 'nadia-papertrail', clientId: 'amir-cole', source: 'sample', client: 'Amir Cole', avatar: '/images/avatars/clients/client-2.svg', company: 'Papertrail Tools', project: 'Papertrail', date: '2026-06-17', feedback: 'The API examples made onboarding much easier. Everything was delivered with clear tests and a thoughtful walkthrough.', scores: { quality: 5, communication: 5, reliability: 5 } },
  ],
  'sam-rivera': [
    { id: 'sam-softspace', clientId: 'iris-shaw', source: 'sample', client: 'Iris Shaw', avatar: '/images/avatars/clients/client-6.svg', company: 'Soft Space Studio', project: 'Soft Space', date: '2026-09-18', feedback: 'Sam captured the personality of our studio without sacrificing usability. The small interactions make the site feel like us.', scores: { quality: 5, communication: 5, reliability: 5 } },
  ],
  'maya-patel': [],
  'leo-martins': [
    { id: 'leo-dockyard', clientId: 'noah-ellis', source: 'sample', client: 'Noah Ellis', avatar: '/images/avatars/clients/client-9.svg', company: 'Dockyard Labs', project: 'Dockyard', date: '2026-09-05', feedback: 'Deployments are much easier to repeat and recover now. Leo documented the process so our team can own it confidently.', scores: { quality: 5, communication: 4, reliability: 5 } },
    { id: 'leo-pulse', clientId: 'ada-morgan', source: 'sample', client: 'Ada Morgan', avatar: '/images/avatars/clients/client-1.svg', company: 'Pulse Engineering', project: 'Pulse', date: '2026-07-11', feedback: 'A solid monitoring foundation. We worked through a few reporting changes together and ended up with a useful, maintainable system.', scores: { quality: 4, communication: 4, reliability: 5 } },
  ],
};
