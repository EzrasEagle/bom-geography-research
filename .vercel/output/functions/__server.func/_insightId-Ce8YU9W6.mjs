import { _ as require_jsx_runtime, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./_insightId-C_CunEqk.mjs";
import { n as Card, t as Badge } from "./_ssr/Badge-kOKntVae.mjs";
import { n as getInsight, r as getModel } from "./_ssr/catalog-CJAtBXtA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_insightId-Ce8YU9W6.js
var import_jsx_runtime = require_jsx_runtime();
function InsightDetailPage() {
	const { insightId } = Route.useParams();
	const ins = getInsight(insightId);
	if (!ins) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Insight not found."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/insights",
					className: "text-sm text-muted hover:text-accent",
					children: "← All insights"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl font-semibold mt-2",
					children: ins.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "insight",
						children: ins.category
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: ins.confidence })]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ink-soft leading-relaxed whitespace-pre-wrap",
					children: ins.body
				})
			}),
			ins.relevanceToModels.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "May inform these models"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: ins.relevanceToModels.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/models/$modelId",
						params: { modelId: id },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "claim",
							children: getModel(id)?.name ?? id
						})
					}, id))
				})]
			}),
			ins.relatedVerses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Related verses"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: ins.relatedVerses.map((vid) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/verses/$verseId",
						params: { verseId: vid },
						className: "text-sm text-accent hover:underline",
						children: vid
					}) }, vid))
				})]
			})
		]
	});
}
//#endregion
export { InsightDetailPage as component };
