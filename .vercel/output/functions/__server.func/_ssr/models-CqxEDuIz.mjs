import { _ as require_jsx_runtime, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Badge } from "./Badge-kOKntVae.mjs";
import { l as versesForModel, o as models } from "./catalog-CJAtBXtA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/models-CqxEDuIz.js
var import_jsx_runtime = require_jsx_runtime();
function ModelsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl font-semibold",
				children: "Geography models"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ink-soft max-w-2xl",
				children: "Profiles summarize each model’s map and arguments. Claims on individual verses live on the verse records so you can compare without conflating frameworks."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2",
			children: models.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/models/$modelId",
				params: { modelId: m.id },
				className: "group",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "h-full p-5 space-y-3 transition-transform group-hover:-translate-y-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "accent",
									children: m.category
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: m.status }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									tone: "claim",
									children: [versesForModel(m.id).length, " verses in seed"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold text-lg leading-snug",
							children: m.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted leading-relaxed",
							children: m.summary
						})
					]
				})
			}, m.id))
		})]
	});
}
//#endregion
export { ModelsPage as component };
