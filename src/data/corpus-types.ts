export type CorpusVerse = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  featureIds?: string[];
  domains?: string[];
  studyUrl: string;
};
