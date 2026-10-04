const pad = (n: number) => String(n).padStart(2, '0');

/** Heutiges Datum als YYYY-MM-DD in lokaler Zeit (nicht UTC). */
export const todayLocal = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Parst YYYY-MM-DD als lokales Datum (new Date('YYYY-MM-DD') wäre UTC). */
export const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** Saisonlabel zu einem Datum, z. B. "2025/2026". Eine Saison beginnt am 1. Oktober. */
export const getSeasonLabel = (dateStr: string): string => {
  const [year, month] = dateStr.split('-').map(Number);
  return month >= 10 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
};
