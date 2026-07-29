import { _ as require_jsx_runtime, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Badge } from "./Badge-kOKntVae.mjs";
import { c as verses, o as models, s as stats } from "./catalog-CJAtBXtA.mjs";
import { c as BookOpen, l as ArrowRight, n as Map, r as Lightbulb, t as Scale } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-IYf7cU6C.js
var import_jsx_runtime = require_jsx_runtime();
function HomePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "teal",
							children: "Research atlas · dual track"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-serif text-4xl md:text-5xl font-semibold tracking-tight text-ink leading-[1.15]",
							children: "Weigh every model against the text—and against the ground truth you gather."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg text-ink-soft max-w-2xl leading-relaxed",
							children: "A verse-by-verse catalog of Book of Mormon geographic clues, each model’s claims with sources, and a parallel insights track for travel, climate, flora, hydrology, and history."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-3 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/verses",
								className: "inline-flex items-center gap-2 rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-soft transition-colors",
								children: ["Browse verses ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/framework",
								className: "inline-flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2 transition-colors",
								children: "Read the framework"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-5 grid grid-cols-2 gap-4",
					children: [
						{
							label: "Verse units",
							value: stats.verseCount
						},
						{
							label: "Models tracked",
							value: stats.modelCount
						},
						{
							label: "Model claims",
							value: stats.claimCount
						},
						{
							label: "Insights",
							value: stats.insightCount
						}
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-[var(--radius)] bg-surface-2/80 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-semibold text-ink tabular-nums",
							children: s.value
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted mt-0.5",
							children: s.label
						})]
					}, s.label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					{
						to: "/verses",
						icon: BookOpen,
						title: "Verse catalog",
						body: "Book / chapter / verse units with clues, tags, plate source, and competing claims."
					},
					{
						to: "/models",
						icon: Map,
						title: "Geography models",
						body: "Mesoamerica, Heartland, Baja, South America, Malay, and internal-only profiles."
					},
					{
						to: "/insights",
						icon: Lightbulb,
						title: "Independent insights",
						body: "Travel times, crop viability, hydrology—evidence that isn’t owned by one map."
					}
				].map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: "group",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "h-full p-5 transition-transform group-hover:-translate-y-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5 text-accent mb-3" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-semibold text-ink mb-1",
									children: item.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted leading-relaxed",
									children: item.body
								})
							]
						})
					}, item.to);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: "h-5 w-5 text-claim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "How to use this atlas"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "list-decimal pl-5 space-y-2 text-sm text-ink-soft leading-relaxed",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Start with the textual framework (Small Plates vs abridgment)." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Open high-signal verses (landing, seeds, narrow neck, Sidon, Cumorah)." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Compare model claims side-by-side—read the “why,” not only the pin." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Consult insights for external context, then decide what weight you give each line of evidence." })
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Seed catalog highlights"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: verses.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/verses/$verseId",
								params: { verseId: v.id },
								className: "text-sm text-accent hover:underline font-medium",
								children: [
									v.book,
									" ",
									v.chapter,
									":",
									v.verseStart
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted",
								children: [" — ", v.tags.slice(0, 3).join(", ")]
							})] }, v.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted pt-2",
							children: [models.length, " models registered · expand via research/verses and data/catalog"]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { HomePage as component };
