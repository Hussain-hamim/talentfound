'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { engagements, hiringDetails, overlapWindows, emptyFit, hasFitFilters, type FitFilters, type Engagement } from './developer-hiring-data';
const domains = [...new Set(Object.values(hiringDetails).flatMap(item => item.domains))].sort();
export function DeveloperFitControls({ value, onChange }: { value: FitFilters; onChange: (value: FitFilters) => void }) {
  function update(key: keyof FitFilters, next: string) { onChange({ ...value, [key]: next }); }
  const count = Object.values(value).filter(Boolean).length;
  return <div className="hiring-fit-controls">
    <label className="hiring-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search skills, work, or developer name</span><input type="search" value={value.query} onChange={event => update('query', event.target.value)} placeholder="Search skills, projects, or people…" /></label>
    <details className="hiring-filter-panel"><summary><SlidersHorizontal size={15} /> Find your fit {count > 0 && <span>({count})</span>}</summary>
      <div className="hiring-filter-fields">
        <label>Type of work<select value={value.engagement} onChange={event => onChange({ ...value, engagement: event.target.value as Engagement | '', maxBudget: '', minHours: '' })}><option value="">Any engagement</option>{engagements.map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Product experience<select value={value.domain} onChange={event => update('domain', event.target.value)}><option value="">Any domain</option>{domains.map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Start date<select value={value.startWeeks} onChange={event => update('startWeeks', event.target.value)}><option value="">Flexible</option><option value="0">Available now</option><option value="2">Within 2 weeks</option><option value="4">Within 4 weeks</option></select></label>
        <label>Working-hour overlap<select value={value.overlap} onChange={event => update('overlap', event.target.value)}><option value="">Any working hours</option>{Object.entries(overlapWindows).map(([region, hours]) => <option key={region} value={region}>{region} · {hours[0]}–{hours[1]} UTC</option>)}</select><small>At least 4 hours within the selected UTC window.</small></label>
        {value.engagement === 'Freelance' && <label>Weekly capacity<select value={value.minHours} onChange={event => update('minHours', event.target.value)}><option value="">Any capacity</option><option value="20">20+ hours</option><option value="30">30+ hours</option><option value="40">40 hours</option></select></label>}
        {value.engagement && value.engagement !== 'Co-founder' && <label>{value.engagement === 'Full-time' ? 'Maximum annual salary · USD' : 'Maximum hourly rate · USD'}<input type="number" min="1" step="1" inputMode="numeric" placeholder={value.engagement === 'Full-time' ? 'e.g. 120000' : 'e.g. 90'} value={value.maxBudget} onChange={event => update('maxBudget', event.target.value)} /><small>Compares the developer’s starting expectation.</small></label>}
      </div>
      {value.engagement === 'Co-founder' && <p className="hiring-help">Explore stage, commitment, and complementary strengths on each profile. Client ratings describe past delivery, not co-founder compatibility.</p>}
      <p className="hiring-help">All requirements combine. Ratings do not override fit, and online status does not affect results. Availability and budgets are illustrative.</p>
      {hasFitFilters(value) && <button type="button" className="hiring-text-link" onClick={() => onChange(emptyFit)}>Clear fit filters</button>}
    </details>
  </div>;
}
