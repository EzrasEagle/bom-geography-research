/**
 * In-app embedded definitions (no leave required).
 * 1) Curated BoM lexicon (instant)
 * 2) Free Dictionary API (modern English senses)
 * 3) bible-api.com KJV sample verses for the word (search via fixed common refs + freeform note)
 */

import { dynamicLexiconLookup, type DynamicLexiconResult } from "@/data/lexicon";

export type EmbeddedSense = {
  source: "curated" | "free_dictionary" | "kjv_api";
  title: string;
  body: string;
};

export type EmbeddedLexicon = {
  query: string;
  curated: DynamicLexiconResult;
  senses: EmbeddedSense[];
  loading: boolean;
  error?: string;
};

type FreeDictMeaning = {
  partOfSpeech?: string;
  definitions?: { definition: string; example?: string }[];
};

type FreeDictEntry = {
  word?: string;
  phonetic?: string;
  meanings?: FreeDictMeaning[];
};

/** Cache so re-selecting the same word is instant */
const cache = new Map<string, EmbeddedSense[]>();

export async function fetchEmbeddedLexicon(raw: string): Promise<EmbeddedLexicon> {
  const curated = dynamicLexiconLookup(raw);
  const query = curated.query;
  if (!query) {
    return { query: "", curated, senses: [], loading: false };
  }

  const key = query.toLowerCase();
  const senses: EmbeddedSense[] = [];

  if (curated.curated) {
    senses.push({
      source: "curated",
      title: `Curated · ${curated.curated.term}`,
      body: [
        curated.curated.ambiguity,
        "",
        `Webster 1828 (curated): ${curated.curated.webster1828}`,
        "",
        `KJV notes (curated): ${curated.curated.kjvNotes}`,
      ].join("\n"),
    });
  }

  if (cache.has(key)) {
    const cached = cache.get(key)!;
    // Merge curated on top if not already
    const rest = cached.filter((s) => s.source !== "curated");
    return {
      query,
      curated,
      senses: [...senses.filter((s) => s.source === "curated"), ...rest],
      loading: false,
    };
  }

  // Free Dictionary API — modern English (CORS-friendly)
  try {
    const head = query.split(/\s+/)[0]!.toLowerCase();
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(head)}`,
    );
    if (res.ok) {
      const data = (await res.json()) as FreeDictEntry[];
      const entry = data[0];
      if (entry?.meanings?.length) {
        const parts: string[] = [];
        if (entry.phonetic) parts.push(`Pronunciation: ${entry.phonetic}`);
        for (const m of entry.meanings.slice(0, 3)) {
          parts.push(`\n${m.partOfSpeech ?? "sense"}:`);
          for (const d of (m.definitions ?? []).slice(0, 2)) {
            parts.push(`• ${d.definition}`);
            if (d.example) parts.push(`  e.g. “${d.example}”`);
          }
        }
        senses.push({
          source: "free_dictionary",
          title: `English dictionary · “${entry.word ?? head}”`,
          body: parts.join("\n").trim(),
        });
      }
    }
  } catch {
    /* offline / blocked — ignore */
  }

  // KJV sample: try a few well-known verses that often contain common words via bible-api
  // For arbitrary words, use bible-api search is not available; we fetch Genesis 1 and Psalms snippets
  // only when headword is very common — otherwise skip.
  try {
    const head = query.split(/\s+/)[0]!.toLowerCase();
    // bible-api single verse that we know is useful for a few words
    const kjvProbes: Record<string, string> = {
      wilderness: "mark 1:3",
      copper: "ezra 8:27",
      brass: "exodus 27:2",
      gold: "genesis 2:12",
      silver: "genesis 13:2",
      forest: "isaiah 10:19",
      forests: "isaiah 10:19",
      land: "genesis 12:1",
      sea: "exodus 14:21",
      river: "genesis 2:10",
      down: "genesis 12:10",
      up: "genesis 13:1",
      tent: "genesis 12:8",
      tents: "genesis 13:5",
      ore: "job 28:2",
      iron: "genesis 4:22",
      wood: "genesis 6:14",
      beasts: "genesis 1:24",
      beast: "genesis 1:24",
      days: "genesis 1:14",
      sailed: "acts 27:1",
      ship: "acts 27:1",
    };
    const probe = kjvProbes[head];
    if (probe) {
      const res = await fetch(
        `https://bible-api.com/${encodeURIComponent(probe)}?translation=kjv`,
      );
      if (res.ok) {
        const data = (await res.json()) as {
          reference?: string;
          text?: string;
          translation_name?: string;
        };
        if (data.text) {
          senses.push({
            source: "kjv_api",
            title: `KJV sample · ${data.reference ?? probe}`,
            body: data.text.trim().replace(/\s+/g, " "),
          });
        }
      }
    }
  } catch {
    /* ignore */
  }

  // Cache non-curated extras
  cache.set(
    key,
    senses.filter((s) => s.source !== "curated"),
  );

  return { query, curated, senses, loading: false };
}
