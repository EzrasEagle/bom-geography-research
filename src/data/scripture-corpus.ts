/**
 * Working corpus for Reader + word index.
 * Full chapters added progressively (Omni 1 complete). Official study links for modern edition.
 */

import type { CorpusVerse } from "./corpus-types";
import { OMNI_1 } from "./chapters/omni-1";
import { ALMA_SIDON } from "./chapters/alma-sidon";

export type { CorpusVerse } from "./corpus-types";

function url(bookPath: string, chapter: number, verse?: number) {
  const anchor = verse ? `&id=p${verse}#p${verse}` : "";
  return `https://www.churchofjesuschrist.org/study/scriptures/bofm/${bookPath}/${chapter}?lang=eng${anchor}`;
}

/** Seed corpus — expand continuously while indexing models */
export const corpus: CorpusVerse[] = [
  ...OMNI_1,
  ...ALMA_SIDON,
  // Landing / climate
  {
    id: "1ne-18-23",
    book: "1 Nephi",
    chapter: 18,
    verse: 23,
    text: "And it came to pass that after we had sailed for the space of many days we did arrive at the promised land; and we went forth upon the land, and did pitch our tents; and we did call it the promised land.",
    featureIds: ["landing"],
    domains: ["textual_geography"],
    studyUrl: url("1-ne", 18, 23),
  },
  {
    id: "1ne-18-24",
    book: "1 Nephi",
    chapter: 18,
    verse: 24,
    text: "And it came to pass that we did begin to till the earth, and we began to plant seeds; yea, we did put all our seeds into the earth, which we had brought from the land of Jerusalem. And it came to pass that they did grow exceedingly; wherefore, we were blessed in abundance.",
    featureIds: ["landing", "climate-agriculture"],
    domains: ["climate_botany"],
    studyUrl: url("1-ne", 18, 24),
  },
  {
    id: "1ne-18-25",
    book: "1 Nephi",
    chapter: 18,
    verse: 25,
    text: "And it came to pass that we did find upon the land of promise, as we journeyed in the wilderness, that there were beasts in the forests of every kind… and we did find all manner of ore, both of gold, and of silver, and of copper.",
    featureIds: ["landing"],
    domains: ["textual_geography"],
    studyUrl: url("1-ne", 18, 25),
  },
  {
    id: "1ne-17-5",
    book: "1 Nephi",
    chapter: 17,
    verse: 5,
    text: "And we did come to the land which we called Bountiful, because of its much fruit and also wild honey; and all these things were prepared of the Lord that we might not perish…",
    featureIds: [],
    domains: ["climate_botany"],
    studyUrl: url("1-ne", 17, 5),
  },
  // Zarahemla / Nephi
  
  
  {
    id: "mosiah-7-1",
    book: "Mosiah",
    chapter: 7,
    verse: 1,
    text: "…king Mosiah granted that sixteen of their strong men might go up to the land of Lehi-Nephi, to inquire concerning their brethren…",
    featureIds: ["nephi", "zarahemla"],
    domains: ["textual_geography"],
    studyUrl: url("mosiah", 7, 1),
  },
  {
    id: "alma-2-15",
    book: "Alma",
    chapter: 2,
    verse: 15,
    text: "And it came to pass that the Amlicites came upon the hill Amnihu, which was east of the river Sidon, which ran by the land of Zarahemla, and there they began to make war with the Nephites.",
    featureIds: ["sidon", "zarahemla"],
    domains: ["textual_geography"],
    studyUrl: url("alma", 2, 15),
  },
  // Alma 22 spine
  {
    id: "alma-22-27",
    book: "Alma",
    chapter: 22,
    verse: 27,
    text: "And it came to pass that the king sent a proclamation throughout all the land… and which was bordered by the wilderness which was full of the Lamanites… and which ran from the sea east even to the sea west…",
    featureIds: ["sea-east", "sea-west", "nephi", "sidon"],
    domains: ["textual_geography"],
    studyUrl: url("alma", 22, 27),
  },
  {
    id: "alma-22-32",
    book: "Alma",
    chapter: 22,
    verse: 32,
    text: "And now, it was only the distance of a day and a half’s journey for a Nephite, on the line Bountiful and the land Desolation, from the east to the west sea; and thus the land of Nephi and the land of Zarahemla were nearly surrounded by water, there being a small neck of land between the land northward and the land southward.",
    featureIds: ["narrow-neck", "bountiful-nw", "desolation", "sea-east", "sea-west", "zarahemla", "nephi"],
    domains: ["textual_geography"],
    studyUrl: url("alma", 22, 32),
  },
  {
    id: "alma-27-22",
    book: "Alma",
    chapter: 27,
    verse: 22,
    text: "And it came to pass that the voice of the people came, saying: Behold, we will give up the land of Jershon, which is on the east by the sea…",
    featureIds: ["jershon", "sea-east"],
    domains: ["textual_geography"],
    studyUrl: url("alma", 27, 22),
  },
  {
    id: "alma-50-34",
    book: "Alma",
    chapter: 50,
    verse: 34,
    text: "And it came to pass that they did not head them until they had come to the borders of the land Desolation; and there they did head them, by the narrow pass which led by the sea into the land northward…",
    featureIds: ["desolation", "narrow-neck", "sea-east", "sea-west"],
    domains: ["textual_geography"],
    studyUrl: url("alma", 50, 34),
  },
  // Climate / weather / seasons
  {
    id: "3ne-8-5",
    book: "3 Nephi",
    chapter: 8,
    verse: 5,
    text: "And it came to pass in the thirty and fourth year, in the first month, on the fourth day of the month, there arose a great storm, such an one as never had been known in all the land.",
    featureIds: ["climate-storms", "climate-whirlwind"],
    domains: ["climate_botany"],
    studyUrl: url("3-ne", 8, 5),
  },
  {
    id: "3ne-8-6",
    book: "3 Nephi",
    chapter: 8,
    verse: 6,
    text: "And there was also a great and terrible tempest; and there was terrible thunder… and the city of Zarahemla did take fire.",
    featureIds: ["climate-storms", "zarahemla", "climate-whirlwind"],
    domains: ["climate_botany"],
    studyUrl: url("3-ne", 8, 6),
  },
  {
    id: "3ne-8-12",
    book: "3 Nephi",
    chapter: 8,
    verse: 12,
    text: "…and there were some who were carried away in the whirlwind; and whither they went no man knoweth…",
    featureIds: ["climate-whirlwind"],
    domains: ["climate_botany"],
    studyUrl: url("3-ne", 8, 12),
  },
  {
    id: "3ne-8-16",
    book: "3 Nephi",
    chapter: 8,
    verse: 16,
    text: "And there were some who were carried away in the whirlwind…",
    featureIds: ["climate-whirlwind"],
    domains: ["climate_botany"],
    studyUrl: url("3-ne", 8, 16),
  },
  {
    id: "hel-5-12",
    book: "Helaman",
    chapter: 5,
    verse: 12,
    text: "…when the devil shall send forth his mighty winds, yea, his shafts in the whirlwind…",
    featureIds: ["climate-whirlwind"],
    domains: ["climate_botany"],
    studyUrl: url("hel", 5, 12),
  },
  {
    id: "alma-46-40",
    book: "Alma",
    chapter: 46,
    verse: 40,
    text: "And there were some who died with fevers, which at some seasons of the year were very frequent in the land…",
    featureIds: ["climate-seasons", "climate-agriculture"],
    domains: ["climate_botany"],
    studyUrl: url("alma", 46, 40),
  },
  {
    id: "alma-53-7",
    book: "Alma",
    chapter: 53,
    verse: 7,
    text: "…he returned to the city of Zarahemla… and also preparing for war… and also delivering their women and their children from famine and affliction…",
    featureIds: ["zarahemla", "climate-agriculture"],
    domains: ["climate_botany"],
    studyUrl: url("alma", 53, 7),
  },
  // Crops / grain
  {
    id: "mosiah-7-22",
    book: "Mosiah",
    chapter: 7,
    verse: 22,
    text: "And all this he did, for the sole purpose of bringing this people into subjection… and one half of their grain…",
    featureIds: ["climate-agriculture", "nephi"],
    domains: ["climate_botany"],
    studyUrl: url("mosiah", 7, 22),
  },
  {
    id: "enos-1-21",
    book: "Enos",
    chapter: 1,
    verse: 21,
    text: "And it came to pass that the people of Nephi did till the land, and raise all manner of grain, and of fruit…",
    featureIds: ["nephi", "climate-agriculture"],
    domains: ["climate_botany"],
    studyUrl: url("enos", 1, 21),
  },
  // Cumorah
  {
    id: "morm-6-2",
    book: "Mormon",
    chapter: 6,
    verse: 2,
    text: "And I, Mormon, wrote an epistle unto the king of the Lamanites, and desired of him that he would grant unto us that we might gather together our people unto the land of Cumorah, by a hill which was called Cumorah, and there we could give them battle.",
    featureIds: ["cumorah"],
    domains: ["textual_geography"],
    studyUrl: url("morm", 6, 2),
  },
  {
    id: "morm-6-4",
    book: "Mormon",
    chapter: 6,
    verse: 4,
    text: "And it came to pass that we did march forth to the land of Cumorah, and we did pitch our tents around about the hill Cumorah; and it was in a land of many waters, rivers, and fountains…",
    featureIds: ["cumorah", "desolation"],
    domains: ["textual_geography", "hydrology_topo"],
    studyUrl: url("morm", 6, 4),
  },
  {
    id: "ether-15-11",
    book: "Ether",
    chapter: 15,
    verse: 11,
    text: "And it came to pass that the army of Coriantumr did pitch their tents by the hill Ramah; and it was that same hill where my father Mormon did hide up the records unto the Lord, which were sacred.",
    featureIds: ["cumorah"],
    domains: ["textual_geography"],
    studyUrl: url("ether", 15, 11),
  },
  // Seasons / war timing (examples often debated)
  {
    id: "alma-16-1",
    book: "Alma",
    chapter: 16,
    verse: 1,
    text: "…in the eleventh year of the reign of the judges… there was a cry of war heard throughout the land.",
    featureIds: ["climate-seasons"],
    domains: ["textual_geography"],
    studyUrl: url("alma", 16, 1),
  },
  {
    id: "alma-43-4",
    book: "Alma",
    chapter: 43,
    verse: 4,
    text: "For behold, it came to pass that the Zoramites became Lamanites; therefore, in the commencement of the eighteenth year… the Nephites saw that the Lamanites were coming upon them…",
    featureIds: ["sidon", "climate-seasons"],
    domains: ["textual_geography"],
    studyUrl: url("alma", 43, 4),
  },
  {
    id: "hel-3-8",
    book: "Helaman",
    chapter: 3,
    verse: 8,
    text: "And it came to pass that they did multiply and spread… from the sea west to the sea east.",
    featureIds: ["sea-west", "sea-east"],
    domains: ["textual_geography"],
    studyUrl: url("hel", 3, 8),
  },
  {
    id: "hel-3-10",
    book: "Helaman",
    chapter: 3,
    verse: 10,
    text: "And it came to pass as timber was exceedingly scarce in the land northward, they did send forth much by the way of shipping.",
    featureIds: ["desolation", "climate-agriculture"],
    domains: ["climate_botany", "textual_geography"],
    studyUrl: url("hel", 3, 10),
  },
];

export function booksInCorpus(): string[] {
  return [...new Set(corpus.map((c) => c.book))];
}

export function chaptersForBook(book: string): number[] {
  return [...new Set(corpus.filter((c) => c.book === book).map((c) => c.chapter))].sort(
    (a, b) => a - b,
  );
}

export function versesFor(book: string, chapter: number): CorpusVerse[] {
  return corpus
    .filter((c) => c.book === book && c.chapter === chapter)
    .sort((a, b) => a.verse - b.verse);
}

export function searchWord(word: string): CorpusVerse[] {
  const q = word.trim().toLowerCase();
  if (!q) return [];
  return corpus.filter((c) => c.text.toLowerCase().includes(q));
}

export function versesForFeature(featureId: string): CorpusVerse[] {
  return corpus.filter((c) => c.featureIds?.includes(featureId));
}

export function getCorpusVerse(book: string, chapter: number, verse: number) {
  return corpus.find((c) => c.book === book && c.chapter === chapter && c.verse === verse);
}
