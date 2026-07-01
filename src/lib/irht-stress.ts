/** Legacy stress helpers (0 = low stress, 1 = high stress) for popups and risk panel */

export function computeGroundwaterStress(depth?: number): number | null {
  if (depth == null || isNaN(depth)) return null;
  if (depth < 30) return 0.8;
  if (depth < 60) return 0.5;
  return 0.2;
}

export function computeYieldStress(yieldLpm?: number): number | null {
  if (yieldLpm == null || isNaN(yieldLpm)) return null;
  if (yieldLpm < 10) return 0.9;
  if (yieldLpm < 30) return 0.6;
  if (yieldLpm < 60) return 0.35;
  return 0.15;
}
