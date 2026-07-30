/**
 * Time layer for associations & places.
 * Default anchors: approximate years from common LDS chapter-heading style estimates
 * (not doctrine — user-adjustable; models may disagree on absolute chronology).
 */

export type ChronologyQuality = "heading" | "stated" | "approximate" | "unknown" | "relative";

export type ChronologySpan = {
  /** Inclusive start year; negative = BC (e.g. -200 = 200 BC) */
  startYear?: number;
  endYear?: number;
  label?: string;
  quality: ChronologyQuality;
  note?: string;
  /** Chapter heading or verse that licenses the date */
  source?: string;
};

/** Rough book/chapter → year window (seed; expand while reading) */
export const CHAPTER_CHRONOLOGY: {
  book: string;
  chapter: number;
  span: ChronologySpan;
}[] = [
  { book: "1 Nephi", chapter: 18, span: { startYear: -591, endYear: -589, label: "~600–590 BC voyage/landing", quality: "heading", source: "1 Nephi chapter headings (approx.)" } },
  { book: "2 Nephi", chapter: 5, span: { startYear: -588, endYear: -545, label: "Nephi colony / separation", quality: "heading", source: "2 Nephi 5 heading context" } },
  { book: "Omni", chapter: 1, span: { startYear: -323, endYear: -130, label: "Omni → Mosiah finds Zarahemla era", quality: "approximate", source: "Omni / Mosiah bridge (wide)" } },
  { book: "Mosiah", chapter: 7, span: { startYear: -121, endYear: -121, label: "~121 BC", quality: "heading", source: "Mosiah 7 heading style" } },
  { book: "Mosiah", chapter: 8, span: { startYear: -121, endYear: -121, label: "~121 BC", quality: "heading", source: "Mosiah 8" } },
  { book: "Alma", chapter: 2, span: { startYear: -87, endYear: -87, label: "~87 BC Amlicite war", quality: "heading", source: "Alma 2" } },
  { book: "Alma", chapter: 8, span: { startYear: -82, endYear: -82, label: "~82 BC", quality: "heading", source: "Alma 8" } },
  { book: "Alma", chapter: 16, span: { startYear: -81, endYear: -78, label: "~81–78 BC", quality: "heading", source: "Alma 16" } },
  { book: "Alma", chapter: 22, span: { startYear: -90, endYear: -77, label: "Aaron / Lamanite conversion era (approx.)", quality: "approximate", source: "Alma 22 region" } },
  { book: "Alma", chapter: 43, span: { startYear: -74, endYear: -74, label: "~74 BC Zerahemnah", quality: "heading", source: "Alma 43" } },
  { book: "Alma", chapter: 50, span: { startYear: -72, endYear: -67, label: "~72–67 BC fortifications / east sea", quality: "heading", source: "Alma 50" } },
  { book: "Alma", chapter: 51, span: { startYear: -67, endYear: -67, label: "~67 BC", quality: "heading", source: "Alma 51" } },
  { book: "Alma", chapter: 52, span: { startYear: -66, endYear: -66, label: "~66 BC", quality: "heading", source: "Alma 52" } },
  { book: "Alma", chapter: 56, span: { startYear: -66, endYear: -63, label: "~66–63 BC Helaman / Antipus", quality: "heading", source: "Alma 56" } },
  { book: "Alma", chapter: 62, span: { startYear: -60, endYear: -57, label: "~60–57 BC", quality: "heading", source: "Alma 62" } },
  { book: "Alma", chapter: 63, span: { startYear: -55, endYear: -53, label: "~55–53 BC Hagoth", quality: "heading", source: "Alma 63" } },
  { book: "Helaman", chapter: 3, span: { startYear: -46, endYear: -39, label: "~46–39 BC northward migration", quality: "heading", source: "Helaman 3" } },
  { book: "3 Nephi", chapter: 8, span: { startYear: 34, endYear: 34, label: "~AD 34 destruction", quality: "heading", source: "3 Nephi 8" } },
  { book: "Mormon", chapter: 6, span: { startYear: 385, endYear: 385, label: "~AD 385 Cumorah", quality: "heading", source: "Mormon 6" } },
];

export function chronologyForChapter(
  book: string,
  chapter: number,
): ChronologySpan | null {
  const hit = CHAPTER_CHRONOLOGY.find(
    (c) => c.book === book && c.chapter === chapter,
  );
  return hit?.span ?? null;
}

export function formatYear(y?: number): string {
  if (y == null) return "?";
  if (y < 0) return `${Math.abs(y)} BC`;
  if (y === 0) return "AD 1 (approx.)";
  return `AD ${y}`;
}

export function formatChronologySpan(s: ChronologySpan): string {
  if (s.label) return s.label;
  if (s.startYear != null && s.endYear != null) {
    if (s.startYear === s.endYear) return formatYear(s.startYear);
    return `${formatYear(s.startYear)} – ${formatYear(s.endYear)}`;
  }
  if (s.startYear != null) return `from ${formatYear(s.startYear)}`;
  return "date unknown";
}

/** Empty span for associations */
export function unknownChronology(): ChronologySpan {
  return { quality: "unknown" };
}
