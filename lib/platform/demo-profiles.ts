import fixtures from "@/scripts/data/demo-developers.json";
// Reserved handles for the explicitly seeded demo accounts. Never applied to real members.
export function demoProfile(handle: string) {
  return fixtures.find((person) => person.handle === handle) || null;
}
export function isDemoProfile(handle: string) {
  return !!demoProfile(handle);
}
export const demoHandles = fixtures.map((person) => person.handle);
