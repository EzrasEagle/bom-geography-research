import { _ as require_jsx_runtime, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Badge } from "./_ssr/Badge-kOKntVae.mjs";
import { l as versesForModel, r as getModel } from "./_ssr/catalog-CJAtBXtA.mjs";
import { t as Route } from "./_modelId-B7DrRTy5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_modelId-VRNuLKRl.js
var import_jsx_runtime = require_jsx_runtime();
function ModelDetailPage() {
	const { modelId } = Route.useParams();
	const m = getModel(modelId);
	if (!m) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Model not found."
	});
	const related = versesForModel(m.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/models",
					className: "text-sm text-muted hover:text-accent",
					children: "← All models"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl font-semibold mt-2",
					children: m.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "accent",
						children: m.category
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: m.status })]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ink-soft leading-relaxed",
					children: m.summary
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Core map (typical)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "grid gap-2 sm:grid-cols-2 text-sm",
					children: Object.entries(m.coreMap).map(([k, val]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-[var(--radius-sm)] bg-surface-2/80 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs uppercase tracking-wide text-muted",
							children: k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "text-ink-soft mt-0.5",
							children: val
						})]
					}, k))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold text-sm",
						children: "Key claims"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "list-disc pl-4 text-sm text-ink-soft space-y-1",
						children: m.keyClaims.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: c }, c))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold text-sm",
						children: "Strengths claimed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "list-disc pl-4 text-sm text-ink-soft space-y-1",
						children: m.strengths.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: c }, c))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold text-sm",
					children: "Common criticisms"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-4 text-sm text-ink-soft space-y-1",
					children: m.criticisms.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: c }, c))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Seed verses with claims for this model"
				}), related.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No seed claims yet — catalog more verses."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: related.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/verses/$verseId",
						params: { verseId: v.id },
						className: "text-sm text-accent hover:underline",
						children: [
							v.book,
							" ",
							v.chapter,
							":",
							v.verseStart
						]
					}) }, v.id))
				})]
			})
		]
	});
}
//#endregion
export { ModelDetailPage as component };
