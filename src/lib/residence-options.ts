/** Tower numbers available in SCW Villaments (6–16). */
export const TOWER_OPTIONS = Array.from({ length: 11 }, (_, index) => String(6 + index));

/** Villament unit numbers per floor plan. */
export const VILLAMENT_NUMBER_OPTIONS = [
  '101',
  '102',
  '103',
  '104',
  '201',
  '202',
  '203',
  '204',
  '301',
  '302',
  '303',
  '304',
] as const;

export type TowerOption = (typeof TOWER_OPTIONS)[number];
export type VillamentNumberOption = (typeof VILLAMENT_NUMBER_OPTIONS)[number];

export function formatResidenceLabel(tower: string, villamentNumber: string) {
  if (!tower || !villamentNumber) return '';
  return `Tower ${tower} · ${villamentNumber}`;
}

export function formatResidenceFlatNumber(tower: string, villamentNumber: string) {
  if (!tower || !villamentNumber) return '';
  return `${tower}-${villamentNumber}`;
}

export function hasCompleteResidence(tower?: string, villamentNumber?: string) {
  return Boolean(tower?.trim() && villamentNumber?.trim());
}

export function isValidTower(value: string) {
  return TOWER_OPTIONS.includes(value);
}

export function isValidVillamentNumber(value: string) {
  return (VILLAMENT_NUMBER_OPTIONS as readonly string[]).includes(value);
}
