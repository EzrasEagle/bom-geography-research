import { _ as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Badge } from "./Badge-kOKntVae.mjs";
import { t as frameworkSections } from "./catalog-CJAtBXtA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/framework-3h5hAej0.js
var import_jsx_runtime = require_jsx_runtime();
function FrameworkPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "teal",
						children: "Book · 00-framework"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-3xl md:text-4xl font-semibold text-ink",
						children: "Structural framework"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-ink-soft leading-relaxed",
						children: [
							"High-level composition history and method before the verse-by-verse walkthrough. Full draft lives in ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-sm bg-surface-2 px-1 rounded",
								children: "book/00-framework/"
							}),
							"."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-xl font-semibold",
						children: "Small Plates — largely intact"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-ink-soft leading-relaxed",
						children: "After the loss of the 116 pages, Mormon inserted the small plates of Nephi he had found. 1 Nephi through Omni preserve Nephi’s and successors’ records with minimal Mormon re-narration. Words of Mormon is the bridge. For geography, early travel, Bountiful (Old World), the voyage, landing, and seed-planting are high-signal first-person data."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-ink-soft leading-relaxed",
						children: "The bulk of Mosiah–Mormon is Mormon’s abridgment of the large plates; Moroni contributes the close and Ether. Tag every catalog unit with its plate source."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: frameworkSections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold text-lg",
						children: s.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-ink-soft leading-relaxed whitespace-pre-wrap",
						children: s.body
					})]
				}, s.id))
			})
		]
	});
}
//#endregion
export { FrameworkPage as component };
