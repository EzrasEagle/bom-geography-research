/**
 * Detect relational situating language in BoM geography verses.
 * "east of the river Sidon, which ran by the land of Zarahemla"
 */

import { findPlaceByNameOrId, allPlaces } from "@/lib/user-places";
import type { AssociationKind } from "@/data/suggested-associations";

export type DetectedRelation = {
  id: string;
  subjectPhrase: string;
  subjectPlaceId?: string;
  relation: "east_of" | "west_of" | "north_of" | "south_of" | "by" | "near" | "in" | "on" | "borders";
  objectPhrase: string;
  objectPlaceId?: string;
  raw: string;
  /** Suggested association kind for Association Builder */
  suggestedKind: AssociationKind;
  viaPhrase: string;
};

const REL_PATTERNS: {
  re: RegExp;
  relation: DetectedRelation["relation"];
  kind: AssociationKind;
}[] = [
  {
    re: /\b(?:which\s+was\s+)?east\s+of\s+(?:the\s+)?([^,;.]+)/gi,
    relation: "east_of",
    kind: "proximity",
  },
  {
    re: /\b(?:which\s+was\s+)?west\s+of\s+(?:the\s+)?([^,;.]+)/gi,
    relation: "west_of",
    kind: "proximity",
  },
  {
    re: /\b(?:which\s+was\s+)?north\s+of\s+(?:the\s+)?([^,;.]+)/gi,
    relation: "north_of",
    kind: "proximity",
  },
  {
    re: /\b(?:which\s+was\s+)?south\s+of\s+(?:the\s+)?([^,;.]+)/gi,
    relation: "south_of",
    kind: "proximity",
  },
  {
    re: /\bran\s+by\s+(?:the\s+)?([^,;.]+)/gi,
    relation: "by",
    kind: "river",
  },
  {
    re: /\bby\s+the\s+([^,;.]+)/gi,
    relation: "by",
    kind: "proximity",
  },
  {
    re: /\bnear\s+(?:unto\s+)?(?:the\s+)?([^,;.]+)/gi,
    relation: "near",
    kind: "proximity",
  },
  {
    re: /\bin\s+the\s+(land\s+of\s+[^,;.]+|city\s+of\s+[^,;.]+|wilderness[^,;.]*)/gi,
    relation: "in",
    kind: "contains",
  },
  {
    re: /\bon\s+the\s+(east|west|north|south)\s+(?:borders?|side)?\s*(?:by\s+the\s+)?([^,;.]+)?/gi,
    relation: "on",
    kind: "proximity",
  },
  {
    re: /\bborders?\s+of\s+(?:the\s+)?([^,;.]+)/gi,
    relation: "borders",
    kind: "proximity",
  },
];

/** Pull likely place-like subjects: hill X, city of X, land of X, the X */
function findSubjects(text: string): { phrase: string; placeId?: string }[] {
  const out: { phrase: string; placeId?: string }[] = [];
  const patterns = [
    /\b(?:the\s+)?hill\s+([A-Za-z][A-Za-z\-']+)/gi,
    /\b(?:the\s+)?city\s+of\s+([A-Za-z][A-Za-z\-']+)/gi,
    /\b(?:the\s+)?land\s+of\s+([A-Za-z][A-Za-z\-']+)/gi,
    /\b(?:the\s+)?valley\s+of\s+([A-Za-z][A-Za-z\-']+)/gi,
    /\b(?:the\s+)?river\s+([A-Za-z][A-Za-z\-']+)/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      const phrase = m[0].replace(/^the\s+/i, "").trim();
      const hit = findPlaceByNameOrId(phrase) || findPlaceByNameOrId(m[1]!);
      out.push({ phrase, placeId: hit?.id });
    }
  }
  // also known place names appearing in text
  for (const p of allPlaces()) {
    if (text.toLowerCase().includes(p.name.toLowerCase())) {
      out.push({ phrase: p.name, placeId: p.id });
    }
    for (const a of p.aliases ?? []) {
      if (a.length > 3 && text.toLowerCase().includes(a.toLowerCase())) {
        out.push({ phrase: a, placeId: p.id });
      }
    }
  }
  // dedupe by phrase
  const seen = new Set<string>();
  return out.filter((s) => {
    const k = s.phrase.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function resolveObject(objRaw: string): { phrase: string; placeId?: string } {
  let phrase = objRaw.trim().replace(/\s+/g, " ");
  // strip trailing relative clauses
  phrase = phrase.replace(/\s+which\b.*$/i, "").trim();
  phrase = phrase.replace(/\s+and\s+there\b.*$/i, "").trim();
  const hit =
    findPlaceByNameOrId(phrase) ||
    findPlaceByNameOrId(phrase.replace(/^the\s+/i, "")) ||
    findPlaceByNameOrId(phrase.replace(/^(river|land|city|hill)\s+/i, ""));
  return { phrase, placeId: hit?.id };
}

/**
 * Detect relations in a verse. Subject is chosen as nearest preceding place-like phrase.
 */
export function detectRelationsInText(text: string): DetectedRelation[] {
  const subjects = findSubjects(text);
  const results: DetectedRelation[] = [];
  let n = 0;

  for (const pat of REL_PATTERNS) {
    const re = new RegExp(pat.re.source, pat.re.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const raw = m[0];
      const objPart = (m[1] || m[2] || "").trim();
      if (!objPart || objPart.length < 2) continue;
      const obj = resolveObject(objPart);

      // subject: last subject starting before this match
      const idx = m.index;
      let subject = subjects.filter((s) => {
        const si = text.toLowerCase().indexOf(s.phrase.toLowerCase());
        return si >= 0 && si < idx;
      });
      // pick closest
      subject.sort((a, b) => {
        const ai = text.toLowerCase().lastIndexOf(a.phrase.toLowerCase(), idx);
        const bi = text.toLowerCase().lastIndexOf(b.phrase.toLowerCase(), idx);
        return bi - ai;
      });
      const sub = subject[0] ?? { phrase: "?", placeId: undefined };

      // special: "ran by" — subject is often the river just mentioned
      let subFinal = sub;
      if (pat.relation === "by" && /ran\s+by/i.test(raw)) {
        const river = subjects.find((s) => /river|sidon/i.test(s.phrase));
        if (river) subFinal = river;
      }

      results.push({
        id: `rel-${n++}`,
        subjectPhrase: subFinal.phrase,
        subjectPlaceId: subFinal.placeId,
        relation: pat.relation,
        objectPhrase: obj.phrase,
        objectPlaceId: obj.placeId,
        raw,
        suggestedKind:
          /sidon|river/i.test(obj.phrase) || /sidon|river/i.test(subFinal.phrase)
            ? pat.relation === "by"
              ? "river"
              : "proximity"
            : pat.kind,
        viaPhrase: raw.trim(),
      });
    }
  }

  return results;
}

export function relationLabel(r: DetectedRelation["relation"]): string {
  switch (r) {
    case "east_of":
      return "east of";
    case "west_of":
      return "west of";
    case "north_of":
      return "north of";
    case "south_of":
      return "south of";
    case "by":
      return "by";
    case "near":
      return "near";
    case "in":
      return "in";
    case "on":
      return "on";
    case "borders":
      return "borders of";
  }
}
