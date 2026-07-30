/**
 * Pass B — Internal geography passages (harvest toward ~500)
 *
 * Each row = one passage that states or implies geographic fact.
 * Real-world pin optional; strength is textual.
 * Seed: high-signal spine + war geography + neck + Sidon graph (expandable).
 */

export type GeoPassage = {
  id: string;
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  /** What the text establishes */
  fact: string;
  features: string[];
  relation:
    | "location"
    | "direction"
    | "elevation"
    | "distance"
    | "adjacency"
    | "hydrology"
    | "coast"
    | "travel"
    | "boundary"
    | "political"
    | "other";
  strength: "hard" | "soft";
  /** Link to Pass A correspondence ids when externalized */
  passAIds?: string[];
};

export const MESO_PASS_B_META = {
  id: "mesoamerica-pass-b",
  modelId: "mesoamerica",
  title: "Pass B — Geography passages",
  target: 500,
  note: "Internal text facts first. Expand until near-exhaustive vs Mormon’s Map / Source Book apparatus.",
};

export const mesoGeoPassages: GeoPassage[] = [
  // Landing / Nephi founding
  { id: "gp-1ne-18-23", ref: "1 Nephi 18:23", book: "1 Nephi", chapter: 18, verse: 23, fact: "Arrived at promised land; went forth upon the land", features: ["landing"], relation: "location", strength: "hard" },
  { id: "gp-1ne-18-24", ref: "1 Nephi 18:24", book: "1 Nephi", chapter: 18, verse: 24, fact: "Tilled earth; seeds grew exceedingly", features: ["landing"], relation: "other", strength: "soft" },
  { id: "gp-1ne-18-25", ref: "1 Nephi 18:25", book: "1 Nephi", chapter: 18, verse: 25, fact: "Beasts in forests; ore of all kinds in the land", features: ["landing"], relation: "other", strength: "soft" },
  { id: "gp-2ne-5-7", ref: "2 Nephi 5:7", book: "2 Nephi", chapter: 5, verse: 7, fact: "Journeyed many days in the wilderness", features: ["landing", "nephi", "wilderness"], relation: "travel", strength: "soft" },
  { id: "gp-2ne-5-8", ref: "2 Nephi 5:8", book: "2 Nephi", chapter: 5, verse: 8, fact: "Called the name of the place Nephi", features: ["nephi"], relation: "location", strength: "hard" },
  // Omni spine
  { id: "gp-omni-12", ref: "Omni 1:12", book: "Omni", chapter: 1, verse: 12, fact: "Mosiah warned to flee out of land of Nephi", features: ["nephi"], relation: "political", strength: "hard" },
  { id: "gp-omni-13a", ref: "Omni 1:13", book: "Omni", chapter: 1, verse: 13, fact: "Departed into the wilderness", features: ["nephi", "wilderness"], relation: "travel", strength: "hard", passAIds: ["mc-map-16-wilderness-strip"] },
  { id: "gp-omni-13b", ref: "Omni 1:13", book: "Omni", chapter: 1, verse: 13, fact: "Came down into the land of Zarahemla", features: ["zarahemla", "wilderness"], relation: "elevation", strength: "hard", passAIds: ["mc-map-09-zarahemla-grijalva", "mc-map-07-nephi-highlands"] },
  { id: "gp-omni-14", ref: "Omni 1:14", book: "Omni", chapter: 1, verse: 14, fact: "Discovered a people called the people of Zarahemla", features: ["zarahemla"], relation: "location", strength: "hard" },
  { id: "gp-omni-16", ref: "Omni 1:16", book: "Omni", chapter: 1, verse: 16, fact: "People of Zarahemla came out from Jerusalem at captivity; brought no records", features: ["zarahemla"], relation: "other", strength: "soft" },
  { id: "gp-omni-20", ref: "Omni 1:20", book: "Omni", chapter: 1, verse: 20, fact: "Large stone with engravings; Coriantumr lived with people of Zarahemla", features: ["zarahemla", "desolation"], relation: "other", strength: "soft", passAIds: ["mc-map-18-desolation-north-neck"] },
  { id: "gp-omni-27", ref: "Omni 1:27", book: "Omni", chapter: 1, verse: 27, fact: "A number went up into the wilderness to return to land of Nephi", features: ["zarahemla", "wilderness", "nephi"], relation: "elevation", strength: "hard" },
  { id: "gp-omni-28", ref: "Omni 1:28", book: "Omni", chapter: 1, verse: 28, fact: "Contentions; majority slain; remnant returned to Zarahemla", features: ["nephi", "zarahemla"], relation: "travel", strength: "soft" },
  // Mosiah travel
  { id: "gp-mos-7-4", ref: "Mosiah 7:4", book: "Mosiah", chapter: 7, verse: 4, fact: "Wandered forty days in wilderness seeking land of Nephi", features: ["zarahemla", "nephi", "wilderness"], relation: "distance", strength: "hard", passAIds: ["mc-map-16-wilderness-strip"] },
  { id: "gp-mos-7-5", ref: "Mosiah 7:5", book: "Mosiah", chapter: 7, verse: 5, fact: "Pitched tents on hill north of land of Shilom", features: ["shilom", "nephi"], relation: "adjacency", strength: "hard" },
  { id: "gp-mos-8-7", ref: "Mosiah 8:7", book: "Mosiah", chapter: 8, verse: 7, fact: "Limhi sent 43 into wilderness to find Zarahemla", features: ["nephi", "zarahemla", "wilderness"], relation: "travel", strength: "hard" },
  { id: "gp-mos-8-8", ref: "Mosiah 8:8", book: "Mosiah", chapter: 8, verse: 8, fact: "Lost in wilderness; found land of many waters; bones; ruins", features: ["desolation", "wilderness"], relation: "location", strength: "hard", passAIds: ["mc-map-18-desolation-north-neck"] },
  { id: "gp-mos-8-9", ref: "Mosiah 8:9", book: "Mosiah", chapter: 8, verse: 9, fact: "Brought 24 gold plates", features: ["desolation"], relation: "other", strength: "soft" },
  { id: "gp-mos-21-25", ref: "Mosiah 21:25", book: "Mosiah", chapter: 21, verse: 25, fact: "Parallel lost expedition narrative", features: ["desolation", "nephi"], relation: "travel", strength: "hard" },
  { id: "gp-mos-22-11", ref: "Mosiah 22:11", book: "Mosiah", chapter: 22, verse: 11, fact: "Limhi people took wilderness course around land of Shilom/Shemlon by night", features: ["nephi", "shilom", "shemlon", "wilderness"], relation: "travel", strength: "hard" },
  { id: "gp-mos-22-13", ref: "Mosiah 22:13", book: "Mosiah", chapter: 22, verse: 13, fact: "Joined people of Zarahemla", features: ["zarahemla"], relation: "location", strength: "hard" },
  { id: "gp-mos-23-3", ref: "Mosiah 23:3", book: "Mosiah", chapter: 23, verse: 3, fact: "Fled eight days into wilderness", features: ["nephi", "helam", "wilderness"], relation: "distance", strength: "hard" },
  { id: "gp-mos-23-4", ref: "Mosiah 23:4", book: "Mosiah", chapter: 23, verse: 4, fact: "Land of pure water; called Helam", features: ["helam"], relation: "location", strength: "hard" },
  { id: "gp-mos-24-20", ref: "Mosiah 24:20", book: "Mosiah", chapter: 24, verse: 20, fact: "Pitched tents in valley of Alma after flight", features: ["helam", "wilderness"], relation: "travel", strength: "soft" },
  { id: "gp-mos-24-25", ref: "Mosiah 24:25", book: "Mosiah", chapter: 24, verse: 25, fact: "Arrived in Zarahemla after twelve days in wilderness", features: ["helam", "zarahemla", "wilderness"], relation: "distance", strength: "hard" },
  // Alma 2 / Sidon
  { id: "gp-alma-2-15", ref: "Alma 2:15", book: "Alma", chapter: 2, verse: 15, fact: "Battle on hill Amnihu east of river Sidon", features: ["sidon", "zarahemla"], relation: "hydrology", strength: "hard", passAIds: ["mc-map-12-alma2-microtopo", "mc-map-11-sidon-grijalva"] },
  { id: "gp-alma-2-17", ref: "Alma 2:17", book: "Alma", chapter: 2, verse: 17, fact: "Contended with Amlicites on hill east of Sidon", features: ["sidon"], relation: "direction", strength: "hard" },
  { id: "gp-alma-2-20", ref: "Alma 2:20", book: "Alma", chapter: 2, verse: 20, fact: "Pitched in valley of Gideon", features: ["gideon"], relation: "location", strength: "hard", passAIds: ["mc-map-13-gideon-east"] },
  { id: "gp-alma-2-34", ref: "Alma 2:34", book: "Alma", chapter: 2, verse: 34, fact: "Cleared the waters of Sidon; fled to wilderness of Hermounts", features: ["sidon"], relation: "hydrology", strength: "hard" },
  { id: "gp-alma-2-35", ref: "Alma 2:35", book: "Alma", chapter: 2, verse: 35, fact: "Bodies cast into waters of Sidon; carried to the sea", features: ["sidon", "sea-west"], relation: "hydrology", strength: "soft" },
  { id: "gp-alma-6-7", ref: "Alma 6:7", book: "Alma", chapter: 6, verse: 7, fact: "Valley of Gideon east of river Sidon", features: ["gideon", "sidon", "zarahemla"], relation: "direction", strength: "hard", passAIds: ["mc-map-13-gideon-east"] },
  { id: "gp-alma-8-3", ref: "Alma 8:3", book: "Alma", chapter: 8, verse: 3, fact: "Alma to Melek west of river Sidon", features: ["melek", "sidon"], relation: "direction", strength: "hard", passAIds: ["mc-map-14-melek-west"] },
  { id: "gp-alma-8-6", ref: "Alma 8:6", book: "Alma", chapter: 8, verse: 6, fact: "Three days journey on north of Melek to Ammonihah", features: ["melek", "ammonihah"], relation: "distance", strength: "hard" },
  { id: "gp-alma-16-6", ref: "Alma 16:6", book: "Alma", chapter: 16, verse: 6, fact: "Lamanites beyond borders of Manti in south wilderness by head of Sidon", features: ["manti", "sidon", "wilderness"], relation: "hydrology", strength: "hard", passAIds: ["mc-map-15-manti-head-sidon"] },
  { id: "gp-alma-16-7", ref: "Alma 16:7", book: "Alma", chapter: 16, verse: 7, fact: "Zoram crossed Sidon with armies; marched beyond borders of Manti", features: ["sidon", "manti"], relation: "travel", strength: "hard" },
  // Alma 22 block
  { id: "gp-alma-22-27a", ref: "Alma 22:27", book: "Alma", chapter: 22, verse: 27, fact: "King’s land divided from east to west sea", features: ["sea-east", "sea-west", "nephi"], relation: "coast", strength: "hard", passAIds: ["mc-map-03-sea-west", "mc-map-04-sea-east"] },
  { id: "gp-alma-22-27b", ref: "Alma 22:27", book: "Alma", chapter: 22, verse: 27, fact: "Narrow strip of wilderness from east to west sea", features: ["wilderness", "sea-east", "sea-west"], relation: "boundary", strength: "hard", passAIds: ["mc-map-16-wilderness-strip"] },
  { id: "gp-alma-22-27c", ref: "Alma 22:27", book: "Alma", chapter: 22, verse: 27, fact: "Wilderness borders ran by head of river Sidon", features: ["sidon", "wilderness", "manti"], relation: "hydrology", strength: "hard" },
  { id: "gp-alma-22-28", ref: "Alma 22:28", book: "Alma", chapter: 22, verse: 28, fact: "Lamanites more numerous in wilderness west/east by seashore; also in south", features: ["wilderness", "sea-west", "sea-east"], relation: "coast", strength: "soft" },
  { id: "gp-alma-22-29", ref: "Alma 22:29", book: "Alma", chapter: 22, verse: 29, fact: "Nephites possessed land northward of narrow strip; even to land northward", features: ["bountiful-nw", "zarahemla"], relation: "direction", strength: "hard" },
  { id: "gp-alma-22-30", ref: "Alma 22:30", book: "Alma", chapter: 22, verse: 30, fact: "Land of Desolation so far northward; bones; discovered by people of Zarahemla", features: ["desolation"], relation: "location", strength: "hard", passAIds: ["mc-map-18-desolation-north-neck"] },
  { id: "gp-alma-22-31", ref: "Alma 22:31", book: "Alma", chapter: 22, verse: 31, fact: "Land on south was called Bountiful; land on north Desolation", features: ["bountiful-nw", "desolation"], relation: "direction", strength: "hard", passAIds: ["mc-map-17-bountiful-south-neck"] },
  { id: "gp-alma-22-32a", ref: "Alma 22:32", book: "Alma", chapter: 22, verse: 32, fact: "It was only the distance of a day and a half’s journey for a Nephite on the line Bountiful/Desolation from east to west sea", features: ["narrow-neck", "bountiful-nw", "desolation", "sea-east", "sea-west"], relation: "distance", strength: "hard", passAIds: ["mc-map-06-day-half-neck", "mc-map-01-narrow-neck"] },
  { id: "gp-alma-22-32b", ref: "Alma 22:32", book: "Alma", chapter: 22, verse: 32, fact: "Land of Nephi and land of Zarahemla nearly surrounded by water; small neck of land between land northward and land southward", features: ["narrow-neck", "nephi", "zarahemla"], relation: "boundary", strength: "hard", passAIds: ["mc-map-05-nearly-surrounded"] },
  { id: "gp-alma-22-33", ref: "Alma 22:33", book: "Alma", chapter: 22, verse: 33, fact: "Nephites had inhabited Bountiful from east to west sea; hemmed in Lamanites on south", features: ["bountiful-nw", "sea-east", "sea-west"], relation: "boundary", strength: "hard" },
  { id: "gp-alma-22-34", ref: "Alma 22:34", book: "Alma", chapter: 22, verse: 34, fact: "Had fortified to keep Lamanites from overrunning northward", features: ["bountiful-nw", "narrow-neck"], relation: "boundary", strength: "hard", passAIds: ["mc-map-02-narrow-pass"] },
  // Jershon / coastal
  { id: "gp-alma-27-22", ref: "Alma 27:22", book: "Alma", chapter: 27, verse: 22, fact: "Land of Jershon east by the sea; south of land of Bountiful", features: ["jershon", "sea-east", "bountiful-nw"], relation: "coast", strength: "hard", passAIds: ["mc-map-19-jershon-east-sea"] },
  { id: "gp-alma-27-24", ref: "Alma 27:24", book: "Alma", chapter: 27, verse: 24, fact: "Armies between Jershon and land of Nephi", features: ["jershon", "nephi"], relation: "boundary", strength: "soft" },
  // War geography sample
  { id: "gp-alma-43-22", ref: "Alma 43:22", book: "Alma", chapter: 43, verse: 22, fact: "Lamanites toward land of Manti in south wilderness", features: ["manti", "wilderness"], relation: "direction", strength: "hard" },
  { id: "gp-alma-43-27", ref: "Alma 43:27", book: "Alma", chapter: 43, verse: 27, fact: "Moroni concealed army in valley by bank of river Sidon west", features: ["sidon", "manti"], relation: "hydrology", strength: "hard" },
  { id: "gp-alma-43-32", ref: "Alma 43:32", book: "Alma", chapter: 43, verse: 32, fact: "Part of army in valley on west/east of river Sidon", features: ["sidon"], relation: "hydrology", strength: "hard" },
  { id: "gp-alma-50-8", ref: "Alma 50:8", book: "Alma", chapter: 50, verse: 8, fact: "Land of Nephi ran in straight course from east sea to west", features: ["nephi", "sea-east", "sea-west"], relation: "boundary", strength: "soft" },
  { id: "gp-alma-50-11", ref: "Alma 50:11", book: "Alma", chapter: 50, verse: 11, fact: "Fortifications from east sea to west sea", features: ["sea-east", "sea-west", "bountiful-nw"], relation: "boundary", strength: "hard" },
  { id: "gp-alma-50-13", ref: "Alma 50:13", book: "Alma", chapter: 50, verse: 13, fact: "Began city of Moroni by east sea south", features: ["sea-east"], relation: "coast", strength: "hard", passAIds: ["mc-map-20-east-sea-cities"] },
  { id: "gp-alma-50-14", ref: "Alma 50:14", book: "Alma", chapter: 50, verse: 14, fact: "City of Nephihah between Moroni and Aaron", features: ["sea-east"], relation: "adjacency", strength: "soft" },
  { id: "gp-alma-50-15", ref: "Alma 50:15", book: "Alma", chapter: 50, verse: 15, fact: "Cities of Lehi and Morianton on borders by seashore", features: ["lehi-city", "morianton", "sea-east"], relation: "coast", strength: "hard", passAIds: ["mc-map-20-east-sea-cities"] },
  { id: "gp-alma-50-29", ref: "Alma 50:29", book: "Alma", chapter: 50, verse: 29, fact: "Morianton people flee to land northward", features: ["morianton", "desolation", "narrow-neck"], relation: "travel", strength: "hard", passAIds: ["mc-map-02-narrow-pass"] },
  { id: "gp-alma-50-34", ref: "Alma 50:34", book: "Alma", chapter: 50, verse: 34, fact: "Teancum heads them by the narrow pass which led by the sea into land northward", features: ["narrow-neck", "sea-east"], relation: "boundary", strength: "hard", passAIds: ["mc-map-02-narrow-pass"] },
  { id: "gp-alma-51-26", ref: "Alma 51:26", book: "Alma", chapter: 51, verse: 26, fact: "Amalickiah took many cities on east borders by seashore including Mulek", features: ["mulek", "sea-east"], relation: "coast", strength: "hard" },
  { id: "gp-alma-52-9", ref: "Alma 52:9", book: "Alma", chapter: 52, verse: 9, fact: "Fortify land Bountiful; keep the narrow pass which led into land northward", features: ["bountiful-nw", "narrow-neck"], relation: "boundary", strength: "hard" },
  { id: "gp-alma-63-5", ref: "Alma 63:5", book: "Alma", chapter: 63, verse: 5, fact: "Hagoth built ship on borders of land Bountiful by land Desolation; launched into west sea by the narrow neck", features: ["sea-west", "narrow-neck", "bountiful-nw", "desolation"], relation: "coast", strength: "hard", passAIds: ["mc-map-21-hagoth-west-port"] },
  { id: "gp-hel-3-3", ref: "Helaman 3:3", book: "Helaman", chapter: 3, verse: 3, fact: "Many departed out of Zarahemla into land northward", features: ["zarahemla", "desolation"], relation: "travel", strength: "hard" },
  { id: "gp-hel-3-8", ref: "Helaman 3:8", book: "Helaman", chapter: 3, verse: 8, fact: "Spread from sea south to sea north, sea west to sea east", features: ["sea-west", "sea-east"], relation: "coast", strength: "soft" },
  { id: "gp-hel-4-7", ref: "Helaman 4:7", book: "Helaman", chapter: 4, verse: 7, fact: "Fortification line from west sea to east; Bountiful retained", features: ["sea-west", "sea-east", "bountiful-nw"], relation: "boundary", strength: "hard" },
  // Mormon retreat / Cumorah
  { id: "gp-morm-2-3", ref: "Mormon 2:3", book: "Mormon", chapter: 2, verse: 3, fact: "Lamanites came down against Nephites; retreat", features: ["zarahemla"], relation: "elevation", strength: "soft" },
  { id: "gp-morm-2-6", ref: "Mormon 2:6", book: "Mormon", chapter: 2, verse: 6, fact: "Took flight to land of Joshua by west sea borders", features: ["joshua", "sea-west"], relation: "coast", strength: "hard" },
  { id: "gp-morm-2-16", ref: "Mormon 2:16", book: "Mormon", chapter: 2, verse: 16, fact: "Battle by Angola / borders of Desolation", features: ["desolation"], relation: "location", strength: "hard" },
  { id: "gp-morm-2-29", ref: "Mormon 2:29", book: "Mormon", chapter: 2, verse: 29, fact: "Treaty: Nephites land northward; Lamanites land southward", features: ["narrow-neck", "desolation"], relation: "boundary", strength: "hard", passAIds: ["mc-map-01-narrow-neck"] },
  { id: "gp-morm-3-5", ref: "Mormon 3:5", book: "Mormon", chapter: 3, verse: 5, fact: "Gather to land of Desolation to a city by the narrow pass which led into land southward", features: ["desolation", "narrow-neck"], relation: "boundary", strength: "hard", passAIds: ["mc-map-02-narrow-pass"] },
  { id: "gp-morm-6-2", ref: "Mormon 6:2", book: "Mormon", chapter: 6, verse: 2, fact: "Wrote to Lamanite king to gather at land of Cumorah", features: ["cumorah"], relation: "location", strength: "hard", passAIds: ["mc-map-22-cumorah-vigia"] },
  { id: "gp-morm-6-4", ref: "Mormon 6:4", book: "Mormon", chapter: 6, verse: 4, fact: "Land of Cumorah; many waters, rivers, fountains", features: ["cumorah"], relation: "hydrology", strength: "hard" },
  { id: "gp-morm-6-6", ref: "Mormon 6:6", book: "Mormon", chapter: 6, verse: 6, fact: "Hid records in hill Cumorah except plates given to Moroni", features: ["cumorah"], relation: "location", strength: "hard" },
  // Ether
  { id: "gp-ether-9-3", ref: "Ether 9:3", book: "Ether", chapter: 9, verse: 3, fact: "Omer fled to Ablom by seashore east; hill east of Shim / Cumorah region", features: ["cumorah", "sea-east"], relation: "coast", strength: "soft" },
  { id: "gp-ether-10-20", ref: "Ether 10:20", book: "Ether", chapter: 10, verse: 20, fact: "Built great city by narrow neck; sea east and west; animals in land southward", features: ["narrow-neck", "sea-east", "sea-west"], relation: "boundary", strength: "hard", passAIds: ["mc-map-24-jaredite-great-city-neck"] },
  { id: "gp-ether-15-11", ref: "Ether 15:11", book: "Ether", chapter: 15, verse: 11, fact: "Hill Ramah same as hill Cumorah of Nephites", features: ["cumorah"], relation: "location", strength: "hard", passAIds: ["mc-map-22-cumorah-vigia"] },
];

export function passBStats() {
  return {
    total: mesoGeoPassages.length,
    target: MESO_PASS_B_META.target,
    hard: mesoGeoPassages.filter((p) => p.strength === "hard").length,
    soft: mesoGeoPassages.filter((p) => p.strength === "soft").length,
    pctOfTarget: Math.round((mesoGeoPassages.length / MESO_PASS_B_META.target) * 1000) / 10,
    linkedToPassA: mesoGeoPassages.filter((p) => p.passAIds && p.passAIds.length > 0).length,
  };
}

export function getPassB() {
  const stats = passBStats();
  return {
    meta: MESO_PASS_B_META,
    passages: mesoGeoPassages,
    stats,
    /** Full ~500 not yet; seed loaded */
    loaded: stats.total > 0,
    complete: stats.total >= stats.target,
  };
}
