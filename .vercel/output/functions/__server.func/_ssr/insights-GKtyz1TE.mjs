import { _ as require_jsx_runtime, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Badge } from "./Badge-kOKntVae.mjs";
import { a as insights } from "./catalog-CJAtBXtA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/insights-GKtyz1TE.js
var import_jsx_runtime = require_jsx_runtime();
function InsightsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl font-semibold",
				children: "Independent insights"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ink-soft max-w-2xl",
				children: "Dual-track research: facts and analyses that help evaluate geography without belonging to a single model (travel corridors, crops, climate, hydrology, history)."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: insights.map((ins) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/insights/$insightId",
				params: { insightId: ins.id },
				className: "block group",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 space-y-2 border-l-4 border-l-insight/40 group-hover:border-border-strong",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "insight",
								children: ins.category
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: ins.confidence })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: ins.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: ins.summary
						})
					]
				})
			}, ins.id))
		})]
	});
}
//#endregion
export { InsightsPage as component };
