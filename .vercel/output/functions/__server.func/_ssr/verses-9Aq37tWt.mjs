import { r as __toESM } from "../_runtime.mjs";
import { P as require_react, _ as require_jsx_runtime, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Badge } from "./Badge-kOKntVae.mjs";
import { c as verses } from "./catalog-CJAtBXtA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verses-9Aq37tWt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VersesPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [tag, setTag] = (0, import_react.useState)("all");
	const allTags = (0, import_react.useMemo)(() => {
		const s = /* @__PURE__ */ new Set();
		verses.forEach((v) => v.tags.forEach((t) => s.add(t)));
		return Array.from(s).sort();
	}, []);
	const filtered = verses.filter((v) => {
		const hay = `${v.id} ${v.book} ${v.textExcerpt} ${v.tags.join(" ")}`.toLowerCase();
		const okQ = !q || hay.includes(q.toLowerCase());
		const okTag = tag === "all" || v.tags.includes(tag);
		return okQ && okTag;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl font-semibold",
					children: "Verse catalog"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-ink-soft text-sm max-w-2xl",
					children: "Each unit is a geographic evidence record. Open a verse to see model claims and linked insights. Seed set starts in 1 Nephi; expand via research sessions."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search id, text, tags…",
					className: "flex-1 rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: tag,
					onChange: (e) => setTag(e.target.value),
					className: "rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: "All tags"
					}), allTags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: t,
						children: t
					}, t))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [filtered.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/verses/$verseId",
					params: { verseId: v.id },
					className: "block group",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 md:p-5 transition-colors group-hover:border-border-strong",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 mb-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold text-ink",
										children: [
											v.book,
											" ",
											v.chapter,
											":",
											v.verseStart,
											v.verseEnd !== v.verseStart ? `–${v.verseEnd}` : ""
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: v.plateSource.replaceAll("_", " ") }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										tone: "claim",
										children: [v.modelClaims.length, " claims"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "scripture line-clamp-2 mb-3",
								children: v.textExcerpt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: v.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "default",
									children: t
								}, t))
							})
						]
					})
				}, v.id)), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted py-8 text-center",
					children: "No verses match this filter."
				})]
			})
		]
	});
}
//#endregion
export { VersesPage as component };
