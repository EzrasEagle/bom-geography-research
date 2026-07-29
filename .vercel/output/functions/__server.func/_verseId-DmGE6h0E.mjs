import { _ as require_jsx_runtime, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Badge } from "./_ssr/Badge-kOKntVae.mjs";
import { i as getVerse, n as getInsight, r as getModel } from "./_ssr/catalog-CJAtBXtA.mjs";
import { t as Route } from "./_verseId-C1B8Tpqp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_verseId-DmGE6h0E.js
var import_jsx_runtime = require_jsx_runtime();
function VerseDetailPage() {
	const { verseId } = Route.useParams();
	const v = getVerse(verseId);
	if (!v) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-serif text-2xl",
			children: "Verse not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/verses",
			className: "text-accent text-sm hover:underline",
			children: "Back to catalog"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/verses",
					className: "text-sm text-muted hover:text-accent",
					children: "← All verses"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-serif text-3xl font-semibold mt-2",
					children: [
						v.book,
						" ",
						v.chapter,
						":",
						v.verseStart
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "teal",
						children: v.plateSource.replaceAll("_", " ")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: ["Speaker: ", v.speaker] })]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5 md:p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "scripture",
					children: v.textExcerpt
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Geographic clues"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: v.clues.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs uppercase tracking-wide text-muted mb-1",
								children: c.type
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-ink-soft",
								children: c.summary
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1 mt-2",
								children: c.rawTerms.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t))
							})
						]
					}, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "label-claim",
						children: "Model claims"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Comparative — not endorsements"
					})]
				}), v.modelClaims.map((c, i) => {
					const m = getModel(c.modelId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 space-y-2 border-l-4 border-l-claim/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/models/$modelId",
									params: { modelId: c.modelId },
									className: "font-semibold text-claim hover:underline",
									children: m?.name ?? c.modelId
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "claim",
									children: c.confidence
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-ink",
								children: c.claim
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-ink-soft",
									children: "Why: "
								}), c.why]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "text-xs text-muted list-disc pl-4",
								children: c.sources.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, s))
							})
						]
					}, i);
				})]
			}),
			v.insightIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "label-insight",
					children: "Linked insights"
				}), v.insightIds.map((id) => {
					const ins = getInsight(id);
					if (!ins) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/insights/$insightId",
						params: { insightId: id },
						className: "block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4 border-l-4 border-l-insight/50 hover:border-border-strong",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-insight",
								children: ins.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted mt-1",
								children: ins.summary
							})]
						})
					}, id);
				})]
			}),
			v.ourNotes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4 bg-surface-2/50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-wide text-muted mb-1",
					children: "Editorial notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ink-soft",
					children: v.ourNotes
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: v.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t))
			})
		]
	});
}
//#endregion
export { VerseDetailPage as component };
