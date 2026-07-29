import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const verses = readFileSync(resolve(root, "data/catalog/verses.csv"), "utf8").trim().split("\n");
const models = readFileSync(resolve(root, "data/catalog/models.csv"), "utf8").trim().split("\n");
console.log(`verses rows: ${verses.length - 1}`);
console.log(`models rows: ${models.length - 1}`);
console.log("catalog files readable OK");
